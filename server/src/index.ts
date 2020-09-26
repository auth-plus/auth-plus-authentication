import express, { Request, Response } from "express";
import cors from "cors";

const app = express();

app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("Ok");
});

app.use((req: Request, res: Response) => {
  res.status(404).send("Sorry cant find that");
});

const PORT = process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 5000;
app.listen(PORT, () => {
  console.warn(`Server running on: ${PORT}`);
});
