import express from "express";
import logger from "config/winston";

//Importing routes
import auth from "route/auth";
import tournament from "route/tournament";
import set from "route/set";

//Importing middlewares
import { bodyParser, cors, token } from "middleware/index";

const app = express();

//Applying middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors);

//Applying routes
app.use("/auth", auth);
app.use(token);
app.use("/tournament", tournament);
app.use("/set", set);

//handling error
app.use((err, req, res, next) => {
  if (err) {
    logger.error(err);
    res.status(err.statusCode).send(err.toString());
  } else {
    next();
  }
});

//Handling 404
app.use((req, res) => {
  res.status(404).send("Sorry cant find that!");
});

export default app;
