import Section from "./Section";
import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import Dataset from "./Dataset";
import JSZip from "jszip";

export default class SectionsDataset extends Dataset{
	private sections: Section[];

	constructor(id: string) {
		super(id, InsightDatasetKind.Sections);
		this.sections = [];
	}

	public async addContent(content: string) {
		let zip = new JSZip();

		try {
			await zip.loadAsync(content, {base64: true});
		} catch (e) {
			return Promise.reject(new InsightError("Not zip file"));
		}

		if (zip.folder(/courses/).length === 0) {
			return Promise.reject(new InsightError("courses folder does not exit"));
		}

		let jobs: any = [];
		zip.folder("courses");
		zip.forEach( (relativePath, file) => {
			if (/^courses\/[^.]+/.test(relativePath)) {
				let course = zip.file(relativePath);

				jobs.push(course?.async("string"));
			}
		});

		const jobResults = await Promise.all(jobs);
		this.addSections(jobResults);
		if (this.getContents().length === 0) {
			return Promise.reject(new InsightError("Invalid dataset with no valid section"));
		}
	}

	private addSections(jobResults: any) {
		for (const result of jobResults) {
			let jsonObject;

			try {
				jsonObject = JSON.parse(result);
			} catch (e) {
				continue;
			}

			if (!Object.hasOwn(jsonObject, "result")) {
				continue;
			}

			let sections: any[] = jsonObject.result;

			for (let section of sections) {
				if (this.hasValidFields(section)) {
					let sec: Section;
					if (Object.hasOwn(section, "Section") && ((section.Section + "") === "overall")) {
						sec = new Section(section.id + "", section.Course + "", section.Title + "",
							section.Professor + "", section.Subject + "", 1900,
							section.Avg * 1, section.Pass * 1, section.Fail * 1, section.Audit * 1);
					} else {
						sec = new Section(section.id + "", section.Course + "", section.Title + "",
							section.Professor + "", section.Subject + "", section.Year * 1,
							section.Avg * 1, section.Pass * 1, section.Fail * 1, section.Audit * 1);
					}

					this.addSection(sec);
				}
			}
		}
	}

	private hasValidFields(section: any) {
		let hasAllFields = Object.hasOwn(section, "id") && Object.hasOwn(section, "Course")
			&& Object.hasOwn(section, "Title") && Object.hasOwn(section, "Professor")
			&& Object.hasOwn(section, "Subject") && Object.hasOwn(section, "Year")
			&& Object.hasOwn(section, "Avg") && Object.hasOwn(section, "Pass")
			&& Object.hasOwn(section, "Fail") && Object.hasOwn(section, "Audit");

		let hasValidTypes = ((typeof section.id === "string") || typeof section.id === "number")
			&& ((typeof section.Course === "string") || typeof section.Course === "number")
			&& (typeof section.Title === "string")
			&& (typeof section.Professor === "string")
			&& (typeof section.Subject === "string")
			&& ((typeof section.Year === "string") || typeof section.Year === "number")
			&& ((typeof section.Avg === "string") || typeof section.Avg === "number")
			&& ((typeof section.Pass === "string") || typeof section.Pass === "number")
			&& ((typeof section.Fail === "string") || typeof section.Fail === "number")
			&& ((typeof section.Audit === "string") || typeof section.Audit === "number");

		return hasAllFields && hasValidTypes;
	}

	public addSection(section: Section) {
		this.sections.push(section);
	}

	public getContents(): Section[] {
		return this.sections;
	}
}
