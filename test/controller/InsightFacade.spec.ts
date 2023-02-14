import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult, NotFoundError,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import {folderTest} from "@ubccpsc310/folder-test";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";
import QueryEBNF from "../../src/controller/QueryEBNF";

use(chaiAsPromised);

describe("QueryEBNF", function () {
	let queryEBNF: QueryEBNF;

	beforeEach(function () {
		queryEBNF = new QueryEBNF();
	});

	it ("test", function() {
		let query: any = {
			WHERE:{
				OR:[
					{
						AND:[
							{
								GT:{
									ubc_avg:90
								}
							},
							{
								IS:{
									ubc_dept:"adhe"
								}
							}
						]
					},
					{
						EQ:{
							ubc_avg: 95
						}
					}
				]
			},
			OPTIONS:{
				COLUMNS:[
					"ubc_dept",
					"ubc_id",
					"ubc_avg"
				],
				ORDER:"ubc_avg"
			}
		};
		const result = queryEBNF.validateQuery(query);
		expect(result).equal(true);
	});
});

describe("InsightFacade", function () {
	let facade: IInsightFacade;

	// Declare datasets used in tests. You should add more datasets like this!
	let sections: string;
	let singleCourse: string;
	let small: string;
	let nonzip: string;
	let noCourses: string;

	before(function () {
		// This block runs once and loads the datasets.
		sections = getContentFromArchives("pair.zip");
		singleCourse = getContentFromArchives("singleCourse.zip");
		small = getContentFromArchives("small.zip");
		nonzip = getContentFromArchives("AANB500");
		noCourses = getContentFromArchives("notCourses.zip");

		// Just in case there is anything hanging around from a previous run of the test suite
		clearDisk();
	});

	describe("Add/Remove/List Dataset", function () {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
		});

		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			console.info(`BeforeTest: ${this.currentTest?.title}`);
			facade = new InsightFacade();
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
		});

		afterEach(function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent of the previous one
			console.info(`AfterTest: ${this.currentTest?.title}`);
			// clearDisk();
		});

		// addDataset
		it ("test", function () {
			const result = facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.deep.equal(["ubc"]);
		});

		it ("should resolve with non alphabet in id", function () {
			const result = facade.addDataset("ubc12-v", small, InsightDatasetKind.Sections);

			return expect(result).to.eventually.deep.equal(["ubc12-v"]);
		});

		it ("should resolve with multiple dataset added", async function () {
			await facade.addDataset("ubc", singleCourse, InsightDatasetKind.Sections);
			const result = facade.addDataset("ubcv", small, InsightDatasetKind.Sections);

			return expect(result).to.eventually.deep.equal(["ubc", "ubcv"]);
		});

		it ("should rejected with dataset with the same id",  async function () {
			await facade.addDataset("ubc", singleCourse, InsightDatasetKind.Sections);

			const result = facade.addDataset("ubc", small, InsightDatasetKind.Sections);

			return expect(result).to.eventually.rejectedWith(InsightError);
		});

		it ("nonzip", function () {
			const result = facade.addDataset("ubc", nonzip, InsightDatasetKind.Sections);
			return expect(result).to.eventually.rejectedWith(InsightError);
		});

		it ("no courses folder", function () {
			const result = facade.addDataset("ubc", noCourses, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		// This is a unit test. You should create more like this!
		it ("should reject with  an empty dataset id", function() {
			const result = facade.addDataset("", small, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it ("should reject with an only whitespace id", function () {
			const result = facade.addDataset("  ", small, InsightDatasetKind.Sections);

			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it ("should reject with invalid dataset id with underscore", function () {
			const result = facade.addDataset("ubc_v", small, InsightDatasetKind.Sections);

			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		// removeDataset
		it ("should resolve when only dataset",  async function () {
			await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
			const result = facade.removeDataset("ubc");

			return expect(result).to.eventually.equal("ubc");
		});

		it ("should resolve with multiple dataset existing", async function () {
			await facade.addDataset("ubc", small, InsightDatasetKind.Sections);
			await facade.addDataset("ubco", singleCourse, InsightDatasetKind.Sections);

			const result = facade.removeDataset("ubco");

			return expect(result).to.eventually.equal("ubco");
		});

		it ("should reject with removing from empty system", async function (){
			const result = facade.removeDataset("ubc");

			return expect(result).to.eventually.be.rejectedWith(NotFoundError);
		});

		it ("should reject with invalid id with underscore", async function () {
			await facade.addDataset("ubc", small, InsightDatasetKind.Sections);

			const result = facade.removeDataset("ubc_v");

			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it ("should reject with invalid empty id", async function () {
			await facade.addDataset("ubc", small, InsightDatasetKind.Sections);

			const result = facade.removeDataset("");

			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it ("should reject with invalid whitespace id", function () {
			const result = facade.removeDataset("  ");

			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		// listDatasets
		it ("should resolve with empty", function () {
			const result = facade.listDatasets();

			return expect(result).to.eventually.deep.equal([]);
		});

		it ("should resolve with one dataset", async function () {
			await facade.addDataset("ubc", small, InsightDatasetKind.Sections);

			const result = facade.listDatasets();

			return expect(result).to.eventually.deep.equal([{
				id: "ubc",
				kind: InsightDatasetKind.Sections,
				numRows: 86
			}]);
		});

		it ("should resolve with multiple dataset", async function () {
			// maybe not use sections too big
			await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
			await facade.addDataset("ubcv", singleCourse, InsightDatasetKind.Sections);

			const result = facade.listDatasets();

			return expect(result).to.eventually.deep.equal([
				{
					id: "ubc",
					kind: InsightDatasetKind.Sections,
					numRows: 64612
				},
				{
					id: "ubcv",
					kind: InsightDatasetKind.Sections,
					numRows: 4
				}
			]);
		});
	});

	/*
	 * This test suite dynamically generates tests from the JSON files in test/resources/queries.
	 * You should not need to modify it; instead, add additional files to the queries directory.
	 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
	 */
	describe("PerformQuery", () => {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);

			facade = new InsightFacade();

			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises = [
				facade.addDataset("sections", sections, InsightDatasetKind.Sections),
			];

			return Promise.all(loadDatasetPromises);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			clearDisk();
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			(input) => facade.performQuery(input),
			"./test/resources/queries",
			{
				assertOnResult: (actual, expected) => {
					// TODO add an assertion!
				},
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError: (actual, expected) => {
					// TODO add an assertion!
				},
			}
		);
	});
});
