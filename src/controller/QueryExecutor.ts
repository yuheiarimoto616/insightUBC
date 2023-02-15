import {Body, Filter, LOGICCOMPARISON, MCOMPARISON, NEGATION, Options, Query, SCOMPARISON} from "./QueryEBNF";
import Section from "./Section";
import {InsightResult, ResultTooLargeError} from "./IInsightFacade";
import {strict} from "assert";

export default class QueryExecutor {
	private query: Query;
	constructor(query: Query) {
		this.query = query;
	}

	public executeQuery(sections: Section[]): InsightResult[] {
		let where = this.query.BODY as Body;
		let matchedSec: Section[] = this.executeWhere(where, sections);

		let options = this.query.OPTIONS as Options;
		let ret: InsightResult[] = this.executeOptions(options, matchedSec);

		return ret;
	}

	private executeWhere(where: Body, sections: Section[]): Section[] {
		let ret: Section[] = [];
		if (where.WHERE === null) {
			if (sections.length > 5000) {
				throw new ResultTooLargeError("result has more than 5000");
			}
			return sections;
		}

		for (let s of sections) {
			if (this.executeFilter(s, where.WHERE)) {
				if (ret.length >= 5000) {
					throw new ResultTooLargeError("result has more than 5000");
				}
				ret.push(s);
			}
		}

		return ret;
	}

	private executeFilter(s: Section, where: Filter): boolean {
		if (this.instanceOfLogicCom(where)) {
			return this.executeLogicCom(s, where);
		}

		if (this.instanceOfMCom(where)) {
			return this.executeMcom(s, where);
		}

		if (this.instanceOfSCom(where)) {
			return this.executeScom(s, where);
		}

		if (this.instanceOfNegation(where)) {
			return this.executeNegation(s, where);
		}

		return false;
	}

	private executeLogicCom(s: Section, lcom: LOGICCOMPARISON): boolean {
		if (lcom.LOGIC === "AND") {
			for (let filter of lcom.FILTER_LIST) {
				if (!this.executeFilter(s, filter)) {
					return false;
				}
			}
			return true;
		} else {
			for (let filter of lcom.FILTER_LIST) {
				if (this.executeFilter(s, filter)) {
					return true;
				}
			}
			return false;
		}
	}

	private executeMcom(s: Section, mcom: MCOMPARISON): boolean {
		let sectionField = s.getSectionMField(mcom.mkey);
		if (mcom.MCOMPARATOR === "LT") {
			return mcom.num > sectionField;
		} else if (mcom.MCOMPARATOR === "GT") {
			return mcom.num < sectionField;
		} else {
			return mcom.num === sectionField;
		}
	}

	private executeScom(s: Section, scom: SCOMPARISON): boolean {
		let sectionField = s.getSectionSField(scom.IS.skey);
		let target = scom.IS.inputString;
		if (target.startsWith("*") && target.endsWith("*")) {
			return sectionField.includes(target.substring(1, target.length - 1));
		} else if (target.endsWith("*")) {
			return sectionField.startsWith(target.substring(0,  target.length - 1));
		} else if (target.startsWith("*")) {
			return sectionField.endsWith(target.substring(1));
		} else {
			return sectionField === target;
		}
	}

	private executeNegation(s: Section, neg: NEGATION) {
		return !this.executeFilter(s, neg.NOT.FILTER);
	}

	private executeOptions(options: Options, sections: Section[]): InsightResult[] {
		let ret: InsightResult[] = [];
		let cols: string[] = options.COLUMNS;

		for (let s of sections) {
			let insightResult: InsightResult = {};
			for (let key of cols) {
				let value = s.getSectionField(key.split("_")[1]);
				insightResult[key] = value;
			}
			ret.push(insightResult);
		}

		if (this.query.OPTIONS?.ORDER !== undefined) {
			ret = this.orderQuery(this.query.OPTIONS?.ORDER, ret);
		}

		return ret;
	}

	// string -> alphabetical ; number -> ascending
	public orderQuery(order: string, result: InsightResult[]): InsightResult[] {
		if (typeof result[0][order] === "string") {
			// got idea from https://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript
			result.sort((a, b) =>
				(a[order] as string).localeCompare(b[order] as string));
		} else {
			result.sort((a, b) => ((a[order] as number) - (b[order] as number)));
		}

		return result;
	}

	public instanceOfLogicCom (object: any): object is LOGICCOMPARISON {
		return "LOGIC" in object;
	}

	public instanceOfMCom (object: any): object is MCOMPARISON {
		return "MCOMPARATOR" in object;
	}

	public instanceOfSCom (object: any): object is SCOMPARISON {
		return "IS" in object;
	}

	public instanceOfNegation (object: any): object is NEGATION {
		return "NOT" in object;
	}
}
