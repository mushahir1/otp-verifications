const express = require("express");
const mongoose = require('mongoose');
const config = require("./config");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
// const { default: mongoose } = require("mongoose");

const app = express();
// Middleware
app.use(bodyParser.json());

mongoose.connect(config.DB_CON, { useNewUrlParser: true, useUnifiedTopology: true });
const PORT = process.env.PORT || 4000;

app.use("/",userRoutes);

app.listen(PORT, () => {
    console.log(`connected on port ${PORT}`)
});