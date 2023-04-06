// import {Box} from "@mui/material";
// import React from "react";
// import {styled} from "@mui/material/styles";
// import Table from "@mui/material/Table";
// import TableBody from "@mui/material/TableBody";
// import TableCell, {tableCellClasses} from "@mui/material/TableCell";
// import TableContainer from "@mui/material/TableContainer";
// import TableHead from "@mui/material/TableHead";
// import TableRow from "@mui/material/TableRow";
// import Paper from "@mui/material/Paper";
// import Typography from "@mui/material/Typography";
// import {HavingMaxBet} from "../Service";
// import {useEffect, useState} from "react";
//
// const StyledTableCell = styled(TableCell)(({theme}) => ({
// 	[`&.${tableCellClasses.head}`]: {
// 		backgroundColor: theme.palette.common.black,
// 		color: theme.palette.common.white,
// 	},
// 	[`&.${tableCellClasses.body}`]: {
// 		fontSize: 14,
// 	},
// }));
//
// const StyledTableRow = styled(TableRow)(({theme}) => ({
// 	"&:nth-of-type(odd)": {
// 		backgroundColor: theme.palette.action.hover,
// 	},
// 	// hide last border
// 	"&:last-child td, &:last-child th": {
// 		border: 0,
// 	},
// }));
//
// let rows_Bettor = [];
//
// function HavingFeed() {
// 	const [over100, setOver100] = useState();
//
// 	useEffect(() => {
// 		const getData = async () => {
// 			const data = await HavingMaxBet();
// 			console.log(data);
// 			setOver100(data);
// 		};
//
// 		getData();
// 	}, []);
//
// 	console.log(over100);
//
// 	return (
// 		over100 && (
// 			<Box bgcolor="skyblue" flex={4} p={2}>
// 				<Typography variant="h2" gutterBottom>
// 					Bettors With A Maximum Bet Greater Than $100 Table
// 				</Typography>
// 				<TableContainer component={Paper}>
// 					<Table sx={{minWidth: 700}} aria-label="customized table">
// 						<TableHead>
// 							<TableRow>
// 								<StyledTableCell>Name</StyledTableCell>
// 								<StyledTableCell align="right">Email</StyledTableCell>
// 								<StyledTableCell align="right">Address</StyledTableCell>
// 								<StyledTableCell align="right">Maximum Bet</StyledTableCell>
// 							</TableRow>
// 						</TableHead>
// 						<TableBody>
// 							{over100.map((rows_Bettor) => (
// 								<StyledTableRow key={rows_Bettor.Account_ID}>
// 									<StyledTableCell component="th" scope="row">
// 										{rows_Bettor.Bettor_Name}
// 									</StyledTableCell>
// 									<StyledTableCell align="right">{rows_Bettor.Email}</StyledTableCell>
// 									<StyledTableCell align="right">{rows_Bettor.Bettor_Address}</StyledTableCell>
// 									<StyledTableCell align="right">{"$" + rows_Bettor.amt}</StyledTableCell>
// 								</StyledTableRow>
// 							))}
// 						</TableBody>
// 					</Table>
// 				</TableContainer>
// 			</Box>
// 		)
// 	);
// }
// export default HavingFeed;
