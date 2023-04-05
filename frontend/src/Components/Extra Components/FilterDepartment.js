import React from "react";
import {Stack} from "@mui/material";
import DepartmentSearch from "/Users/Daichi/project_team004/frontend/src/Components/Extra Components/DepartmentSearch";
import Sidebar from "/Users/Daichi/project_team004/frontend/src/Components/Sidebar";
import Navbar from "/Users/Daichi/project_team004/frontend/src/Components/Navbar";

const FilterProfessor = () => {
	return (
		<div className="filter_profs">
			<Navbar />
			<Stack direction={"row"} spacing={1} justifyContent="space-between">
				<Sidebar />
				<DepartmentSearch />
			</Stack>
		</div>
	);
};

export default FilterProfessor;
