import knex from "config/knex";

import { encode } from "config/jwt";

export const login = async ({ email, password }) => {
  try {
    const [user] = await knex("user")
      .select("*")
      .where({ email, password });
    return Promise.resolve(encode(user));
  } catch (error) {
    throw new Error(error);
  }
};
