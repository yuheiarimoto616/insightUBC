export enum Key {
	mkey = "mkey",
	skey = "skey",
	key = "key"
}

export enum Anykey {
	key = "key",
	applykey = "applykey"
}

export interface Query {
	BODY?: Body;
	OPTIONS?: Options;
	TRANSFORMATIONS?: Transformations;
}

export interface Body {
	WHERE: Filter | null; // when null (no filter), matches all entry
}

export type Filter = LOGICCOMPARISON | MCOMPARISON | SCOMPARISON | NEGATION;

export interface LOGICCOMPARISON {
	LOGIC: string; // LOGIC ::= 'AND' | 'OR'
	FILTER_LIST: Filter[]; // at least one
}

export interface MCOMPARISON {
	MCOMPARATOR: string; // MCOMPARATOR ::= 'LT' | 'GT' | 'EQ'
	mkey: string; // mkey = /^[^_]+\_['avg' | 'pass' | 'fail' | 'audit' | 'year']$/
	num: number;
}

export interface SCOMPARISON {
	IS: {
		skey: string; // skey = /^[^_]+\_['dept' | 'id' | 'instructor' | 'title' | 'uuid']$/
		inputString: string;  // Asterisks at the beginning or end of the inputstring (/[^*]*/) should act as wildcards.
	}
}

export interface NEGATION {
	NOT: {
		FILTER: Filter;
	}
}

export interface ApplyRule {
	APPLYKEY: string; // ANYKEY = KEY | APPLYKEY
	APPKYTOKEN: string; // "MAX" | "MIN" | "AVG" | "COUNT | "SUM"
	KEY: Key; // KEY = mkey | skey
}

export interface Transformations {
	GROUP: Key[];
	APPLY: ApplyRule[];
}

// TODO Check for the ORDERS, cannot be both at once.
export interface Sort {
	ORDER1?: {
		DIRECTION: string;
		KEYS: Anykey[];
	}
	ORDER2?: string;
}

export interface Options {
	// TODO Check COLUMNS for applykey value as well.
	COLUMNS: string[];
	SORT?: Sort;
}
