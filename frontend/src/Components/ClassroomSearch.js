import {Alert, Autocomplete, Box, Button, Collapse, Container, Stack, TextField} from "@mui/material";
import React from "react";
import {styled} from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, {tableCellClasses} from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";

const StyledTableCell = styled(TableCell)(({theme}) => ({
	[`&.${tableCellClasses.head}`]: {
		backgroundColor: theme.palette.common.black,
		color: theme.palette.common.white,
	},
	[`&.${tableCellClasses.body}`]: {
		fontSize: 14,
	},
}));

const StyledTableRow = styled(TableRow)(({theme}) => ({
	"&:nth-of-type(odd)": {
		backgroundColor: theme.palette.action.hover,
	},
	// hide last border
	"&:last-child td, &:last-child th": {
		border: 0,
	},
}));

const furnitureTypeOptions = [
	"Classroom-Fixed Tables/Movable Chairs",
	"Classroom-Movable Tables & Chairs",
	"Classroom-Moveable Tables & Chairs",
	"Classroom-Fixed Tablets",
	"Classroom-Fixed Tables/Fixed Chairs",
	"Classroom-Fixed Tables/Moveable Chairs",
	"Classroom-Movable Tablets",
	"Classroom-Hybrid Furniture",
	"Classroom-Learn Lab"
];

const capacityOptions = [];

function ClassroomSearch() {
	// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
	async function postData(url = "", data = {}) {
		// Default options are marked with *
		const response = await fetch(url, {
			method: "POST", // *GET, POST, PUT, DELETE, etc.
			mode: "cors", // no-cors, *cors, same-origin
			cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
			credentials: "same-origin", // include, *same-origin, omit
			headers: {
				"Content-Type": "application/json",
				// 'Content-Type': 'application/x-www-form-urlencoded',
			},
			redirect: "follow", // manual, *follow, error
			referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
			body: JSON.stringify(data), // body data type must match "Content-Type" header
		});
		return response.json(); // parses JSON response into native JavaScript objects
	}

	const [open, setOpen] = React.useState(false);
	const [errorMsg, setErrorMsg] = React.useState("");

	const [value_furniture, setValue_furniture] = React.useState(furnitureTypeOptions[0]);
	const [value_capacity, setValue_capacity] = React.useState();

	const [inputValue_furniture, setInputValue_furniture] = React.useState("");
	const [inputValue_capacity, setInputValue_capacity] = React.useState("");

	const [value_result, setValue_result] = React.useState([]);

	async function getClassrooms() {
		if (!/^\d+$/.test(String(value_capacity))) {
			setErrorMsg("Year can't contain non-numeric letters! Try again!")
			setOpen(true);
			return;
		}

		let query = {
			WHERE: {
				AND: [
					{
						IS: {
							campus_furniture: value_furniture
						}
					},
					{
						GT: {
							campus_seats: Number(value_capacity)
						}
					}
				]
			},
			OPTIONS: {
				COLUMNS: [
					"campus_fullname",
					"campus_name",
					"campus_address",
					"campus_seats",
					"campus_type",
					"campus_href"
				],
				ORDER: {
					dir: "UP",
					keys: [
						"campus_seats"
					]
				}
			}
		};

		console.log(JSON.stringify(query));

		postData("http://localhost:4321/query", query).then((data) => {
			console.log(JSON.stringify(data));
			let res = data.result;
			if (res.length === 0) {
				setErrorMsg("No Classroom Matched!")
				setOpen(true);
			}
			setValue_result(data.result);
		});
	}

	return (
		<Box bgcolor="skyblue" flex={4} p={2}>
			<Box sx={{ width: '100%' }}>
				<Collapse in={open}>
					<Alert
						severity="error"
						onClose={() => setOpen(false)}
						sx={{ mb: 2 }}
					>
						{errorMsg}
					</Alert>
				</Collapse>
			</Box>
			<Typography variant="h4" gutterBottom paddingTop={4}>
				View Classroom Insights
			</Typography>
			<Container sx={{width: "100%", display: "flex", justifyContent: "center"}}>
				<Stack spacing={2} direction="row" useFlexGap flexWrap="wrap">
					<Autocomplete
						value={value_capacity}
						onChange={(event, newValue) => {
							setValue_capacity(newValue);
						}}
						freeSolo={true}
						inputValue={inputValue_capacity}
						onInputChange={(event, newInputValue) => {
							setInputValue_capacity(newInputValue);
						}}
						id="Course_Autocomplete"
						options={capacityOptions}
						sx={{width: 200}}
						renderInput={(params) => <TextField {...params} label="Number of Seats" />}
					/>
					<Autocomplete
						value={value_furniture}
						onChange={(event, newValue) => {
							setValue_furniture(newValue);
						}}
						freeSolo={true}
						inputValue={inputValue_furniture}
						onInputChange={(event, newInputValue) => {
							setInputValue_furniture(newInputValue);
						}}
						id="Sections_Autocomplete"
						options={furnitureTypeOptions}
						sx={{width: 400}}
						renderInput={(params) => <TextField {...params} label="Furniture Type" />}
					/>
					<Button variant="contained" endIcon={<SearchIcon />} onClick = {getClassrooms}>
						Submit
					</Button>
				</Stack>
			</Container>

			<Typography variant="h2" gutterBottom paddingTop={4}>
				Class Data Table
			</Typography>
			<TableContainer component={Paper}>
				<Table sx={{minWidth: 700}} aria-label="customized table">
					<TableHead>
						<TableRow>
							<StyledTableCell align="right">Building</StyledTableCell>
							<StyledTableCell align="right">Room Name</StyledTableCell>
							<StyledTableCell align="right">Seats</StyledTableCell>
							<StyledTableCell align="right">Type</StyledTableCell>
							<StyledTableCell align="right">Address</StyledTableCell>
							<StyledTableCell align="right">Link</StyledTableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{value_result.map((value_result) => (
							<StyledTableRow>
								<StyledTableCell component="th" scope="row">
									{value_result.campus_fullname}
								</StyledTableCell>
								<StyledTableCell align="right">{value_result.campus_name}</StyledTableCell>
								<StyledTableCell align="right">{value_result.campus_seats}</StyledTableCell>
								<StyledTableCell align="right">{value_result.campus_type}</StyledTableCell>
								<StyledTableCell align="right">{value_result.campus_address}</StyledTableCell>
								<StyledTableCell align="right">{value_result.campus_href}</StyledTableCell>
							</StyledTableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
}

export default ClassroomSearch;
