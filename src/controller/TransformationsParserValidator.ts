import {ApplyRule, Key} from "./QueryEBNF";
import ParserValidator from "./ParserValidator";

export default class TransformationsParserValidator extends ParserValidator {

	public validateTransformations(trans: any) {
		if (Object.keys(trans).length !== 2) {
			return false;
		}

		if (!(Object.hasOwn(trans, "GROUP") && Object.hasOwn(trans, "APPLY"))) {
			return false;
		}

		let group = this.validateGroup(trans.GROUP);
		let apply = this.validateApply(trans.APPLY);

		if (group === null || apply === null) {
			return false;
		}

		TransformationsParserValidator.query.TRANSFORMATIONS = {
			GROUP: group,
			APPLY: apply
		};

		return true;
	}

	public validateGroup(group: any) {
		if (!Array.isArray(group)) {
			return null;
		}

		if (group.length === 0) {
			return null;
		}

		for (let key of group) {
			if (typeof key !== "string") {
				return null;
			}
			if (!this.validateKey(key, Key.key)) {
				return null;
			}
		}

		return group;
	}

	public validateApply(apply: any) {
		let ret: ApplyRule[] = [];
		if (!Array.isArray(apply)) {
			return null;
		}

		for (let appRule of apply) {
			let applyRule = this.getApplyRule(appRule);

			if (applyRule === null) {
				return null;
			}
			ret.push(applyRule);
		}
		return ret;
	}

	public getApplyRule(from: any) {
		if (typeof from !== "object") {
			return null;
		}
		if (Object.keys(from).length !== 1) {
			return null;
		}

		let applyKey = Object.keys(from)[0];
		// TODO: check if trim or not
		if (!this.applykey.test(applyKey)) {
			return null;
		}

		if (TransformationsParserValidator.applyKeys.includes(applyKey)) {
			return null;
		}
		TransformationsParserValidator.applyKeys.push(applyKey);

		let appKeyContent = from[applyKey];
		if (typeof appKeyContent !== "object") {
			return null;
		}

		if (Object.keys(appKeyContent).length !== 1) {
			return null;
		}

		let appToken = Object.keys(appKeyContent)[0];
		if (!this.APPLYTOKEN.includes(appToken)) {
			return null;
		}

		let key = appKeyContent[appToken];

		if (typeof key !== "string") {
			return null;
		}
		if (!this.validateKey(key, Key.key)) {
			return null;
		}
		if (!this.areKeyAndTokenCompatible(key, appToken)) {
			return null;
		}

		return {
			applykey: applyKey,
			APPKYTOKEN: appToken,
			KEY: key
		};
	}

	public areKeyAndTokenCompatible(key: string, token: string) {
		let field = key.split("_")[1];
		if (this.MFIELD.includes(field)) {
			return true;
		} else {
			return token === "COUNT";
		}
	}
}
