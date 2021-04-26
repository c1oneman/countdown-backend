const db = require("../models");
const { nanoid } = require("nanoid");

const Timer = db.timers;

// Create and Save a new Timer
exports.create = (req, res) => {
  // Validate request
  if (!req.body.title) {
    res.status(400).send({ message: "Content can not be empty." });
    return;
  }

  if (!req.body.expires) {
    res.status(400).send({ message: "Expires can not be empty." });
    return;
  }
  let url = req.body.url;
  if (req.body.url) {
    if (url.length > 12) {
      res
        .status(400)
        .send({ message: "Custom URL is too long. (max 12 chars)" });
      return;
    }
  }

  url = encodeURIComponent(url);

  let id = url ? url : nanoid(6);

  // Create a Timer
  const timer = new Timer({
    _id: id,
    title: req.body.title,
    expires: req.body.expires,
  });

  // Save Timer in the database
  timer
    .save(timer)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Timer.",
      });
    });
};

// Retrieve all timers from the database. (paginate)
exports.findAll = async (req, res) => {
  const resultsPerPage = 10;
  let page = req.params.page >= 1 ? req.params.page : 1;
  page = page - 1;
  const total = await Timer.find().count((err, count) => {
    return count;
  });

  const maxPages = Math.ceil(total / resultsPerPage);

  Timer.find()
    .sort({ expires: "asc" })
    .limit(resultsPerPage)
    .skip(resultsPerPage * page)
    .then((data) => {
      res.send({ total, resultsPerPage, maxPages, data });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving timers.",
      });
    });
};

// Find a single timer with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Timer.findOne({ _id: id })
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found Timer with id " + id });
      else res.send(data);
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: "Error retrieving Timer with id: " + id });
    });
};

// Update a timer by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!",
    });
  }

  const id = req.body.id;

  Timer.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Timer with id=${id}. Maybe Timer was not found!`,
        });
      } else res.send({ message: "Timer was updated successfully." });
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Timer with id=" + id,
      });
    });
};

// Delete a timer with the specified id in the request
exports.delete = (req, res) => {
  const id = req.body.id;

  Timer.findByIdAndRemove(id, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete timer with id=${id}. Maybe timer was not found!`,
        });
      } else {
        res.send({
          message: "Timer was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete timer with id=" + id,
      });
    });
};

// Delete all timers from the database.
exports.deleteAll = (req, res) => {
  Timer.deleteMany({})
    .then((data) => {
      res.send({
        message: `${data.deletedCount} Timers were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all Timers.",
      });
    });
};
