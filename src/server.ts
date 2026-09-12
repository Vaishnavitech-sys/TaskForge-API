import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import usersRouter from "./routes/users.js";
import projectsRouter from "./routes/projects.js";
import tasksRouter from "./routes/tasks.js";

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());

app.use("/api/users", usersRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/tasks", tasksRouter);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TaskForge API is running 🚀",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`TaskForge API running on port ${PORT}`);
});