import express from "express";

const app = express();

app.get("/tournament", tournament);
app.get("/auth", auth);
app.get("/set", set);

export default app;
