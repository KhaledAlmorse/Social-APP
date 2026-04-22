import express from "express";
import dotenv from "dotenv";
import chalk from "chalk";

import bootsrap from "./src/app.Controller.js";

dotenv.config();

const app = express();

await bootsrap(app, express);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(chalk.blue(`App is runnign on Port: ${port}`));
});
