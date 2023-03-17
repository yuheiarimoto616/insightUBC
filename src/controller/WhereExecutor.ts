import {DataContent} from "./DataContent";
import {InsightError, InsightResult, ResultTooLargeError} from "./IInsightFacade";
import {
	Body,
	Filter,
	LOGICCOMPARISON,
	MCOMPARISON,
	NEGATION,
	Options,
	Query,
	SCOMPARISON,
	Transformations
} from "./QueryEBNF";
import QueryExecutor from "./QueryExecutor";

export default class WhereExecutor {
	public executeWhere(query: Query, where: Body, content: DataContent[]): DataContent[] {
		let ret: DataContent[] = [];
		if (where.WHERE === null) {
			if (query.TRANSFORMATIONS === undefined && content.length > 5000) {
				throw new ResultTooLargeError("result has more than 5000");
			}
			return content;
		}

		for (let c of content) {
			if (this.executeFilter(c, where.WHERE)) {
				if (query.TRANSFORMATIONS === undefined && ret.length >= 5000) {
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

	private executeScom(c: DataContent, scom: SCOMPARISON): boolean {
		let sectionField = c.getSectionSField(scom.IS.skey);
		let target = scom.IS.inputString;
		// TODO: test
		if (sectionField === null) {
			throw new InsightError("Wrong DataContent type");
		}


		if (target.startsWith("*") && target.endsWith("*")) {
			if (target.length <= 2) {
				return true;
			}
			return sectionField.includes(target.substring(1, target.length - 1));
		} else if (target.endsWith("*")) {
			if (target.length === 1) {
				return true;
			}
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

