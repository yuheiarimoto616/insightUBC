import React from "react";
import {Stack} from "@mui/material";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import ClassroomSearch from "./ClassroomSearch";

const ClassroomInsights = () => {
	return (
		<div className="classroomInsights">
			<Navbar />
			<Stack direction={"row"} spacing={1} justifyContent="space-between">
				<Sidebar />
				<ClassroomSearch />
			</Stack>
		</div>
	);
};

export default ClassroomInsights;
