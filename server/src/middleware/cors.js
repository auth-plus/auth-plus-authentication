import cors from "cors";

var whitelist = ["http://tt-tournament.com.br", "http://example2.com"];

var corsOptions = {
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
};

export default cors(corsOptions);
