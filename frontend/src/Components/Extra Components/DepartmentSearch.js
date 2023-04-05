import {Autocomplete, Box, Button, Container, Stack, TextField} from "@mui/material";
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

const options = ["2022W", "2021W"];

function createData_Teams(team_id, team_name, country, player_roster, number_of_players) {
	return {team_id, team_name, country, player_roster, number_of_players};
}

const rows_Teams = [
	createData_Teams(1, "Canucks", "Canada", "Bo Horvat, Daniel Sedin, Roberto Luongo", 3),
	createData_Teams(2, "Raptors", "Canada", "Michael Jordan", 1),
	createData_Teams(3, "Angels", "United States", "Ohtani Shohei, Mike Trout, Tyler Anderson, Hunter Renfroe", 4),
	createData_Teams(4, "Whitecaps", "Canada", "Lionel Messi, Cristiano Ronaldo", 2),
	createData_Teams(5, "Mariners", "United States", "Julio Rodriguez, Jarred Kalenic", 2),
];

function ProfessorSearch() {
	const [value, setValue] = React.useState(options[0]);
	const [inputValue, setInputValue] = React.useState("");

	return (
		<Box bgcolor="skyblue" flex={4} p={2}>
			<Typography variant="h4" gutterBottom paddingTop={4}>
				Filter Classes by Departments
			</Typography>
			<Container sx={{width: "100%", display: "flex", justifyContent: "center"}}>
				<Stack spacing={2} direction="row" useFlexGap flexWrap="wrap">
					<Autocomplete
						value={value}
						onChange={(event, newValue) => {
							setValue(newValue);
						}}
						inputValue={inputValue}
						onInputChange={(event, newInputValue) => {
							setInputValue(newInputValue);
						}}
						id="Year_Autocomplete"
						options={options}
						sx={{width: 200}}
						renderInput={(params) => <TextField {...params} label="Short Name" />}
					/>
					<Autocomplete
						value={value}
						onChange={(event, newValue) => {
							setValue(newValue);
						}}
						inputValue={inputValue}
						onInputChange={(event, newInputValue) => {
							setInputValue(newInputValue);
						}}
						id="Subject_Autocomplete"
						options={options}
						sx={{width: 200}}
						renderInput={(params) => <TextField {...params} label="Room Number" />}
					/>
					<Autocomplete
						value={value}
						onChange={(event, newValue) => {
							setValue(newValue);
						}}
						inputValue={inputValue}
						onInputChange={(event, newInputValue) => {
							setInputValue(newInputValue);
						}}
						id="Course_Autocomplete"
						options={options}
						sx={{width: 200}}
						renderInput={(params) => <TextField {...params} label="Number of Seats" />}
					/>
					<Autocomplete
						value={value}
						onChange={(event, newValue) => {
							setValue(newValue);
						}}
						inputValue={inputValue}
						onInputChange={(event, newInputValue) => {
							setInputValue(newInputValue);
						}}
						id="Sections_Autocomplete"
						options={options}
						sx={{width: 200}}
						renderInput={(params) => <TextField {...params} label="Furniture Type" />}
					/>
					<Button variant="contained" endIcon={<SearchIcon />}>
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
							<StyledTableCell>Average Grade</StyledTableCell>
							<StyledTableCell align="right">Year Session</StyledTableCell>
							<StyledTableCell align="right">Subject</StyledTableCell>
							<StyledTableCell align="right">Course Number</StyledTableCell>
							<StyledTableCell align="right">Sections</StyledTableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{rows_Teams.map((rows_Teams) => (
							<StyledTableRow key={rows_Teams.team_id}>
								<StyledTableCell component="th" scope="row">
									{rows_Teams.team_id}
								</StyledTableCell>
								<StyledTableCell align="right">{rows_Teams.team_name}</StyledTableCell>
								<StyledTableCell align="right">{rows_Teams.country}</StyledTableCell>
								<StyledTableCell align="right">{rows_Teams.player_roster}</StyledTableCell>
								<StyledTableCell align="right">{rows_Teams.number_of_players}</StyledTableCell>
							</StyledTableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
}

export default ProfessorSearch;
