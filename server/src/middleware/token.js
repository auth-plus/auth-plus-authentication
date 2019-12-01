import { decode } from "config/jwt";

export default (req, res, next) => {
  try {
    const auth_token = req.get("Authorization");
    if (auth_token.split(" ")[0] === "Bearer") {
      const data = decode(auth_token.split(" ")[1]);
      req.data = data;
      next();
    }
  } catch (error) {
    res.status(405).send(`authorization_wrong`);
  }
};
