import knex from "config/knex";

export const create_phase = async ({ type, tournament_id, player_list }) => {
  try {
    const [phase_id] = await knex("phase").insert({
      type,
      tournament_id
    });
    const promise_pp = player_list.map(({ player_id }) =>
      knex("phase_player").insert({ phase_id, player_id, point: 0 })
    );
    await Promise.all(promise_pp);
  } catch (error) {
    throw new Error(error);
  }
};
