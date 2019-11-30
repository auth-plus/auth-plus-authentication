import express from "express";

//Importing routes
import auth from "route/auth";
import tournament from "route/tournament";
import set from "route/set";

//Importing middlewares
import { bodyParser, cors } from "middleware/index";

const app = express();

//Applying middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors);

//Applying routes
app.use("/auth", auth);
app.use("/tournament", tournament);
app.use("/set", set);

//handling error
app.use((err, req, res, next) => {
  if (err) {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  } else {
    next();
  }
});

//Handling 404
app.use((req, res) => {
  res.status(404).send("Sorry cant find that!");
});

export default app;
