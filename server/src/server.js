import express from "express";
import app from "./app.js";

const server = express();

server.use(app);

server.listen(8080, () => {
  console.warn("Server running on: 8080");
});
