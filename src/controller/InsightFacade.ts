import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError
} from "./IInsightFacade";
import Section from "./Section";
import Dataset from "./Dataset";

import fs from "fs-extra";
import JSZip from "jszip";
import QueryParserValidator from "./QueryParserValidator";
import QueryExecutor from "./QueryExecutor";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private datasets: Dataset[];

	constructor() {
		this.datasets = [];

		if(fs.existsSync("data")) {
			fs.readdirSync("data").forEach((value) => {
				let jsonObject = fs.readJsonSync("data/" + value);

				let ds = new Dataset(jsonObject.id, jsonObject.kind);
				for (let s of jsonObject.sections) {
					let section: Section = new Section(s._id, s._Course, s._Title, s._Professor,
						s._Subject, s._Year, s._Avg, s._Pass, s._Fail, s._Audit);
					ds.addSection(section);
				}
				this.datasets.push(ds);
			});
		}
	}

	public isInvalidID(id: string): boolean {
		let invalid = new RegExp(/^[^_]+$/);
		let onlySpace = new RegExp(/^\s*$/);
		if (!invalid.test(id) || onlySpace.test(id)) {
			return true;
		}

		for (let ds of this.datasets) {
			if (id === ds.getID()) {
				return true;
			}
		}

		return false;
	}

	// TODO: kind = room invalid
	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		// checks if id is valid
		if (this.isInvalidID(id)) {
			return Promise.reject(new InsightError("Invalid id"));
		}

		if (kind === InsightDatasetKind.Rooms) {
			return Promise.reject(new InsightError("Invalid kind"));
		}

		let ret: string[] = [];
		let dataset = new Dataset(id, kind);
		let zip = new JSZip();

		try {
			await zip.loadAsync(content, {base64: true});
		} catch (e) {
			return Promise.reject(new InsightError("Not zip file"));
		}
		// TODO: fix it (regex); doesn't catch folder name that contains "courses" (such as courses 2)
		if (zip.folder(/courses/).length === 0) {
			return Promise.reject(new InsightError("courses folder does not exit"));
		}

		let jobs: any = [];
		zip.folder("courses");
		zip.forEach( (relativePath, file) => {
			if (/^courses\/[^.]+/.test(relativePath)) {
				let course = zip.file(relativePath);

				jobs.push(course?.async("string"));
			}
		});

		const jobResults = await Promise.all(jobs);
		// TODO: "Is a JSON formatted file"
		this.addSections(jobResults, dataset);

		// TODO: "contains at least one valid section"
		this.datasets.push(dataset);
		for (let ds of this.datasets) {
			ret.push(ds.getID());
		}

		try {
			await fs.outputJson("data/" + id + ".json", dataset);
		} catch (e) {
			return Promise.reject(new InsightError("writeJSON failed"));
		}

		return Promise.resolve(ret);
	}

	private addSections(jobResults: any, dataset: Dataset) {
		for (const result of jobResults) {
			let jsonObject = JSON.parse(result);
			let sections: any[] = jsonObject.result;

			for (let section of sections) {
				// TODO: check if the section is valid
				// TODO: also type check
				// TODO: if section.id = "overall", year = 1900
				let sec = new Section(section.id + "", section.Course + "", section.Title + "",
					section.Professor + "", section.Subject + "", section.Year * 1,
					section.Avg * 1, section.Pass * 1, section.Fail * 1, section.Audit * 1);
				dataset.addSection(sec);
			}
		}
	}

	public async removeDataset(id: string): Promise<string> {
		let invalid = new RegExp(/^[^_]+$/);
		let onlySpace = new RegExp(/^\s*$/);

		if (!invalid.test(id) || onlySpace.test(id)) {
			return Promise.reject(new InsightError("Invalid id"));
		}

		for (let i = 0; i <= this.datasets.length; i++) {
			if (i === this.datasets.length) {
				return Promise.reject(new NotFoundError("dataset with the given id does not exist"));
			}
			if (this.datasets[i].getID() === id) {
				this.datasets.splice(i, 1);
				break;
			}
		}

		try {
			await fs.remove("data/" + id + ".json");
		} catch (e) {
			return Promise.reject(new InsightError(""));
		}

		return Promise.resolve(id);
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		let ret: InsightResult[] = [];

		let queryParserValidator = new QueryParserValidator();
		if (!queryParserValidator.validateQuery(query)) {
			return Promise.reject(new InsightError("Invalid Query"));
		}

		let referencedDataset = null;
		for (let ds of this.datasets) {
			if (ds.getID() === queryParserValidator.getReferencedID()) {
				referencedDataset = ds.getSections();
			}
		}

		if (referencedDataset == null) {
			return Promise.reject(new InsightError("Referencing a dataset not added"));
		}

		let queryExecutor = new QueryExecutor(queryParserValidator.getQuery());
		try {
			ret = queryExecutor.executeQuery(referencedDataset);
		} catch (e) {
			return Promise.reject(new ResultTooLargeError(e as string));
		}

		return Promise.resolve(ret);
	}

	public listDatasets(): Promise<InsightDataset[]> {
		const ret: InsightDataset[] = [];
		for (let ds of this.datasets) {
			let iDataset: InsightDataset = {
				id: ds.getID(),
				kind: ds.getKind(),
				numRows: ds.getSections().length
			};

			ret.push(iDataset);
		}

		return Promise.resolve(ret);
	}
}
