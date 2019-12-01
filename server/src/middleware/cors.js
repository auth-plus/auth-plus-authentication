import cors from "cors";

var whitelist = ["http://tt-tournament.com.br", "http://3t.com", undefined];

var corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
};

export default cors(corsOptions);
