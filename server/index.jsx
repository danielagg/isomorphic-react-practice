import express from "express";
import yields from "express-yields";
import fs from "fs-extra";
import webpack from "webpack";
import { argv } from "optimist";
import { get } from "request-promise";
import { delay } from "redux-saga";

const port = process.env.PORT || 3000;
const app = express();

function* getQuestions() {
  let data = yield fs.readFile("./mock-data/data.json", "utf-8");
  return JSON.parse(data);
}

function* getQuestion(question_id) {
  const questions = yield getQuestions();
  const question = questions.items.find(
    _question => _question.question_id == question_id
  );
  question.body = `Mock question body: ${question_id}`;
  let data = { items: [question] };

  return data;
}

app.get("/api/questions", function*(req, res) {
  const data = yield getQuestions();
  yield delay(150);
  res.json(data);
});

app.get("/api/questions/:id", function*(req, res) {
  const data = yield getQuestion(req.params.id);
  yield delay(150);
  res.json(data);
});

if (process.env.NODE_ENV === "development") {
  const config = require("../webpack.config.dev.babel").default;
  const compiler = webpack(config);

  app.use(require("webpack-dev-middleware")(compiler, { noInfo: true }));
  app.use(require("webpack-hot-middleware")(compiler));
}

app.get(["/"], function*(req, res) {
  let index = yield fs.readFile("./public/index.html", "utf-8");
  res.send(index);
});

app.listen(port, "0.0.0.0", () => console.info(`App is listening on ${port}`));
