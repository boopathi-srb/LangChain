import express from "express";
import { configDotenv } from "dotenv";
import { closeDataBase, connectToDatabase } from "./db.js";
import logger from "./logger.js"; // Your custom logger module
import cors from "cors"; // Middleware for enabling CORS
import route from "./routes.js";
import bodyParser from "body-parser"; // Middleware for parsing request bodies

configDotenv();

const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
app.use(logger);

app.use("/", route);

// Define port and start server
const port = process.env.PORT || 6030;
const server = app.listen(port, () => {
  connectToDatabase();
  console.log(`Listening on port ${port}...`);
});

// Close database connection when the server or process exits
server.on("close", () => {
  closeDataBase();
  console.log("SERVER CLOSED");
});

// Process exit handlers to close database and handle signals
process.on("exit", (code) => {
  console.log(`Process exited with code ${code}`);
  closeDataBase();
});

// Listener for 'SIGINT' signal (Ctrl+C)
process.on("SIGINT", () => {
  console.log("DB closing");
  closeDataBase();
  console.log("SIGINT signal received. Closing server...");
  server.close(() => {
    process.exit(0);
  });
});

// Listener for 'uncaughtException' event
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  closeDataBase();
  process.exit(1); // Exit with failure
});

// Listener for 'SIGTERM' signal
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received. Closing server...");
  server.close(() => {
    closeDataBase();
    console.log("Server closed.");
    process.exit(0);
  });
});
