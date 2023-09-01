require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./person");

morgan.token("body", function getId(req) {
  if (req.method !== "POST") {
    return null;
  }

  return JSON.stringify(req.body);
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

app.use(requestLogger);

app.use(express.static("dist"));

app.get("/api/info", async (req, res, next) => {
  try {
    const persons = await Person.find({});

    res.send(
      `<div><p>Phonebook has info for ${
        persons.length
      } people</p><p>${new Date()}</p></div>`
    );
  } catch (err) {
    next(err);
  }
});

app.get("/api/persons", async (req, res, next) => {
  try {
    const persons = await Person.find({});

    res.send(persons);
  } catch (err) {
    next(err);
  }
});

app.post("/api/persons", async (req, res, next) => {
  try {
    const { name, number } = req.body;

    if (!name) {
      return res.status(400).send({ error: "must contain name" });
    }

    if (!number) {
      return res.status(400).send({ error: "must contain number" });
    }

    const sameNames = await Person.find({ name });

    if (sameNames > 0) {
      return res.status(400).send({ error: "name must be unique" });
    }

    const newPerson = new Person({ name, number });
    await newPerson.save();

    res.send(newPerson);
  } catch (err) {
    next(err);
  }
});

app.put("/api/persons/:id", async (req, res, next) => {
  try {
    const { name, number } = req.body;

    if (!name) {
      return res.status(400).send({ error: "must contain name" });
    }

    if (!number) {
      return res.status(400).send({ error: "must contain number" });
    }

    const updatedPerson = await Person.findByIdAndUpdate(
      req.params.id,
      { name, number },
      { new: true, runValidators: true, context: "query" }
    );

    if (!updatedPerson) {
      return res.status(404).end();
    }

    res.send(updatedPerson);
  } catch (err) {
    next(err);
  }
});

app.get("/api/persons/:id", async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id);

    if (!person) {
      return res.status(404).end();
    }

    res.send(person);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/persons/:id", async (req, res, next) => {
  try {
    await Person.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
