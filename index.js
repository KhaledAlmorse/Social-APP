import express from "express";
import dotenv from "dotenv";

import bootsrap from "./src/app.Controller.js";

dotenv.config();

const app = express();

await bootsrap(app, express);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App is runnign on Port: ${port}`);
});
