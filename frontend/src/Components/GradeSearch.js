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

const options_year_session = ["2022W", "2021S", "2021W", "2020S", "2020W"];
const options_subject = ["CPSC", "MATH", "CHEM", "BIOL", "PHYS"];
const options_course_number = [110, 121, 210, 213, 221];
const options_section = ["ALL", 101, 102, 104, 105];

function createData_Teams(team_id, team_name, country, player_roster, number_of_players) {
	return {team_id, team_name, country, player_roster, number_of_players};
}

const rows_Teams = [
	createData_Teams(70, "2022W", "CPSC", 110, "ALL"),
	createData_Teams(68, "2021S", "CPSC", 110, 102),
	createData_Teams(83, "2021W", "CPSC", 110, "ALL"),
	createData_Teams(75, "2020S", "CPSC", 110, 101),
	createData_Teams(76, "2020W", "CPSC", 110, 102),
];

function GradeSearch() {
	const [value_year_session, setValue_year_session] = React.useState(options_year_session[0]);
	const [value_subject, setValue_subject] = React.useState(options_subject[0]);
	const [value_course, setValue_course] = React.useState(options_course_number[0]);
	const [value_section, setValue_section] = React.useState(options_section[0]);
	const [inputValue, setInputValue] = React.useState("");

	return (
		<Box bgcolor="skyblue" flex={4} p={2}>
			<Typography variant="h4" gutterBottom paddingTop={4}>
				View Grades By Section
			</Typography>
			<Container sx={{width: "100%", display: "flex", justifyContent: "center"}}>
				<Stack spacing={2} direction="row" useFlexGap flexWrap="wrap">
					<Autocomplete
						value={value_year_session}
						onChange={(event, newValue) => {
							setValue_year_session(newValue);
						}}
						inputValue={inputValue}
						onInputChange={(event, newInputValue) => {
							setInputValue(newInputValue);
						}}
						id="Year_Autocomplete"
						options={options_year_session}
						sx={{width: 200}}
						renderInput={(params) => <TextField {...params} label="YearSession" />}
					/>
					<Autocomplete
						value={value_year_session}
						onChange={(event, newValue) => {
							setValue_year_session(newValue);
						}}
						inputValue={inputValue}
						onInputChange={(event, newInputValue) => {
							setInputValue(newInputValue);
						}}
						id="Subject_Autocomplete"
						options={options_subject}
						sx={{width: 200}}
						renderInput={(params) => <TextField {...params} label="Subject" />}
					/>
					<Autocomplete
						value={value_year_session}
						onChange={(event, newValue) => {
							setValue_year_session(newValue);
						}}
						inputValue={inputValue}
						onInputChange={(event, newInputValue) => {
							setInputValue(newInputValue);
						}}
						id="Course_Autocomplete"
						options={options_course_number}
						sx={{width: 200}}
						renderInput={(params) => <TextField {...params} label="Course Number" />}
					/>
					<Autocomplete
						value={value_year_session}
						onChange={(event, newValue) => {
							setValue_year_session(newValue);
						}}
						inputValue={inputValue}
						onInputChange={(event, newInputValue) => {
							setInputValue(newInputValue);
						}}
						id="Sections_Autocomplete"
						options={options_section}
						sx={{width: 200}}
						renderInput={(params) => <TextField {...params} label="Sections" />}
					/>
					<Button variant="contained" endIcon={<SearchIcon />}>
						Submit
					</Button>
				</Stack>
			</Container>

			<Typography variant="h2" gutterBottom paddingTop={4}>
				Grades Data Table
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

export default GradeSearch;
