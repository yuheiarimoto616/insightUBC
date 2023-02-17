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

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
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
		this.addSections(jobResults, dataset);
		if (dataset.getSections().length === 0) {
			return Promise.reject(new InsightError("Invalid dataset with no valid section "));
		}

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
			let jsonObject;

			try {
				jsonObject = JSON.parse(result);
			} catch (e) {
				continue;
			}

			if (!Object.hasOwn(jsonObject, "result")) {
				continue;
			}

			let sections: any[] = jsonObject.result;

			for (let section of sections) {
				if (this.hasValidFields(section)) {
					let sec: Section;
					if (Object.hasOwn(section, "Section") && ((section.Section + "") === "overall")) {
						sec = new Section(section.id + "", section.Course + "", section.Title + "",
							section.Professor + "", section.Subject + "", 1900,
							section.Avg * 1, section.Pass * 1, section.Fail * 1, section.Audit * 1);
					} else {
						sec = new Section(section.id + "", section.Course + "", section.Title + "",
							section.Professor + "", section.Subject + "", section.Year * 1,
							section.Avg * 1, section.Pass * 1, section.Fail * 1, section.Audit * 1);
					}

					dataset.addSection(sec);
				}
			}
		}
	}

	private hasValidFields(section: any) {
		let hasAllFields = Object.hasOwn(section, "id") && Object.hasOwn(section, "Course")
			&& Object.hasOwn(section, "Title") && Object.hasOwn(section, "Professor")
			&& Object.hasOwn(section, "Subject") && Object.hasOwn(section, "Year")
			&& Object.hasOwn(section, "Avg") && Object.hasOwn(section, "Pass")
			&& Object.hasOwn(section, "Fail") && Object.hasOwn(section, "Audit");

		let hasValidTypes = ((typeof section.id === "string") || typeof section.id === "number")
			&& ((typeof section.Course === "string") || typeof section.Course === "number")
			&& (typeof section.Title === "string")
			&& (typeof section.Professor === "string")
			&& (typeof section.Subject === "string")
			&& ((typeof section.Year === "string") || typeof section.Year === "number")
			&& ((typeof section.Avg === "string") || typeof section.Avg === "number")
			&& ((typeof section.Pass === "string") || typeof section.Pass === "number")
			&& ((typeof section.Fail === "string") || typeof section.Fail === "number")
			&& ((typeof section.Audit === "string") || typeof section.Audit === "number");

		return hasAllFields && hasValidTypes;
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
