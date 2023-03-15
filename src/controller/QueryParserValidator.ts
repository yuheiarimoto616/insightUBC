import Section from "./Section";
import {Filter, Key, LOGICCOMPARISON, MCOMPARISON, NEGATION, Query, SCOMPARISON, Sort} from "./QueryEBNF";

export default class QueryParserValidator {
	private query: Query;
	private referencedId: string;
	private LOGIC: string[] = ["AND", "OR"];
	private MCOMPARATOR: string[] = ["LT", "GT", "EQ"];
	private MFIELD: string[] = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];
	private SFIELD: string[] = ["dept", "id", "instructor", "title", "uuid", "fullname", "shortname", "number", "name",
		"address", "type", "furniture", "href"];

	private idstring = new RegExp(/^[^_]+$/);
	private inputstring = new RegExp(/^[*]?[^*]*[*]?$/);
	private applykey = new RegExp(/^[^_]+$/);
	private onlySpace = new RegExp(/^\s*$/);

	constructor() {
		this.query = {};
		this.referencedId = "";
	}

	// Validation && Parsing
	public validateQuery(q: unknown) {
		// basic
		if (q === undefined || typeof q !== "object") {
			return false;
		}

		let query = q as any;
		// check if query has WHERE and OPTIONS
		if (!Object.hasOwn(query, "WHERE") || !Object.hasOwn(query, "OPTIONS")) {
			return false;
		}
		let where = query.WHERE;
		let options = query.OPTIONS;
		return this.validateWhere(where) && this.validateOptions(options);
	}

	public validateWhere(where: any) {
		if (typeof where !== "object") {
			return false;
		}
		if (Object.keys(where).length > 1) {
			return false;
		} else if (Object.keys(where).length === 0) {
			this.query.BODY = {
				WHERE: null
			};
			return true;
		}

		let filter = this.validateFilter(where);
		if (filter === null) {
			return false;
		} else {
			this.query.BODY = {
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

	// key ::= mkey | skey
	// mkey ::= '"' idstring '_' mfield '"'
	// skey ::= '"' idstring '_' sfield '"'
	public validateKey(mkey: string, type: Key) {
		let splits = mkey.split("_");
		if (splits.length !== 2) {
			return false;
		}

		if (!this.idstring.test(splits[0]) || this.onlySpace.test(splits[0])) {
			return false;
		}

		if (this.referencedId === "") {
			this.referencedId = splits[0];
		} else if (this.referencedId !== splits[0]) {
			return false;
		}

		if (type === "key") {
			return this.MFIELD.includes(splits[1]) || this.SFIELD.includes(splits[1]);
		}
		return (type === "mkey" && this.MFIELD.includes(splits[1]))
			|| (type === "skey" && this.SFIELD.includes(splits[1]));
	}

	// order of the keys does not matter; column can come first or second
	public validateOptions(options: any) {
		if (Object.keys(options).length === 0 || Object.keys(options).length > 2) {
			return false;
		}

		if (!Object.hasOwn(options, "COLUMNS")) {
			return false;
		}

		let columns = options.COLUMNS;
		if (!Array.isArray(columns) || columns.length === 0) {
			return false;
		}

		let cols: string[] = [];
		for (let column of columns) {
			if (typeof column !== "string" || !this.validateKey(column, Key.key)) {
				return false;
			}
			cols.push(column);
		}

		if (Object.keys(options).length === 2) {
			if (!Object.hasOwn(options, "ORDER")) {
				return false;
			}

			let order = options.ORDER;
			let sort = this.validateSort(order);
			if (sort === null) {
				return false;
			}

			if (cols.includes(order)) {
				// TODO Check cols include keys
				return true;
			} else {
				return false;
			}
		}

		this.query.OPTIONS = {
			COLUMNS: cols
		};
		return true;
	}

	public validateSort(order: any): Sort | null{
		let sort = null;
		if (typeof order === "string") {
			if (!this.validateKey(order, Key.key)) {
				return null;
			}

			sort = {
				ORDER2: order,
			};
		}

		if (typeof order !== "string" || typeof order !== "object") {
			return null;
		}

		if (typeof order !== "string" || !this.validateKey(order, Key.key)) {
			return null;
		}

		if (typeof order === "object") {
			order = order as object;
			if (!Object.hasOwn(order, "dir") || !Object.hasOwn(order, "key")) {
				return null;
			}

			if (typeof order.dir !== "string" || !Array.isArray(order.keys)) {
				return null;
			}

			sort = {
				ORDER1: {
					DIRECTION: order.dir,
					KEYS: order.keys
				}
			};
		}
		return sort;
	}

	public getReferencedID() {
		return this.referencedId;
	}

	public getQuery() {
		return this.query;
	}
}
