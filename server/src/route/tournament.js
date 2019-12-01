import express from "express";

//Importing controllers
import { create_tournament } from "controller/auth";

const route = express.Router();

route.post("/", async (req, res, next) => {
  try {
    const { name, stage_list, player_list, tables_quant } = req.body;
    const { id: user_id } = req.data;
    const resp = await create_tournament({
      name,
      user_id,
      stage_list,
      player_list,
      tables_quant
    });
    res.status(200).send(resp);
  } catch (error) {
    let err = new Error(error);
    err.statusCode = 403;
    next(err);
  }
});

export default route;
