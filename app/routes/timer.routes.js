module.exports = (app) => {
  const timers = require("../controllers/timer.controller.js");

  var router = require("express").Router();

  // Create a new Timer
  router.post("/", timers.create);

  // Retrieve all Timers
  router.get("/list/:page", timers.findAll);

  // Retrieve a single Timer with id
  router.get("/:id", timers.findOne);

  app.use("/api/timers", router);
};
