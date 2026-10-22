import {config} from "dotenv" ;
import { app } from "./app.js";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

//const app = express();

app.get("/", (req, res) => {
  res.send("Simple server is running!");

});
const port = process.env.PORT
console.log(port)
app.listen(port, () => {
  console.log(`Test server running on //http://localhost:${process.env.PORT}`);
});
//http://localhost:5000