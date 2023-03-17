import {
	ApplyRule,
	Body,
	Filter,
	LOGICCOMPARISON,
	MCOMPARISON,
	NEGATION,
	Options,
	Query,
	SCOMPARISON, Sort,
	Transformations
} from "./QueryEBNF";
import Section from "./Section";
import {InsightError, InsightResult, ResultTooLargeError} from "./IInsightFacade";
import {strict} from "assert";
import {DataContent} from "./DataContent";
import Decimal from "decimal.js";
import WhereExecutor from "./WhereExecutor";

export default class QueryExecutor {
	private query: Query;
	constructor(query: Query) {
		this.query = query;
	}

	public executeQuery(content: DataContent[]): InsightResult[] {
		let where = this.query.BODY as Body;
		let whereExecutor = new WhereExecutor();
		let matchedSec: DataContent[] = whereExecutor.executeWhere(this.query, where, content);

		let ret: InsightResult[] = [];
		let options = this.query.OPTIONS as Options;

		if (this.query.TRANSFORMATIONS !== undefined) {
			let trans = this.query.TRANSFORMATIONS as Transformations;
			ret = this.executeTransformation(trans, matchedSec);
		} else {
			ret = this.executeColumns(options.COLUMNS, matchedSec);
		}

		if (options.SORT !== undefined) {
			ret = this.executeSort(options.SORT, ret);
		}

		return ret;
	}

	private executeTransformation(transformation: Transformations, content: DataContent[]): InsightResult[] {
		let ret: InsightResult[] = [];

		let group: string[] = transformation.GROUP;
		let groupedSec = this.executeGroup(group,content);
		let apply: ApplyRule[] = transformation.APPLY;
		ret = this.executeApply(apply, group, groupedSec);

		return ret;
	}

	public executeGroup(group: string[], contents: DataContent[]): DataContent[][] {
		let transHash: {[key: string]: any[]} = {};
		for (let c of contents) {
			let mapKey = "";
			for (let g of group) {
				let dataKey = g.split("_")[1];
				let key = c.getSectionField(dataKey);

				if (key == null) {
					throw new InsightError("Datatype and Field Mismatch");
				}

				mapKey += key + " ";
			}

			if (mapKey in transHash) {
				transHash[mapKey].push(c);
			} else {
				if (Object.keys(transHash).length >= 5000) {
					throw new ResultTooLargeError("Result has more than 5000 elements");
				}
				transHash[mapKey] = [c];
			}
		}

		let ret: DataContent[][] = [];
		for (let key in transHash) {
			ret.push(transHash[key]);
		}

		return ret;
	}

	public executeApply(appRule: ApplyRule[], group: string[] , data: DataContent[][]) {
		let ret: InsightResult[] = [];
		for (let d of data) {
			let insightResult: InsightResult = {};
			for (let key of group) {
				let value = d[0].getSectionField(key.split("_")[1]);
				if (value === null) {
					throw new InsightError("DataType and field mismatch");
				}
				insightResult[key] = value;
			}

			for (let rule of appRule) {
				let key = rule.applykey;
				let value = this.applyKey(rule.APPKYTOKEN, rule.KEY, d);
				insightResult[key] = value;
			}

			ret.push(insightResult);
		}

		for (let item of ret) {
			for (let key of Object.keys(item)) {
				if (!this.query.OPTIONS?.COLUMNS.includes(key)) {
					delete item[key];
				}
			}
		}

		return ret;
	}

	private applyKey(token: string, key: string, data: DataContent[]) {
		let keyExtracted = data.map((d) => d.getSectionField(key.split("_")[1]));
		if (keyExtracted[0] === null) {
			throw new InsightError("Key DataType mismatch");
		}

		let ret;
		if (token === "MAX") {
			ret = Math.max(...keyExtracted);
		} else if (token === "MIN") {
			ret = Math.min(...keyExtracted);
		} else if (token === "AVG") {
			let total = new Decimal(0);
			for (let num of keyExtracted) {
				num = new Decimal(num);
				total = Decimal.add(total, num);
			}

			let avg = total.toNumber() / keyExtracted.length;
			ret = Number(avg.toFixed(2));
		} else if (token === "SUM") {
			let total = new Decimal(0);
			for (let num of keyExtracted) {
				num = new Decimal(num);
				total = Decimal.add(total, num);
			}

			ret = total.toFixed(2);
		} else { // token === "COUNT"
			let count = new Map<any, number>();
			for (let value of keyExtracted) {
				if (!count.has(value)) {
					count.set(value, 1);
				}
			}

			ret = count.size;
		}
		return ret;
	}

	private executeColumns(cols: string[], content: DataContent[]): InsightResult[] {
		let ret: InsightResult[] = [];
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
		return ret;
	}

	private executeSort(sort: Sort, content: InsightResult[]): InsightResult[] {
		if (sort.ORDER) {
			const key = sort.ORDER;
			content.sort((a, b) => {
				if (a[key] < b[key]) {
					return -1;
				} else if (a[key] > b[key]) {
					return 1;
				} else {
					return 0;
				}
			});
		} else if (sort.DIR_ORDER) {
			const dir = sort.DIR_ORDER.dir;
			const keys = sort.DIR_ORDER.keys;
			content.sort((a, b) => {
				let cmp = 0;
				for (let key of keys) {
					if (a[key] < b[key]) {
						cmp = -1;
						break;
					} else if (a[key] > b[key]) {
						cmp = 1;
						break;
					}
				}
				return dir === "DOWN" ? -cmp : cmp;
			});
		}
		return content;
	}

	// // string -> alphabetical ; number -> ascending
	// public orderQuery(order: string, result: InsightResult[]): InsightResult[] {
	// 	if (typeof result[0][order] === "string") {
	// 			// got idea from https://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript
	// 		result.sort((a, b) =>
	// 			(a[order] as string).localeCompare(b[order] as string));
	// 	} else {
	// 		result.sort((a, b) => ((a[order] as number) - (b[order] as number)));
	// 	}
	//
	// 	return result;
	// }
}
