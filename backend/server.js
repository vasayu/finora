import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/error.middleware.js";
import morgan from "morgan";
import helmet from "helmet"

const app = express();

app.set("trust proxy", 1);
app.use(
	cors({
		origin: ["http://localhost:5173",],
		credentials: true,
	})
);

// app.use(express.json({ limit: "20kb" }));
app.use(helmet())
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morgan('dev'))


app.use(errorHandler);

export { app };
