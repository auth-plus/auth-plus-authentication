import knex from "config/knex";

import { create_phase } from "controller/phase";

const __shuffle = array => {
  let temp = [...array];
  for (let i = temp.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [temp[i], temp[j]] = [temp[j], temp[i]];
  }
  return temp;
};
export const create_tournament = async ({
  name,
  user_id,
  format,
  player_list
}) => {
  try {
    //Inserting to tournament table
    const [tournament_id] = await knex("tournament").insert({
      name,
      user_id
    });

    //Inserting to tournament_player table
    const promises_tp = player_list.map(({ player_id }) =>
      knex("tournament_player").insert({ tournament_id, player_id })
    );
    await Promise.all(promises_tp);

    //Forming groups
    const players = player_list.reduce(
      (out, play) => {
        if (play.head) out.group = [...out.head_players, [play]];
        else out.normal_players = [...out.normal_players, play];
        return out;
      },
      { group: [], normal_players: [] }
    );
    let group = parseInt((format.r * 2) / format.quant_group);
    if (players.group.length !== group)
      throw new Error("number of player head diff from group");
    if (Math.ceil(player_list.length / group) <= 2)
      throw new Error("try_diffrent format");
    let shuffle_player_list = __shuffle(players.normal_players);

    shuffle_player_list.forEach((player, idx) => {
      const group_idx = idx % group;
      players.group[group_idx] = [...players.group[group_idx], player];
    });

    //Creating phase
    const promises_g = players.group.map(
      async players =>
        await create_phase({
          type: "group",
          tournament_id,
          player_list: players
        })
    );
    await Promise.all(promises_g);
  } catch (error) {
    throw new Error(error);
  }
};
