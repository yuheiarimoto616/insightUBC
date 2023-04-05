import {BrowserRouter, Routes, Route} from "react-router-dom";
import MainPage from "./Components/MainPage";
import ClassroomInsights from "./Components/ClassroomInsights";

function App() {
	return (
		<div className="App">
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<MainPage />} />
					<Route path="/mainpage" element={<MainPage />} />
					<Route path="/classroomInsights" element={<ClassroomInsights />} />
				</Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
