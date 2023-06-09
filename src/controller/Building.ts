import http from "http";
import {InsightError} from "./IInsightFacade";

export default class Building {
	private fullName: string;
	private shortName: string;
	private address: string;	// building address
	private lat: number = 0;		// building latitude
	private lon: number = 0; 		// building longitude
	private link: string;


	constructor(fullName: string, shortName: string, address: string, link: string, lat?: number, lon?: number) {
		this.fullName = fullName;
		this.shortName = shortName;
		this.address = address;
		this.link = link;

		if (lat && lon) {
			this.lat = lat;
			this.lon = lon;
		}
	}

	public setLatAndLon(): Promise<void> {
		let teamNumber = "004";
		let encodedAddress = encodeURIComponent(this.address);

		let url = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team" + teamNumber + "/" + encodedAddress;

		return new Promise<void>((resolve, reject) => {
			http.get(url, (res) => {
				let rawData = "";

				res.on("data", (chunk) => {
					rawData += chunk;
				});

				res.on("end", () => {
					try {
						let parsedData = JSON.parse(rawData);
						if (Object.hasOwn(parsedData, "error")) {
							reject(parsedData.error);
						}

						this.lat = parsedData.lat;
						this.lon = parsedData.lon;
					} catch (e) {
						reject(new InsightError("No lat and lon"));
					}
				});
			}).on("error", (e) => {
				reject(e);
			});

			resolve();
		});
		// await http.get(url, (res) => {
		// 	let rawData = "";
		// 	res.on("data", (chunk) => {
		// 		rawData += chunk;
		// 	});
		// 	res.on("end", () => {
		// 		try {
		// 			let parsedData = JSON.parse(rawData);
		// 			if (Object.hasOwn(parsedData, "error")) {
		// 				throw new Error(parsedData.error);
		// 			}
		//
		// 			this.lat = parsedData.lat;
		// 			this.lon = parsedData.lon;
		// 		} catch (e) {
		// 			throw Error("No lat and lon");
		// 		}
		// 	}).on("error", (e) => {
		// 		throw e;
		// 	});
		// });
	}

	public getFullName() {
		return this.fullName;
	}

	public getShortName() {
		return this.shortName;
	}

	public getAddress() {
		return this.address;
	}

	public getLat() {
		return this.lat;
	}

	public getLon() {
		return this.lon;
	}

	public getLink() {
		return this.link.substring(2, this.link.length);
	}
}
