import knex from "config/knex";
import crypto from "crypto";
import { encode } from "config/jwt";

export const login = async ({ email, password }) => {
  try {
    const [user] = await knex("user")
      .select("id", "email", "name", "photo", "password", "salt")
      .where({
        email
      });
    if (user) {
      const hash = crypto
        .createHash("sha256")
        .update(password + user.salt)
        .digest("hex")
        .toUpperCase();
      if (user.password === hash) {
        const token = encode(user);
        await knex("user")
          .update({ token })
          .where("id", user.id);
        delete user.password;
        delete user.salt;
        return Promise.resolve({ user, token });
      }
    }
    return Promise.reject("senha ou email errado");
  } catch (error) {
    throw new Error(error);
  }
};
