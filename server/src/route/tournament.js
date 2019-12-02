import express from "express";

//Importing controllers
import { create_tournament } from "controller/tournament";

const route = express.Router();

route.post("/", async (req, res, next) => {
  try {
    const { name, format, player_list } = req.body;
    const { id: user_id } = req.data;
    const resp = await create_tournament({
      name,
      user_id,
      format,
      player_list
    });
    res.status(200).send(resp);
  } catch (error) {
    let err = new Error(error);
    err.statusCode = 403;
    next(err);
  }
});

export default route;
