import dotenv from "dotenv";
import { app } from "./server.js";

dotenv.config({
  path: "./.env",
});

app.listen(process.env.PORT || 8000, () =>
    console.log(`Server is listening on port ${process.env.PORT}`)
);
  