//App.js
// // import modules
const express = require("express");
// const { json, urlencoded } = express;
const axios = require("axios");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();

// app
const app = express();


// db
mongoose
	.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("DB CONNECTED"))
	.catch((err) => console.log("DB CONNECTION ERROR", err));

// middleware
app.use(morgan("dev"));
// app.use(json());
// app.use(urlencoded({ extended: false }));
app.use(express.json());
app.use(cors({
    origin: "*",  // or "*" to allow all origins (less secure)
    credentials: false,                // if you're using cookies or authentication
  }));

app.get("/hello", (req, res) => {
	res.send("Hello from Express!");
}
);

// routes
const testRoutes = require("./routes/test");
app.use("/", testRoutes);
app.post("/tts", async (req, res) => {
	try {
		const text = JSON.stringify(req.body);
		// console.log(text);
		if (text.length == 0) {
			res.sendStatus(400);
		}
		console.log("Text: ", text);
	const apiKey = process.env.TTS_API_KEY;
	const endpoint = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${apiKey}`;
	const payload = {
		"audioConfig": {
		  "audioEncoding": "MP3",
		  "effectsProfileId": [
			"small-bluetooth-speaker-class-device"
		  ],
		  "pitch": 0,
		  "speakingRate": 1.1
		},
		"input": {
		  "text": text
		},
		"voice": {
		  "languageCode": "en-US",
		  "name": "en-US-Chirp-HD-F"
		}
	  };

	  

	  const response = await axios.post(endpoint, payload);
	  res.json(response.data);
	// console.log("Request body: ", req.body);
	// res.sendStatus(200);
	} catch(error) {
		res.sendStatus(500);
		console.log("Error: ", error.toString());
	}
	

});

// port
const port = process.env.PORT || 8080;

// listener
const server = app.listen(port, () =>
	console.log(`Server is running on port ${port}`)
);