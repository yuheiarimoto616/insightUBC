import Dataset from "./Dataset";
import Room from "./Room";
import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import Section from "./Section";
import JSZip from "jszip";
import parse5, {parse} from "parse5";
import {ChildNode, Element, TextNode} from "parse5/dist/tree-adapters/default";
import Building from "./Building";
import {Attribute} from "parse5/dist/common/token";

export default class RoomsDataset extends Dataset {
	private rooms: Room[];

	constructor(id: string) {
		super(id, InsightDatasetKind.Rooms);
		this.rooms = [];
	}

	public async addContent(content: string) {
		let zip = new JSZip();

		try {
			await zip.loadAsync(content, {base64: true});
		} catch (e) {
			return Promise.reject(new InsightError("Not zip file"));
		}

		if (zip.file("index.htm") === null) {
			return Promise.reject(new InsightError("No index.htm"));
		}

		let indexContent = await zip.file("index.htm")?.async("string");

		let document = parse(indexContent as string);

		let children = document.childNodes;

		let tables: Element[] = this.getTables(children, []);

		if (tables.length === 0) {
			return Promise.reject(new InsightError("No Buildings"));
		}

		let jobs: any = [];
		for (let table of tables) {
			let tr = this.getTableRows(table.childNodes);
			for (let row of tr) {
				jobs.push(this.processBuilding(row, zip));
			}
		}

		await Promise.all(jobs);
		if (this.rooms.length === 0) {
			return Promise.reject(new InsightError("Invalid dataset with no valid room"));
		}
	}

	private async processBuilding(row: Element, zip: JSZip): Promise<void> {
		let building;

		try {
			building = await this.getBuilding(row);
		} catch (e) {
			return Promise.reject();
		}

		if (building === null) {
			return Promise.reject();
		}

		if (zip.file(building.getLink()) === null) {
			return Promise.reject();
		}

		let content = await zip.file(building.getLink())?.async("string");

		let document = parse(content as string);

		let tables: Element[] = this.getTables(document.childNodes, []);

		for (let table of tables) {
			let tr = this.getTableRows(table.childNodes);
			for (let r of tr) {
				let room = this.getRoom(r, building);

				if (room === null) {
					continue;
				}

				this.addRoom(room);
			}
		}

		return Promise.resolve();
	}

	private async getBuilding(row: Element): Promise<Building | null> {
		let buildingCode = null;
		let buildingName = null;
		let buildingAddress = null;
		let buildingLink = "";

		for (let cell of row.childNodes) {
			if (!this.isValidCell(cell)) {
				continue;
			}

			cell = cell as Element;
			let classAttrs = this.getClassAttributes(cell.attrs);

			if (classAttrs.includes("views-field-field-building-code")) {
				buildingCode = this.getValue(cell.childNodes);
			} else if (classAttrs.includes("views-field-title")) {
				buildingName = this.getValue(cell.childNodes);
			} else if (classAttrs.includes("views-field-field-building-address")) {
				buildingAddress = this.getValue(cell.childNodes);
			} else if (classAttrs.includes("views-field-nothing")) {
				buildingLink = this.getLink(cell.childNodes);
			}
		}

		if (buildingCode === null || buildingName === null || buildingAddress === null || buildingLink === "") {
			return Promise.resolve(null);
		}

		let building =  new Building(buildingName, buildingCode, buildingAddress, buildingLink);
		try {
			await building.setLatAndLon();
		} catch (e) {
			return Promise.reject(new InsightError((e as Error).message));
		}

		return Promise.resolve(building);
	}

	private getRoom(room: Element, building: Building) {
		let roomNumber = null;
		let roomSeats = null;
		let roomType = null;
		let roomFurniture = null;
		let roomHref = null;

		for (let cell of room.childNodes) {
			if (!this.isValidCell(cell)) {
				continue;
			}

			cell = cell as Element;
			let classAttrs = this.getClassAttributes(cell.attrs);

			if (classAttrs.includes("views-field-field-room-number")) {
				roomNumber = this.getValue(cell.childNodes);
			} else if (classAttrs.includes("views-field-field-room-capacity")) {
				roomSeats = this.getValue(cell.childNodes);
			} else if (classAttrs.includes("views-field-field-room-furniture")) {
				roomFurniture = this.getValue(cell.childNodes);
			} else if (classAttrs.includes("views-field-field-room-type")) {
				roomType = this.getValue(cell.childNodes);
			} else if (classAttrs.includes("views-field-nothing")) {
				roomHref = this.getLink(cell.childNodes);
			}
		}

		if (roomNumber === null || roomSeats === null || roomType === null ||
			roomFurniture === null || roomHref === null) {
			return null;
		}

		return new Room(building, roomNumber, +roomSeats, roomType, roomFurniture, roomHref);
	}

	private getLink(from: ChildNode[]) {
		for (let child of from) {
			if (child.nodeName === "a"){
				let attrs = child.attrs;
				for (let attribute of attrs) {
					if (attribute.name === "href") {
						return attribute.value;
					}
				}
			}
		}
		return "";
	};

	private getValue(from: ChildNode[]): string {
		if (from.length === 0) {
			return "";
		}

		let ret = "";
		let textNodes = this.getTextNodes(from, []);

		for (let node of textNodes) {
			ret = node.value.trim();
			if (ret !== "") {
				break;
			}
		}
		return ret;
	}

	private isValidCell(cell: ChildNode) {
		if (cell.nodeName !== "td") {
			return false;
		}

		let classAttrs = this.getClassAttributes(cell.attrs);
		if (classAttrs.length === 0) {
			return false;
		}

		if (!classAttrs.includes("views-field")) {
			return false;
		}

		return true;
	}

	private getClassAttributes(attrs: Attribute[]) {
		for (let attr of attrs) {
			if (attr.name === "class") {
				return attr.value.split(" ");
			}
		}

		return [];
	}

	private getTableRows(tChildren: ChildNode[]) {
		let tr = [];
		for (let tableChild of tChildren) {
			if (tableChild.nodeName === "tbody") {
				for (let tbodyChild of tableChild.childNodes) {
					if (tbodyChild.nodeName === "tr") {
						tr.push(tbodyChild);
					}
				}
			}
		}
		return tr;
	}

	private getTextNodes(from: ChildNode[], ret: TextNode[]) {
		for (let child of from) {
			if (child.nodeName === "#text") {
				ret.push(child as TextNode);
			} else if (!Object.hasOwn(child, "childNodes")) {
				continue;
			} else {
				this.getTextNodes((child as Element).childNodes, ret);
			}
		}

		return ret;
	}

	private getTables(children: ChildNode[], ret: Element[]) {
		for (let child of children) {
			if (child.nodeName === "table") {
				ret.push(child);
			} else if (!Object.hasOwn(child, "childNodes")) {
				continue;
			} else {
				this.getTables((child as Element).childNodes, ret);
			}
		}

		return ret;
	};

	public addRoom(room: Room) {
		this.rooms.push(room);
	}

	public getContents(): Room[] {
		return this.rooms;
	}
}
