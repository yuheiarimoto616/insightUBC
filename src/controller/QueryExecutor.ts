import {Body, Filter, LOGICCOMPARISON, MCOMPARISON, NEGATION, Options, Query, SCOMPARISON} from "./QueryEBNF";
import Section from "./Section";
import {InsightError, InsightResult, ResultTooLargeError} from "./IInsightFacade";
import {strict} from "assert";
import {DataContent} from "./DataContent";

export default class QueryExecutor {
	private query: Query;
	constructor(query: Query) {
		this.query = query;
	}

	public executeQuery(content: DataContent[]): InsightResult[] {
		let where = this.query.BODY as Body;
		let matchedSec: DataContent[] = this.executeWhere(where, content);

		let options = this.query.OPTIONS as Options;
		let ret: InsightResult[] = this.executeOptions(options, matchedSec);

		return ret;
	}

	private executeWhere(where: Body, content: DataContent[]): DataContent[] {
		let ret: DataContent[] = [];
		if (where.WHERE === null) {
			if (content.length > 5000) {
				throw new ResultTooLargeError("result has more than 5000");
			}
			return content;
		}

		for (let c of content) {
			if (this.executeFilter(c, where.WHERE)) {
				if (ret.length >= 5000) {
					throw new ResultTooLargeError("result has more than 5000");
				}
				ret.push(c);
			}
		}

		return ret;
	}

	private executeFilter(c: DataContent, where: Filter): boolean {
		if (this.instanceOfLogicCom(where)) {
			return this.executeLogicCom(c, where);
		}

		if (this.instanceOfMCom(where)) {
			return this.executeMcom(c, where);
		}

		if (this.instanceOfSCom(where)) {
			return this.executeScom(c, where);
		}

		if (this.instanceOfNegation(where)) {
			return this.executeNegation(c, where);
		}

		return false;
	}

	private executeLogicCom(c: DataContent, lcom: LOGICCOMPARISON): boolean {
		if (lcom.LOGIC === "AND") {
			for (let filter of lcom.FILTER_LIST) {
				if (!this.executeFilter(c, filter)) {
					return false;
				}
			}
			return true;
		} else {
			for (let filter of lcom.FILTER_LIST) {
				if (this.executeFilter(c, filter)) {
					return true;
				}
			}
			return false;
		}
	}

	private executeMcom(c: DataContent, mcom: MCOMPARISON): boolean {
		let sectionField = c.getSectionMField(mcom.mkey);
		// TODO: test
		if (sectionField === null) {
			throw new InsightError("Wrong DataContent type");
		}
		if (mcom.MCOMPARATOR === "LT") {
			return mcom.num > sectionField;
		} else if (mcom.MCOMPARATOR === "GT") {
			return mcom.num < sectionField;
		} else {
			return mcom.num === sectionField;
		}
	}

	// TODO: Fix wildcards
	private executeScom(c: DataContent, scom: SCOMPARISON): boolean {
		let sectionField = c.getSectionSField(scom.IS.skey);
		let target = scom.IS.inputString;
		// TODO: test
		if (sectionField === null) {
			throw new InsightError("Wrong DataContent type");
		}
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

	private executeNegation(c: DataContent, neg: NEGATION) {
		return !this.executeFilter(c, neg.NOT.FILTER);
	}

	private executeOptions(options: Options, content: DataContent[]): InsightResult[] {
		let ret: InsightResult[] = [];
		let cols: string[] = options.COLUMNS;

		for (let s of content) {
			let insightResult: InsightResult = {};
			for (let key of cols) {
				let value = s.getSectionField(key.split("_")[1]);
				if (value === null) {
					throw new InsightError("DataType and field mismatch");
				}
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
