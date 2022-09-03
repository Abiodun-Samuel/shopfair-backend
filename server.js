// Application Entry point, all packages are imported
//Imports from external packages
import "dotenv/config";
import path from "path";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import { fileURLToPath } from "url";

//import middleware
import { corsOptions } from "./config/corsOptions.js";
import { logger, logEvents } from "./middlewares/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";

// import from application
import { connectDB } from "./config/dbConn.js";

//imports route
import defaultRoutes from "./routes/index.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

//constant
connectDB();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(logger);
app.use(cors(corsOptions));
app.use("/", express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cookieParser());

// App Routes
app.use("/", defaultRoutes);
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
//App Admin Routes
app.use("/api/admin", adminRoutes);

// catch all route
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${PORT}`)
  );
});

mongoose.connection.on("error", (err) => {
  // console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});

app.use(errorHandler);
