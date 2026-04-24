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
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

const bootsrap = async (app, express) => {
  await DB_Connection();
  //* Apply security middlewares
  app.use(limiter);
  app.use(helmet());
  app.use(cors());

  //* Middleware for parsing the request body to json
  app.use(express.json());

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
