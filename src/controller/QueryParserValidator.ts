import {ApplyRule, Filter, Key, LOGICCOMPARISON, MCOMPARISON, NEGATION, Query, SCOMPARISON, Sort} from "./QueryEBNF";
import ParserValidator from "./ParserValidator";
import WhereParserValidator from "./WhereParserValidator";
import OptionsParserValidator from "./OptionsParserValidator";
import TransformationsParserValidator from "./TransformationsParserValidator";

export default class QueryParserValidator extends ParserValidator{
	// Validation && Parsing
	public validateQuery(q: unknown) {
		this.reinitialize();
		// basic
		if (q === undefined || typeof q !== "object") {
			return false;
		}

		let query = q as any;

		// TODO: check if this was the cause; remove
		if (!(Object.keys(query).length === 2 || Object.keys(query).length === 3)) {
			return false;
		}

		// check if query has WHERE and OPTIONS
		if (!Object.hasOwn(query, "WHERE") || !Object.hasOwn(query, "OPTIONS")) {
			return false;
		}
		let where = query.WHERE;
		let options = query.OPTIONS;

		let whereParserValidator = new WhereParserValidator();
		let optionsParserValidator = new OptionsParserValidator();
		let transParserValidator = new TransformationsParserValidator();

		if (Object.hasOwn(query, "TRANSFORMATIONS")) {
			let trans = query.TRANSFORMATIONS;
			return whereParserValidator.validateWhere(where)
				&& transParserValidator.validateTransformations(trans)
				&& optionsParserValidator.validateOptions(options);
		} else if (Object.keys(query).length === 3) {
			return false;
		}

		// if (Object.keys(query).length === 3) {
		// 	if (!Object.hasOwn(query, "TRANSFORMATIONS")) {
		// 		return false;
		// 	}
		// 	let trans = query.TRANSFORMATIONS;
		// 	return whereParserValidator.validateWhere(where)
		// 		&& transParserValidator.validateTransformations(trans)
		// 		&& optionsParserValidator.validateOptions(options);
		// }

		return whereParserValidator.validateWhere(where) && optionsParserValidator.validateOptions(options);
	}
}
