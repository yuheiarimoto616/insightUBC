import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";
import {expect} from "chai";
import request, {Response} from "supertest";
import * as fs from "fs-extra";
import {InsightDatasetKind} from "../../src/controller/IInsightFacade";

describe("Server", () => {

	let facade: InsightFacade;
	let server: Server;

	before(async () => {
		// facade = new InsightFacade();
		server = new Server(4321);
		// TODO: start server here once and handle errors properly
		server.start().then(() => {
			console.info("App::initServer() - started");
		}).catch((err: Error) => {
			console.error(`App::initServer() - ERROR: ${err.message}`);
		});
	});

	after(async () => {
		// TODO: stop server here once!
		server.stop().then(() => {
			console.info("Test::Server - stopped");
		}).catch(() => {
			console.error("Test::Server - ERROR");
		});
	});

	beforeEach(() => {
		// might want to add some process logging here to keep track of what's going on
	});

	afterEach(() => {
		// might want to add some process logging here to keep track of what's going on
	});

	// Sample on how to format PUT requests
	it("PUT test", async () => {
		const file = fs.readFileSync("test/resources/archives/singleSection.zip");
		try {
			return request("http://localhost:4321")
				.put("/dataset/mysections/sections")
				.send(file)
				.set("Content-Type", "application/x-zip-compressed")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// more assertions here
					expect(res.body.result).to.have.members(["mysections"]);
				})
				.catch((err) => {
					console.log(err.message);
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	it("PUT test for courses dataset", async () => {
		const file = fs.readFileSync("test/resources/archives/pair.zip");
		try {
			return request("http://localhost:4321")
				.put("/dataset/sections/sections")
				.send(file)
				.set("Content-Type", "application/x-zip-compressed")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// more assertions here
					expect(res.body.result).to.have.members(["sections", "mysections"]);
				})
				.catch((err) => {
					console.log(err.message);
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	it ("GET test", async () => {
		try {
			return request("http://localhost:4321")
				.get("/dataset")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// more assertions here
					expect(res.body.result).to.be.deep.equal([
						{
							id: "mysections",
							kind: InsightDatasetKind.Sections,
							numRows: 1
						},
						{
							id: "sections",
							kind: InsightDatasetKind.Sections,
							numRows: 64612
						}
					]);
				})
				.catch((err) => {
					console.log(err.message);
					// some logging here please
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	it("PUT test3", async () => {
		const file = fs.readFileSync("test/resources/archives/campus.zip");
		try {
			return request("http://localhost:4321")
				.put("/dataset/rooms/rooms")
				.send(file)
				.set("Content-Type", "application/x-zip-compressed")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// more assertions here
					expect(res.body.result).to.have.members(["sections", "mysections", "rooms"]);
				})
				.catch((err) => {
					console.log(err.message);
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	it("POST test for courses dataset", async () => {
		try {
			return request("http://localhost:4321")
				.post("/query")
				.send({
					WHERE: {},
					OPTIONS: {
						COLUMNS: [
							"mysections_dept",
							"mysections_id",
							"mysections_avg"
						]
					}
				})
				.set("Content-Type", "application/json")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// more assertions here
					expect(res.body.result).to.be.deep.equal(
						[{mysections_dept: "hist", mysections_id: "256", mysections_avg: 74.65}]);
				})
				.catch((err) => {
					console.log(err.message);
					// some logging here please
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	it ("DELETE test", async () => {
		try {
			return request("http://localhost:4321")
				.delete("/dataset/sections")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// more assertions here
					expect(res.body.result).to.be.equal("sections");
				})
				.catch((err) => {
					console.log(err.message);
					// some logging here please
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	it ("DELETE test2", async () => {
		try {
			return request("http://localhost:4321")
				.delete("/dataset/mysections")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// more assertions here
					expect(res.body.result).to.be.equal("mysections");
				})
				.catch((err) => {
					console.log(err.message);
					// some logging here please
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	it ("DELETE test3", async () => {
		try {
			return request("http://localhost:4321")
				.delete("/dataset/rooms")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// more assertions here
					expect(res.body.result).to.be.equal("rooms");
				})
				.catch((err) => {
					console.log(err.message);
					// some logging here please
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	// The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
