import express, { Request, Response, NextFunction } from "express";

const route = express.Router();

route.post("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    Gateway.({ queueName: "tournament/create", json: req.body });
  } catch (error) {
    next(error);
  }
});

export default route;
