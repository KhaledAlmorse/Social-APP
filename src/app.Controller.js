import DB_Connection from "../src/DB/dbConnection.js";
import { globalErrorHandler } from "../src/utils/errorHandling/globalErrorHandling.js";
import { notFoundHandler } from "./utils/errorHandling/notFoundHandler.js";
import authRouter from "./modules/auth/auth.controller.js";
import userRouter from "./modules/user/user.controller.js";
import postRouter from "./modules/post/post.controller.js";
import commentRouter from "./modules/comment/comment.controller.js";
import adminRouter from "./modules/admin/admin.controller.js";

import morgan from "morgan";
import cors from "cors";

const bootsrap = async (app, express) => {
  await DB_Connection();
  //* Middleware for parsing the request body to json
  app.use(express.json());
  app.use(cors({}));
  //* Middleware for handeling CORS
  // const whiteList = ["http://127.0.0.1:5000", "http://127.0.0.1:5500"];
  // app.use((req, res, next) => {
  //   const origin = req.headers.origin;
  //   if (!whiteList.includes(origin)) {
  //     return next(new Error("Not allowed by CORS", { cause: 403 }));
  //   }
  //   res.setHeader("Access-Control-Allow-Origin", origin);
  //   res.setHeader("Access-Control-Allow-Headers", "*");
  //   res.setHeader("Access-Control-Allow-Methods", "*");
  //   res.setHeader("Access-Control-Private-Network", true);

  //   return next();
  // });

  app.use("/Uploads", express.static("Uploads"));
  app.use(morgan("dev"));

  //* Mount Route
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/post", postRouter);
  app.use("/comment", commentRouter);
  app.use("/admin", adminRouter);

  app.all("*name", notFoundHandler);
  app.use(globalErrorHandler);
};

export default bootsrap;
