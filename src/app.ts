import cors from "cors";
import "dotenv/config";
import express from "express";
import morgan from "morgan";
import "reflect-metadata";
import swaggerUi from "swagger-ui-express";
import { AppDataSource } from "./config/database";
import { swaggerSpec } from "./config/swagger";
import { router } from "./routes/index";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Swagger API Documentation
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
      tryItOutEnabled: true,
    },
  }),
);

// Routes
app.use("/api", router);

// Error handling
import { errorHandler } from "./utils/error.middleware";
app.use(errorHandler);

const PORT = process.env.PORT || 3025;

// Initialize database and start server
async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log("Database connection initialized");

    const server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(
        `Swagger documentation available at http://localhost:${PORT}/api-docs`,
      );
    });

    // Handle server errors
    server.on("error", (error: any) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `Port ${PORT} is already in use. Please try a different port.`,
        );
      } else {
        console.error("Server error:", error);
      }
    });
  } catch (error) {
    console.error("Error during startup:", error);
    process.exit(1);
  }
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
