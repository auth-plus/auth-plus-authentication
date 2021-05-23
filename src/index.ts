import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import logger from "./config/winston";
import tournament from "./routes/tournament.route";
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("Ok");
});

app.use("/login", tournament);

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
  logger.warn(`Server running on: ${PORT}`);
});
