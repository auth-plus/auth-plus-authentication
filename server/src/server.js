import express from "express";
import app from "./app.js";
import env from "config/env";

const server = express();

server.use(app);

server.listen(env.app.PORT, () => {
  console.warn(`Server running on: ${env.app.PORT}`);
});
