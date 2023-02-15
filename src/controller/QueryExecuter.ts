import {Query} from "./QueryEBNF";
import Section from "./Section";
import {InsightResult} from "./IInsightFacade";

export default class QueryExecuter {
	private query: Query;
	private results: InsightResult[];
	constructor(query: Query) {
		this.query = query;
		this.results = [];
	}

	public executeQuery(sections: Section[]): InsightResult[] {

		if (this.query.OPTIONS?.ORDER !== undefined) {
			this.orderQuery();
		}

		return this.results;
	}

	// string -> alphabetical ; number -> ascending
	public orderQuery() {
		return null; // stub
	}
}
