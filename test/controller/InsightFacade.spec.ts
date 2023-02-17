import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import {folderTest} from "@ubccpsc310/folder-test";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";

use(chaiAsPromised);

// describe("QueryParserValidator", function () {
// 	let sections: string;
// 	let facade: InsightFacade;
//
// 	beforeEach(function () {
// 		sections = getContentFromArchives("singleCourse.zip");
// 		facade = new InsightFacade();
// 		clearDisk();
// 	});
//
// 	it ("test", async function () {
// 		let query: any = {
// 			WHERE: {
// 				NOT: {
// 					IS: {
// 						ubc_uuid: "85401"
// 					}
// 				}
// 			},
// 			OPTIONS: {
// 				COLUMNS: [
// 					"ubc_dept",
// 					"ubc_uuid",
// 					"ubc_avg"
// 				]
// 			}
// 		};
//
// 		await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
// 		const result = facade.performQuery(query);
// 		expect(result).equal(true);
// 	});
// });

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
			clearDisk();
		});

		// costructor
		it ("should resolve with data successfully loaded to memory", async function () {
			await facade.addDataset("ubc", singleCourse, InsightDatasetKind.Sections);

			let facade2 = new InsightFacade();

			const result = facade2.listDatasets();

			return expect(result).to.eventually.be.deep.equal([{
				id: "ubc",
				kind: InsightDatasetKind.Sections,
				numRows: 4
			}]);
		});

		it ("should resolve with successful addition to recovered instance", async function () {
			await facade.addDataset("ubc", singleCourse, InsightDatasetKind.Sections);

			let facade2 = new InsightFacade();
			await facade2.addDataset("ubcv", small, InsightDatasetKind.Sections);

			const result = facade2.listDatasets();

			return expect(result).to.eventually.be.deep.equal([{
				id: "ubc",
				kind: InsightDatasetKind.Sections,
				numRows: 4
			}, {
				id: "ubcv",
				kind: InsightDatasetKind.Sections,
				numRows: 86
			}]);
		});

		it ("should resolve with successful removala on recovered instance", async function () {
			await facade.addDataset("ubc", singleCourse, InsightDatasetKind.Sections);
			await facade.addDataset("ubcv", small, InsightDatasetKind.Sections);

			let facade2 = new InsightFacade();

			await facade2.removeDataset("ubc");

			const result = facade2.listDatasets();

			return expect(result).to.eventually.be.deep.equal([{
				id: "ubcv",
				kind: InsightDatasetKind.Sections,
				numRows: 86
			}]);
		});

		// addDataset
		it ("should resolve with simple addDateset", function () {
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
		before(async function () {
			console.info(`Before: ${this.test?.parent?.title}`);

			facade = new InsightFacade();

			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises = [
				facade.addDataset("sections", sections, InsightDatasetKind.Sections),
				facade.addDataset("ubc", singleCourse, InsightDatasetKind.Sections)
			];

			await Promise.all(loadDatasetPromises);
			facade = new InsightFacade();
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			clearDisk();
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade Ordered PerformQuery tests",
			(input) => facade.performQuery(input),
			"./test/resources/queries/ordered",
			{
				assertOnResult: async (actual, expected) => {
					expect(actual).to.deep.equal(await expected);
				},
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError: (actual, expected) => {
					if (expected === "InsightError") {
						expect(actual).to.be.instanceof(InsightError);
					} else if (expected === "ResultTooLargeError") {
						expect(actual).to.be.instanceof(ResultTooLargeError);
					} else {
						expect.fail("UNEXPECTED ERROR");
					}
				},
			}
		);

		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade Unordered PerformQuery tests",
			(input) => facade.performQuery(input),
			"./test/resources/queries/unordered",
			{
				assertOnResult: async (actual, expected) => {
					expect(actual).to.have.deep.members(await expected);
				},
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError: (actual, expected) => {
					if (expected === "InsightError") {
						expect(actual).to.be.instanceof(InsightError);
					} else if (expected === "ResultTooLargeError") {
						expect(actual).to.be.instanceof(ResultTooLargeError);
					} else {
						expect.fail("UNEXPECTED ERROR");
					}
				},
			}
		);
	});
});
