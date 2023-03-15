import Building from "./Building";
import {DataContent} from "./DataContent";

export default class Room implements DataContent{
	private building: Building;
	private number: string; 	// room number
	private name: string;		// shortName + "_" + number
	private seats: number;		// capacity
	private type: string;		// room type
	private furniture: string;	// room furniture
	private href: string;		// link to the full details online


	constructor(building: Building, number: string, seats: number, type: string, furniture: string, href: string) {
		this.building = building;
		this.number = number;
		this.name = building.getShortName() + "_" + number;
		this.seats = seats;
		this.type = type;
		this.furniture = furniture;
		this.href = href;
	}

	public getSectionField(field: string): any {
		switch (field) {
			case "fullname": {
				return this.building.getFullName();
			}
			case "shortname": {
				return this.building.getShortName();
			}
			case "address": {
				return this.building.getAddress();
			}
			case "lat": {
				return this.building.getLat();
			}
			case "lon": {
				return this.building.getLon();
			}
			case "number": {
				return this.number;
			}
			case "seats": {
				return this.seats;
			}
			case "name": {
				return this.name;
			}
			case "type": {
				return this.type;
			}
			case "furniture": {
				return this.furniture;
			}
			case "href": {
				return this.href;
			}
			default: {
				return null;
			}
		}
	}

	public getSectionMField(mfield: string): number | null {
		switch (mfield) {
			case "lat": {
				return this.building.getLat();
			}
			case "lon": {
				return this.building.getLon();
			}
			case "seats": {
				return this.seats;
			}
			default: {
				return null;
			}
		}
	}

	public getSectionSField(sfield: string): string | null {
		switch (sfield) {
			case "fullname": {
				return this.building.getFullName();
			}
			case "shortname": {
				return this.building.getShortName();
			}
			case "number": {
				return this.number;
			}
			case "name": {
				return this.name;
			}
			case "address": {
				return this.building.getAddress();
			}
			case "type": {
				return this.type;
			}
			case "furniture": {
				return this.furniture;
			}
			case "href": {
				return this.href;
			}
			default: {
				return null;
			}
		}
	}
}
