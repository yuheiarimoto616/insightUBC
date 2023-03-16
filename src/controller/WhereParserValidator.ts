import {Filter, Key, LOGICCOMPARISON, MCOMPARISON, NEGATION, SCOMPARISON} from "./QueryEBNF";
import ParserValidator from "./ParserValidator";

export default class WhereParserValidator extends ParserValidator{
	public validateWhere(where: any) {
		if (typeof where !== "object") {
			return false;
		}
		if (Object.keys(where).length > 1) {
			return false;
		} else if (Object.keys(where).length === 0) {
			WhereParserValidator.query.BODY = {
				WHERE: null
			};
			return true;
		}

		let filter = this.validateFilter(where);
		if (filter === null) {
			return false;
		} else {
			WhereParserValidator.query.BODY = {
				WHERE: filter
			};
			return true;
		}
	}

	// return Filter and have another function validate and parse Where
	public validateFilter(content: any): Filter | null {
		if (typeof content !== "object") {
			return null;
		}

		let filter: string[] = Object.keys(content);
		if (filter.length !== 1) {
			return null;
		}

		let filterElement = filter[0];
		if (this.MCOMPARATOR.includes(filterElement)) {
			return this.validateMComparison(content[filterElement], filterElement);
		}

		if (filterElement === "IS") {
			return this.validateSComparison(content[filterElement]);
		}

		if (filterElement === "NOT") {
			return this.validateNegation(content[filterElement]);
		}

		if (this.LOGIC.includes(filterElement)) {
			return this.validateLogicComparison(content[filterElement], filterElement);
		}
		return null;
	}

	public validateLogicComparison(filterList: any, logic: string): LOGICCOMPARISON | null {
		if (!Array.isArray(filterList) || filterList.length === 0) {
			return null;
		}

		let filters: Filter[] = [];
		for (let filter of filterList) {
			let revalidFilter = this.validateFilter(filter);
			if (revalidFilter == null) {
				return null;
			} else {
				filters.push(revalidFilter);
			}
		}

		let lcom: LOGICCOMPARISON = {
			LOGIC: logic,
			FILTER_LIST: filters
		};
		return lcom;
	}

	public validateMComparison(content: any, mcomparator: string): MCOMPARISON | null {
		if (typeof content !== "object") {
			return null;
		}

		if (Object.keys(content).length !== 1) {
			return null;
		}

		if (this.validateKey(Object.keys(content)[0], Key.mkey) && (typeof Object.values(content)[0] === "number")) {
			let mcom: MCOMPARISON = {
				MCOMPARATOR: mcomparator,
				mkey: Object.keys(content)[0].split("_")[1],
				num: Object.values(content)[0] as number
			};
			return mcom;
		} else {
			return null;
		}
	}

	public validateSComparison(content: any): SCOMPARISON | null {
		if (typeof content !== "object") {
			return null;
		}

		if (Object.keys(content).length !== 1) {
			return null;
		}

		if (this.validateKey(Object.keys(content)[0], Key.skey) && typeof Object.values(content)[0] === "string"
			&& this.inputstring.test(Object.values(content)[0] as string)) {
			let scom: SCOMPARISON = {
				IS: {
					skey: Object.keys(content)[0].split("_")[1],
					inputString: Object.values(content)[0] as string
				}
			};
			return scom;
		} else {
			return null;
		}
	}

	public validateNegation(content: any): NEGATION | null {
		if (typeof content !== "object") {
			return null;
		}

		let filter = this.validateFilter(content);
		if (filter == null) {
			return null;
		} else {
			let negation: NEGATION = {
				NOT: {
					FILTER: filter
				}
			};
			return negation;
		}
	}
}
