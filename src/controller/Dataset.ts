import Section from "./Section";
import {InsightDatasetKind} from "./IInsightFacade";
import List = Mocha.reporters.List;

export default abstract class Dataset {
	protected id: string;

	protected kind: InsightDatasetKind;

	constructor(id: string, kind: InsightDatasetKind) {
		this.id = id;
		this.kind = kind;
	}

	public getID(): string {
		return this.id;
	}

	public getKind(): InsightDatasetKind {
		return this.kind;
	}

	public abstract addContent(content: string): any;
	public abstract getContents(): any;
}
