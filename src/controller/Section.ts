import {DataContent} from "./DataContent";

export default class Section implements DataContent{
	private readonly _id: string;
	private readonly _Course: string;
	private readonly _Title: string;
	private readonly _Professor: string;
	private readonly _Subject: string;
	private readonly _Year: number;
	private readonly _Avg: number;
	private readonly _Pass: number;
	private readonly _Fail: number;
	private readonly _Audit: number;

	constructor(id: string, course: string, title: string, professor: string, subject: string, year: number,
		avg: number, pass: number, fail: number, audit: number) {
		this._id = id;
		this._Course = course;
		this._Title = title;
		this._Professor = professor;
		this._Subject = subject;
		this._Year = year;
		this._Avg = avg;
		this._Pass = pass;
		this._Fail = fail;
		this._Audit = audit;
	}

	public getSectionField(field: string) {
		switch (field) {
			case "avg": {
				return this._Avg;
			}
			case "pass": {
				return this._Pass;
			}
			case "fail": {
				return this._Fail;
			}
			case "audit": {
				return this._Audit;
			}
			case "year": {
				return this._Year;
			}
			case "dept": {
				return this._Subject;
			}
			case "id": {
				return this._Course;
			}
			case "instructor": {
				return this._Professor;
			}
			case "title": {
				return this._Title;
			}
			case "uuid": {
				return this._id;
			}
			default: {
				return null;
			}
		}
	}

	public getSectionMField(mfield: string): number | null {
		switch (mfield) {
			case "avg": {
				return this._Avg;
			}
			case "pass": {
				return this._Pass;
			}
			case "fail": {
				return this._Fail;
			}
			case "audit": {
				return this._Audit;
			}
			case "year": {
				return this._Year;
			}
			default: {
				return null;
			}
		}
	}

	public getSectionSField(sfield: string): string | null {
		switch (sfield) {
			case "dept": {
				return this._Subject;
			}
			case "id": {
				return this._Course;
			}
			case "instructor": {
				return this._Professor;
			}
			case "title": {
				return this._Title;
			}
			case "uuid": {
				return this._id;
			}
			default: {
				return null;
			}
		}
	}
}
