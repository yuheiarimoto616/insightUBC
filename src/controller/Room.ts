import Building from "./Building";

export default class Room {
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
}
