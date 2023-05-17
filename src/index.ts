import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { customError, notFound } from "./helper/errorHandler";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import postRoutes from "./routes/postRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import { isAuthenticated } from "./middlewares/authMiddleware";

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", isAuthenticated, postRoutes);
app.use("/api/categories", isAuthenticated, categoryRoutes);

// Error Handlers
app.use(notFound);
app.use(customError);

const PORT = process.env.PORT || 8000;

// Server configuration
app.listen(PORT, () => {
  console.log("Server is listening on port " + PORT);
});
