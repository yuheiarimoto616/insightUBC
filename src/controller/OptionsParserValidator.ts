import ParserValidator from "./ParserValidator";
import {Key, Sort} from "./QueryEBNF";

export default class OptionsParserValidator extends ParserValidator {
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
			if (typeof column !== "string") {
				return false;
			}
			if (column.includes("_")) {
				if (!this.validateKey(column, Key.key) || (OptionsParserValidator.query.TRANSFORMATIONS !== undefined
					&& !OptionsParserValidator.query.TRANSFORMATIONS.GROUP.includes(column))) {
					return false;
				}
			} else if (!this.validateAnyKey(column)) {
				return false;
			}

			cols.push(column);
		}

		if (Object.keys(options).length === 2) {
			if (!Object.hasOwn(options, "ORDER")) {
				return false;
			}
			let order = options.ORDER;
			let sort = this.validateSort(order, cols);
			if (sort === null) {
				return false;
			}

			OptionsParserValidator.query.OPTIONS = {
				COLUMNS: cols,
				SORT: sort
			};
			return true;
		}

		OptionsParserValidator.query.OPTIONS = {
			COLUMNS: cols
		};
		return true;
	}

	public validateSort(order: any, cols: string[]): Sort | null{
		let sort = null;

		if (typeof order !== "string" && typeof order !== "object") {
			return null;
		}

		if (typeof order === "string") {
			sort = this.validateOrder(order, cols);
		} else if (typeof order === "object") {
			sort = this.validateDirOrder(order, cols);
		}

		return sort;
	}

	public validateDirOrder(order: any, cols: string[]) {
		if (Object.keys(order).length !== 2) {
			return null;
		}

		if (!Object.hasOwn(order, "dir") || !Object.hasOwn(order, "keys")) {
			return null;
		}

		if (typeof order.dir !== "string" || !Array.isArray(order.keys)) {
			return null;
		}

		if (order.keys.length === 0) {
			return null;
		}

		for (let key of order.keys) {
			if (!this.validateAnyKey(key)) {
				return null;
			}

			if (!cols.includes(key)) {
				return null;
			}
		}

		if (!this.DIRECTION.includes(order.dir)) {
			return null;
		}

		return {
			DIR_ORDER: {
				dir: order.dir,
				keys: order.keys
			}
		};
	}

	public validateOrder(order: string, cols: string[]) {
		if (!this.validateAnyKey(order)) {
			return null;
		}

		if (!cols.includes(order)) {
			return null;
		}
		return {
			ORDER: order,
		};
	}
}
