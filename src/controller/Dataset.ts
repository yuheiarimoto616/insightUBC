import Section from "./Section";
import {InsightDatasetKind} from "./IInsightFacade";

export default class Dataset {
	private id: string;
	private sections: Section[];

	private kind: InsightDatasetKind;

	constructor(id: string, kind: InsightDatasetKind) {
		this.id = id;
		this.kind = kind;
		this.sections = [];
	}

	public addSection(section: Section) {
		this.sections.push(section);
	}

	public getID(): string {
		return this.id;
	}

	public getKind(): InsightDatasetKind {
		return this.kind;
	}

	public getSections(): Section[] {
		return this.sections;
	}
}
