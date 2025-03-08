import logo from './logo.svg';
import { useState, useEffect } from "react";

import { getTest } from "./functions/test";

import './App.css';

function App() {
	const [data, setData] = useState("a");

	useEffect(() => {
		getTest()
			.then((res) => setData(res.message))
			.catch((err) => console.log(err));
	}, []);

	return (
		<div className="App">
			<h1>{data}</h1>
		</div>
	);
}

export default App;