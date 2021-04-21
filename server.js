const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
var morgan = require("morgan");
var dotenv = require("dotenv").config();
const slowDown = require("express-slow-down");

const app = express();

// Global rate limiter
app.enable("trust proxy");
const speedLimiter = slowDown({
  windowMs: 1 * 60 * 1000, // 2 minute
  delayAfter: 10, // allow 100 requests per 15 minutes, then...
  delayMs: 500,
});
app.use(speedLimiter);

// Logger
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

// Cors
app.use(cors());

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./app/models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to almostcl.one API" });
});

require("./app/routes/timer.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
