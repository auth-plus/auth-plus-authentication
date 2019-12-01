import multer from "multer";
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./src/tmp/my-uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  }
});

const upload = multer({ storage: storage });

export default upload;
