export interface DataContent {
	getSectionField(field: string): any;
	getSectionMField(mfield: string): number | null;
	getSectionSField(sfield: string): string | null;
};
