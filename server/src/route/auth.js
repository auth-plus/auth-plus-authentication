import express from "express";

//Importing controllers
import { login } from "controller/auth";

const route = express.Router();

route.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const resp = await login({ email, password });
    res.status(200).send(resp);
  } catch (error) {
    throw new Error(error);
  }
});

export default route;
