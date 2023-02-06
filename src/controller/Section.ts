export default class Section {
	private readonly id: string;
	private readonly Course: string;
	private readonly Title: string;
	private readonly Professor: string;
	private readonly Subject: string;
	private readonly Year: number;
	private readonly Avg: number;
	private readonly Pass: number;
	private readonly Fail: number;
	private readonly Audit: number;

	constructor(id: string, course: string, title: string, professor: string, subject: string, year: number,
		avg: number, pass: number, fail: number, audit: number) {
		this.id = id;
		this.Course = course;
		this.Title = title;
		this.Professor = professor;
		this.Subject = subject;
		this.Year = year;
		this.Avg = avg;
		this.Pass = pass;
		this.Fail = fail;
		this.Audit = audit;
	}
}
