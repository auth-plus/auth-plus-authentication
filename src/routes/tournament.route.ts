import express, { Request, Response, NextFunction } from "express";
import { Tournament } from "../controller/tournament.controller";

const route = express.Router();

route.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resp = await Tournament.create(req.body);
    res.status(resp.status).send(resp.data);
  } catch (error) {
    next(error);
  }
});

export default route;
