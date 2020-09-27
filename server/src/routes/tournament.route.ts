import express, { Request, Response, NextFunction } from "express";
import { RabbitMQ } from "../config/rabbitmq";

const route = express.Router();

route.post("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    RabbitMQ.rpc({ queueName: "tournament/create", json: req.body });
  } catch (error) {
    next(error);
  }
});

export default route;
