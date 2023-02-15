import {Query} from "./QueryEBNF";
import Section from "./Section";

export default class QueryExecuter {
	private query: Query;

	constructor(query: Query) {
		this.query = query;
	}

	public executeQuery(sections: Section[]) {
		let ret: Section[] = [];
		return ret;
	}
}
