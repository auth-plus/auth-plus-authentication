import jwt from "jsonwebtoken";

import env from "config/env";

export const encode = payload => {
  try {
    const options = {
      issuer: "TT Tournament",
      subject: "3T authorization",
      expiresIn: "12h",
      algorithm: "HS256"
    };
    const token = jwt.sign({ ...payload }, env.app.JWT_HASH, options);
    return token;
  } catch (error) {
    throw new Error(error);
  }
};

export const decode = token => {
  try {
    const data = jwt.verify(token, env.app.JWT_HASH);
    return data;
  } catch (error) {
    throw new Error(error);
  }
};
