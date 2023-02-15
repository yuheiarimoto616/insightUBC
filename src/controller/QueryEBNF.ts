export enum Key {
	mkey = "mkey",
	skey = "skey",
	key = "key"
}

export interface Query {
	BODY?: Body;
	OPTIONS?: Options;
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

export interface Options {
	COLUMNS: string[];
	ORDER?: string;
}
