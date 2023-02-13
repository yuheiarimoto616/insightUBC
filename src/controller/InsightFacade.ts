import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";
import Section from "./Section";
import Dataset from "./Dataset";

import fs from "fs-extra";
import JSZip from "jszip";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private datasets: Dataset[];

	constructor() {
		this.datasets = [];
		// let files: string[] = fs.readdirSync("./data");
		// for (let file of files) {
		// 	const packageObj = fs.readJsonSync(file);
		//
		// }
	}

	public isInvalidID(id: string): boolean {
		let invalid = new RegExp(/^[^_]+$/);
		let onlySpace = new RegExp(/^\s*$/);
		if (!invalid.test(id) || onlySpace.test(id)) {
			return true;
		}

		// TODO: test
		for (let ds of this.datasets) {
			if (id === ds.getID()) {
				return true;
			}
		}

		return false;
	}

	// TODO: make it shorter; add helpers
	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		// checks if id is valid
		if (this.isInvalidID(id)) {
			return Promise.reject(new InsightError("Invalid id"));
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
				let sec = new Section(section.id, section.Course, section.Title, section.Professor,
					section.Subject, section.Year, section.Avg, section.Pass, section.Fail, section.Audit);
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
		let filteredDataset = [];
		let filteredArray = [];

		if (this.validateQueryKeys(query)) {
			if (this.evaluateQueryKeys(query)) {
				let where = query["WHERE"];
				let options = query["OPTIONS"];
				// TODO Obtain datasetID first we need to checks [OPTIONS] first
				if (this.validateQueryKeys(options)) {
					let order = options["ORDER"];
					let columns = options["COLUMNS"];
					let columnLine = JSON.stringify(columns);
					const iD = this.datasets[1].getID(); // TODO Don't know how to get each ID from dataset (For loop?)
						// TODO check [WHERE] after
						// TODO I branch into right side of "sections (ubc)"
					if (this.validateQueryKeys(where)) {
							// TODO Filter "OR AND NOT GT LT EQ"
							// TODO In filter recursively check for query operator (E.g.: OR AND NOT)
							// TODO getDatasetID to check for "sections (ubc)"

							// TODO Filter Columns via right column of "sections"
							// TODO Sort helper that sorts out the columns (COLUMNS VS ORDER)
							// TODO return filteredDataset (via Promise.resolve(filteredDataset))
					}
				}
			}
		}


		return Promise.reject("Not implemented.");
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

	/* Helper Function for performQuery */

	// TODO Returns the filtered query after being filtered by the section.
	public filterQuery(next: unknown, dataset: any[]): any[] {
		return [];
	}

	// TODO Checks to see if the queries have proper EBNF query format. E.g.: [Options] and [Where]
	public validateQueryKeys(query: unknown): query is Record<string, unknown>  {
		return false;
	}

	// TODO Checks to see if it has the following EBNF query keys.
	public evaluateQueryKeys(query: unknown): boolean {
		return false;
	}

	// TODO Returns the filtered query after being filtered by the section.
	public getDatasetSections(section: unknown, dataset: Dataset): string {
		return "";
	}


}
