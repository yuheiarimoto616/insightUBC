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

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		// checks if id is valid
		let idString = new RegExp("[^_]+");
		if (!idString.test(id)) {
			return Promise.reject(new InsightError("Invalid id"));
		}

		// TODO: test
		for (let ds of this.datasets) {
			if (id === ds.getID()) {
				return Promise.reject(new InsightError("id already exists"));
			}
		}

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

		zip.forEach(function (relativePath, file){
			if (!(relativePath.includes("MACOSX") || relativePath.includes("DS_Store"))) {
				let a = zip.file(relativePath);
				a?.async("string").then(function (st) {
					console.log(JSON.parse(st));
				});
			}
		});

		return Promise.reject(new InsightError("done"));
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
