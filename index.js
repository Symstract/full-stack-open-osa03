const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

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

app.get("/api/info", (req, res) => {
  res.send(
    `<div><p>Phonebook has info for ${
      persons.length
    } people</p><p>${new Date()}</p></div>`
  );
});

app.get("/api/persons", (req, res) => {
  res.send(persons);
});

app.post("/api/persons", (req, res) => {
  const { name, number } = req.body;

  if (!name) {
    return res.status(400).send({ error: "must contain name" });
  }

  if (!number) {
    return res.status(400).send({ error: "must contain number" });
  }

  const existingName = persons.find((person) => person.name === name);

  if (existingName) {
    return res.status(400).send({ error: "name must be unique" });
  }

  const id = Math.round(Math.random() * 100000);
  const newPerson = { id, name, number };

  persons = persons.concat(newPerson);

  res.send(newPerson);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);

  if (!person) {
    return res.status(404).end();
  }

  res.send(person);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);

  res.status(204).end();
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
