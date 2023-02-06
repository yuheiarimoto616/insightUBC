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
import {rejects} from "assert";

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
		if (!/[^_]+/.test(id)) {
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

		zip.folder("courses");

		let jobs: any = [];
		zip.forEach( (relativePath, file) => {
			if (/^courses\/[^.]+/.test(relativePath)) {
				let course = zip.file(relativePath);

				jobs.push(course?.async("string"));
			}
		});

		const jobResults = await Promise.all(jobs);
		// TODO: "Is a JSON formatted file"
		for (const result of jobResults) {
			let jsonObject = JSON.parse(result);
			let sections: any[] = jsonObject.result;

			for (let section of sections) {
				// TODO: check if the section is valid
				let sec = new Section(section.id, section.Course, section.Title, section. Professor,
					section.Subject, section.Year, section.Avg, section.Pass, section.Fail, section.Audit);

				dataset.addSection(sec);
			}
		}

		// TODO: "contains at least one valid section"
		this.datasets.push(dataset);
		for (let ds of this.datasets) {
			ret.push(ds.getID());
		}
		return Promise.resolve(ret);
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.reject("Not implemented.");
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
}
