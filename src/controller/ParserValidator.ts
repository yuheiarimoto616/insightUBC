import {Key, Query} from "./QueryEBNF";

export default abstract class ParserValidator {
	protected static query: Query = {};
	protected static referencedId: string = "";
	protected static applyKeys: string[] = [];

	protected LOGIC: string[] = ["AND", "OR"];
	protected MCOMPARATOR: string[] = ["LT", "GT", "EQ"];
	protected MFIELD: string[] = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];
	protected SFIELD: string[] = ["dept", "id", "instructor", "title", "uuid", "fullname", "shortname", "number",
		"name", "address", "type", "furniture", "href"];

	protected DIRECTION: string[] = ["UP", "DOWN"];
	protected APPLYTOKEN: string[] = ["MAX", "MIN", "AVG", "COUNT", "SUM"];
	protected idstring = new RegExp(/^[^_]+$/);
	protected inputstring = new RegExp(/^[*]?[^*]*[*]?$/);
	protected applykey = new RegExp(/^[^_]+$/);
	protected onlySpace = new RegExp(/^\s*$/);

	public validateKey(mkey: string, type: Key) {
		let splits = mkey.split("_");
		if (splits.length !== 2) {
			return false;
		}

		if (!this.idstring.test(splits[0]) || this.onlySpace.test(splits[0])) {
			return false;
		}

		if (ParserValidator.referencedId === "") {
			ParserValidator.referencedId = splits[0];
		} else if (ParserValidator.referencedId !== splits[0]) {
			return false;
		}

		if (type === "key") {
			return this.MFIELD.includes(splits[1]) || this.SFIELD.includes(splits[1]);
		}
		return (type === "mkey" && this.MFIELD.includes(splits[1]))
			|| (type === "skey" && this.SFIELD.includes(splits[1]));
	}

	public validateAnyKey(anyKey: string) {
		if (anyKey.includes("_")) {
			return this.validateKey(anyKey, Key.key);
		} else {
			if (!this.applykey.test(anyKey)) {
				return false;
			}

			return ParserValidator.applyKeys.includes(anyKey);
		}
	};

	public getReferencedID() {
		return ParserValidator.referencedId;
	}

	public getQuery() {
		return ParserValidator.query;
	}

	public getApplyKeys() {
		return ParserValidator.applyKeys;
	}

	public reinitialize() {
		ParserValidator.query = {};
		ParserValidator.referencedId = "";
		ParserValidator.applyKeys = [];
	}
}
