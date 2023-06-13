const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();


// middlewares
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Summer Camp Running");
});


app.listen(port, () => {
    console.log("Listening to PORT: " + port);
});