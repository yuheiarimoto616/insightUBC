import {BrowserRouter, Routes, Route} from "react-router-dom";
import MainPage from "./Components/MainPage";
import ClassroomInsights from "./Components/ClassroomInsights";
import FilterProfessor from "./Components/Extra Components/FilterProfessors";
import FilterDepartment from "./Components/Extra Components/FilterDepartment";

function App() {
	return (
		<div className="App">
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<MainPage />} />
					<Route path="/mainpage" element={<MainPage />} />
					<Route path="/classroomInsights" element={<ClassroomInsights />} />
					<Route path="/filter_profs" element={<FilterProfessor />} />
					<Route path="/filter_depts" element={<FilterDepartment />} />
					<Route path="/order" element={<FilterDepartment />} />
				</Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
