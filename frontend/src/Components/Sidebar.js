import {Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Switch} from "@mui/material";
import React from "react";
import ClassIcon from "@mui/icons-material/Class";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import SchoolIcon from "@mui/icons-material/School";
import GradingIcon from "@mui/icons-material/Grading";
import RuleIcon from "@mui/icons-material/Rule";
import DarkModeIcon from "@mui/icons-material/DarkMode";

const Sidebar = () => {
	return (
		<Box flex={0.8} p={2}>
			<List>
				<ListItem disablePadding>
					<ListItemButton component="a" href="mainpage">
						<ListItemIcon>
							<ClassIcon />
						</ListItemIcon>
						<ListItemText primary="View Grades by Section" />
					</ListItemButton>
				</ListItem>
				<ListItem disablePadding>
					<ListItemButton component="a" href="classroomInsights">
						<ListItemIcon>
							<MeetingRoomIcon />
						</ListItemIcon>
						<ListItemText primary="View Classroom Insights" />
					</ListItemButton>
				</ListItem>
				<ListItem disablePadding>
					<ListItemButton component="a" href="update">
						<ListItemIcon>
							<SchoolIcon />
						</ListItemIcon>
						<ListItemText primary="Filter Classes by Professors" />
					</ListItemButton>
				</ListItem>
				<ListItem disablePadding>
					<ListItemButton component="a" href="select">
						<ListItemIcon>
							<GradingIcon />
						</ListItemIcon>
						<ListItemText primary="Filter Classes by Department " />
					</ListItemButton>
				</ListItem>
				<ListItem disablePadding>
					<ListItemButton component="a" href="projection">
						<ListItemIcon>
							<RuleIcon />
						</ListItemIcon>
						<ListItemText primary="Order Table" />
					</ListItemButton>
				</ListItem>
				<ListItem disablePadding>
					<ListItemButton component="a" href="home">
						<ListItemIcon>
							<DarkModeIcon />
						</ListItemIcon>
						<Switch />
					</ListItemButton>
				</ListItem>
			</List>
		</Box>
	);
};

export default Sidebar;
