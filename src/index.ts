import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import tournament from "./routes/tournament.route";
import logger from "./config/winston";

const app = express();

app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("Ok");
});

app.use("/tournament", tournament);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    logger.error(err);

    res.status(500).send(err);
  } else {
    next();
  }
});

app.use((req: Request, res: Response) => {
  res.status(404).send("Sorry cant find that");
});

const PORT = process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 5000;
app.listen(PORT, () => {
  console.warn(`Server running on: ${PORT}`);
});
