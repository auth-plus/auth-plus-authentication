import knex from "config/knex";
export const create_tournament = async ({
  name,
  user_id,
  stage_list,
  player_list,
  tables_quant
}) => {
  try {
    const group = stage_list.group;
    const knockout = stage_list.knockout;
    const [tournament_id] = await knex("tournament").insert({
      name,
      type: group > 0 ? "group-knockout" : "knockout",
      user_id
    });
    const promises = player_list.map(({ player_id }) =>
      knex("tournament_player").insert({ tournament_id, player_id })
    );
    if (group > 0) {
      const [group_id] = await knex("phase").insert({
        type: "group",
        tournament_id
      });
    }
    await Promise.all(promises);
  } catch (error) {
    throw new Error(error);
  }
};
