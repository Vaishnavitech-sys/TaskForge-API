import { Router } from "express";
import { supabase } from "../supabase";

const router = Router();

// GET all tasks
// GET all tasks with filtering

router.get("/", async (req, res) => {
  const { status, priority, project_id } = req.query;

  let query = supabase
    .from("tasks")
    .select("*");

  if (status) {
    query = query.eq("status", status as string);
  }

  if (priority) {
    query = query.eq("priority", priority as string);
  }

  if (project_id) {
    query = query.eq("project_id", project_id as string);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }

  res.json({
    success: true,
    tasks: data,
  });
});
// GET task statistics

router.get("/stats", async (req, res) => {
  const { data, error } = await supabase
    .from("tasks")
    .select("status, priority");

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }

  const total = data.length;

  const pending = data.filter(
    (task) => task.status === "pending"
  ).length;

  const completed = data.filter(
    (task) => task.status === "completed"
  ).length;

  const high_priority = data.filter(
    (task) => task.priority === "high"
  ).length;

  res.json({
    success: true,
    statistics: {
      total,
      pending,
      completed,
      high_priority,
    },
  });
});

// GET task by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return res.status(404).json({
      success: false,
      error: "Task not found",
    });
  }

  res.json({
    success: true,
    task: data,
  });
});

// POST create a task
router.post("/", async (req, res) => {
  const {
    user_id,
    project_id,
    title,
    description,
    status,
    priority,
    due_date,
  } = req.body;

  if (!user_id || !project_id || !title?.trim()) {
  return res.status(400).json({
    success: false,
    error: "user_id, project_id and title are required",
  });
}

if (status && !["pending", "completed"].includes(status)) {
  return res.status(400).json({
    success: false,
    error: "Status must be either pending or completed",
  });
}

if (priority && !["low", "medium", "high"].includes(priority)) {
  return res.status(400).json({
    success: false,
    error: "Priority must be low, medium or high",
  });
}

  const { data, error } = await supabase
    .from("tasks")
    .insert([
      {
        user_id,
        project_id,
        title,
        description: description || null,
        status: status || "pending",
        priority: priority || "medium",
        due_date: due_date || null,
      },
    ])
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }

  res.status(201).json({
    success: true,
    message: "Task created successfully",
    task: data,
  });
});

// PUT update a task
router.put("/:id", async (req, res) => {
  const { id } = req.params;

  const {
    title,
    description,
    status,
    priority,
    due_date,
    completed_at,
    project_id,
  } = req.body;

  const { data, error } = await supabase
    .from("tasks")
    .update({
      title,
      description,
      status,
      priority,
      due_date,
      completed_at,
      project_id,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }

  res.json({
    success: true,
    message: "Task updated successfully",
    task: data,
  });
});

// DELETE task
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id);

  if (error) {
  console.error("PUT TASK ERROR:", error);

  return res.status(500).json({
    success: false,
    error: error.message,
    details: error,
  });
}

  res.json({
    success: true,
    message: "Task deleted successfully",
  });
});

export default router;