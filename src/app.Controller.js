import DB_Connection from "../src/DB/dbConnection.js"
import {globalErrorHandler} from "../src/utils/errorHandling/globalErrorHandling.js"
import {notFoundHandler} from "./utils/errorHandling/notFoundHandler.js"
import authRouter from "./modules/auth/auth.controller.js";
import userRouter from "./modules/user/user.controller.js";
import morgan from "morgan";


const bootsrap= async (app,express)=>{
    await DB_Connection();
    app.use(express.json());
    app.use(morgan("dev"));

    //* Mount Route
    app.use("/auth", authRouter);
    app.use("/user", userRouter);

    app.all("*name",notFoundHandler)
    app.use(globalErrorHandler);


}

export default bootsrap;