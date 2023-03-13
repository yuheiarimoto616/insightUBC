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
import SectionsDataset from "./SectionsDataset";
import RoomsDataset from "./RoomsDataset";
import Room from "./Room";
import {secureHeapUsed} from "crypto";
import parse5, {defaultTreeAdapter} from "parse5";
import {ChildNode, Element, TextNode} from "parse5/dist/tree-adapters/default";
import {Attribute} from "parse5/dist/common/token";
import Building from "./Building";

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

				let ds;
				if (jsonObject.kind === InsightDatasetKind.Sections) {
					ds = new SectionsDataset(jsonObject.id);
					for (let s of jsonObject.sections) {
						let section: Section = new Section(s._id, s._Course, s._Title, s._Professor,
							s._Subject, s._Year, s._Avg, s._Pass, s._Fail, s._Audit);
						ds.addSection(section);
					}
				} else {
					ds = new RoomsDataset(jsonObject.id);
					for (let r of jsonObject.rooms) {
						let buildingObj = r.building;
						let building: Building = new Building(buildingObj.fullName, buildingObj.shortName,
							buildingObj.address, buildingObj.link, buildingObj.lat, buildingObj.lon);
						let room: Room = new Room(building, r.number, r.seats, r.type, r.furniture, r.href);
						ds.addRoom(room);
					}
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

		let dataset: Dataset;

		if (kind === InsightDatasetKind.Sections) {
			dataset = new SectionsDataset(id);
		} else {
			dataset = new RoomsDataset(id);
		}

		try {
			await dataset.addContent(content);
		} catch (e) {
			return Promise.reject(e);
		}

		let ret: string[] = [];

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
				referencedDataset = ds.getContents();
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
				numRows: ds.getContents().length
			};

			ret.push(iDataset);
		}

		return Promise.resolve(ret);
	}
}
