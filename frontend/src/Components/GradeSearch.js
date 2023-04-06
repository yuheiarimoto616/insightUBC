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
import IconButton from "@mui/material/IconButton";
import * as PropTypes from "prop-types";

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

const options_year_session = ["2022", "2021", "2020", "2019"];
const options_subject = ["CPSC", "MATH", "CHEM", "BIOL", "PHYS"];
const options_course_number = [110, 121, 210, 213, 221];
const options_section = ["ALL", 101, 102, 104, 105];

function CloseIcon(props) {
	return null;
}

CloseIcon.propTypes = {fontSize: PropTypes.string};

function GradeSearch() {

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

	const [value_year_session, setValue_year_session] = React.useState(options_year_session[0]);
	const [value_subject, setValue_subject] = React.useState(options_subject[0]);
	const [value_course, setValue_course] = React.useState(options_course_number[0]);
	const [value_section, setValue_section] = React.useState(options_section[0]);

	const [inputValue_year_session, setInputValue_year_session] = React.useState("");
	const [inputValue_subject, setInputValue_subject] = React.useState("");
	const [inputValue_course, setInputValue_course] = React.useState("");
	const [inputValue_section, setInputValue_section] = React.useState("");


	const [value_result_avg, setValue_result_avg] = React.useState();
	const [value_result_year, setValue_result_year] = React.useState();
	const [value_result_subject, setValue_result_subject] = React.useState();
	const [value_result_course, setValue_result_course] = React.useState();

	async function getAvgGrade() {
		https://react-bootstrap.github.io/components/alerts/
		if (value_year_session === null || value_subject === null || value_course === null) {
			setErrorMsg("Field cannot be empty!");
			setOpen(true);
			return;
		}

		if (!/^\d+$/.test(String(value_year_session))) {
			setErrorMsg("Year can't contain non-numeric letters!")
			setOpen(true);
			return;
		} else if (/\d/.test(String(value_subject))) {
			setErrorMsg("Subject can't contain numbers!")
			setOpen(true);
			return;
		}

		const subject = String(value_subject).toLowerCase();

		let query = {
			WHERE: {
				AND: [
					{
						IS: {
							sections_dept: subject
						}
					},
					{
						IS: {
							sections_id: String(value_course)
						}
					},
					{
						EQ: {
							sections_year: Number(value_year_session)
						}
					}
				]
			},
			OPTIONS: {
				COLUMNS: [
					"yearAvg",
					"sections_year",
					"sections_dept",
					"sections_id"
				]
			},
			TRANSFORMATIONS: {
				GROUP: [
					"sections_year",
					"sections_dept",
					"sections_id"
				],
				APPLY: [
					{
						yearAvg: {
							AVG: "sections_avg"
						}
					}
				]
			}
		};

		console.log(JSON.stringify(query));

		postData("http://localhost:4321/query", query).then((data) => {
			console.log(JSON.stringify(data));
			let res = data.result;
			if (res.length === 0) {
				setErrorMsg("Sorry data doesn't exist for the given inputs!")
				setOpen(true);
				return;
			}
			setValue_result_avg(data.result[0].yearAvg);
			setValue_result_year(data.result[0].sections_year);
			setValue_result_subject(data.result[0].sections_dept);
			setValue_result_course(data.result[0].sections_id);
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
				View Grades By Section
			</Typography>
			<Container sx={{width: "100%", display: "flex", justifyContent: "center"}}>
				<Stack spacing={2} direction="row" useFlexGap flexWrap="wrap">
					<Autocomplete
						value={value_year_session}
						onChange={(event, newValue) => {
							setValue_year_session(newValue);
						}}
						inputValue={inputValue_year_session}
						onInputChange={(event, newInputValue) => {
							setInputValue_year_session(newInputValue);
						}}
						freeSolo={true}
						id="Year_Autocomplete"
						options={options_year_session}
						sx={{width: 200}}
						renderInput={(params) => <TextField {...params} label="Year" />}
					/>
					<Autocomplete
						value={value_subject}
						onChange={(event, newValue) => {

							setValue_subject(newValue);
						}}
						inputValue={inputValue_subject}
						onInputChange={(event, newInputValue) => {
							setInputValue_subject(newInputValue);
						}}
						freeSolo={true}
						id="Subject_Autocomplete"
						options={options_subject}
						sx={{width: 200}}
						renderInput={(params) => <TextField {...params} label="Subject" />}
					/>
					<Autocomplete
						value={value_course}
						onChange={(event, newValue) => {
							setValue_course(newValue);
						}}
						freeSolo={true}
						inputValue={inputValue_course}
						onInputChange={(event, newInputValue) => {
							setInputValue_course(newInputValue);
						}}
						id="Course_Autocomplete"
						options={options_course_number}
						sx={{width: 200}}
						renderInput={(params) => <TextField {...params} label="Course Number" />}
					/>
					<Button variant="contained" endIcon={<SearchIcon />} onClick = {getAvgGrade}>
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
						</TableRow>
					</TableHead>
					<TableBody>
						<StyledTableRow key = "result">
							<StyledTableCell component="th" scope="row">{value_result_avg}</StyledTableCell>
							<StyledTableCell align="right">{value_result_year}</StyledTableCell>
							<StyledTableCell align="right">{value_result_subject}</StyledTableCell>
							<StyledTableCell align="right">{value_result_course}</StyledTableCell>
						</StyledTableRow>
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
}

export default GradeSearch;
