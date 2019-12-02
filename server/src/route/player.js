import express from "express";

const route = express.Router();

route.post("/", (req, res, next) => {
  try {
    const { player } = req.body;
  } catch (error) {
    let err = new Error(error);
    err.statusCode = 403;
    next(err);
  }
});

export default route;
