import jwt from "jsonwebtoken";

import env from "config/env";
export const encode = body => {
  try {
    const token = jwt.sign(body, env.app.JWT_HASH, {
      expiresIn: "1h",
      algorithm: "RS256"
    });
    return token;
  } catch (error) {
    throw new Error(error);
  }
};
export const decode = () => {};
