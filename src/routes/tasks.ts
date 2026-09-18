import { Router } from "express";
import { supabase } from "../supabase";

const router = Router();
// Helper to record task history
async function recordTaskHistory(
  task_id: string,
  action: string,
  old_value: string | null = null,
  new_value: string | null = null
) {
  await supabase.from("task_history").insert([
    {
      task_id,
      action,
      old_value,
      new_value,
    },
  ]);
}

// GET all tasks
// GET all tasks with filtering

router.get("/", async (req, res) => {
  const { status, priority, project_id, search, page = "1", limit = "10" } = req.query;
  const pageNumber = Math.max(1, Number(page));
  const limitNumber = Math.max(1, Number(limit));
  const from = (pageNumber - 1) * limitNumber;
  const to = from + limitNumber - 1;

  let query = supabase
  .from("tasks")
  .select("*", { count: "exact" })
  .eq("is_deleted", false)
  .range(from, to);

  if (status) {
    query = query.eq("status", status as string);
  }

  if (priority) {
    query = query.eq("priority", priority as string);
  }

  if (project_id) {
    query = query.eq("project_id", project_id as string);
  }
  if (search) {
  query = query.ilike("title", `%${search}%`);
}

  const { data, error, count } = await query;

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }

 res.json({
  success: true,
  page: pageNumber,
  limit: limitNumber,
  total: count || 0,
  totalPages: Math.ceil((count || 0) / limitNumber),
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
// RESTORE deleted task
router.post("/:id/restore", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("tasks")
    .update({
      is_deleted: false,
      deleted_at: null,
    })
    .eq("id", id)
    .eq("is_deleted", true)
    .select()
    .single();

  if (error) {
    return res.status(404).json({
      success: false,
      error: "Deleted task not found",
    });
  }
  
  await recordTaskHistory(
  id,
  "restored",
  "trash",
  "active"
);

  res.json({
    success: true,
    message: "Task restored successfully",
    task: data,
  });
});
// GET task history
router.get("/:id/history", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("task_history")
    .select("*")
    .eq("task_id", id)
    .order("changed_at", { ascending: true });

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }

  res.json({
    success: true,
    task_id: id,
    history: data,
  });
});
// GET task by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
  .from("tasks")
  .select("*")
  .eq("id", id)
  .eq("is_deleted", false)
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
  

  await recordTaskHistory(
  data.id,
  "created",
  null,
  data.title
);

  res.status(201).json({
    success: true,
    message: "Task created successfully",
    task: data,
  });
});
// BULK UPDATE TASK STATUS
router.put("/bulk/status", async (req, res) => {
  const { task_ids, status } = req.body;

  if (!Array.isArray(task_ids) || task_ids.length === 0) {
    return res.status(400).json({
      success: false,
      error: "task_ids must be a non-empty array",
    });
  }

  if (!["pending", "completed"].includes(status)) {
    return res.status(400).json({
      success: false,
      error: "Status must be either pending or completed",
    });
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({ status })
    .in("id", task_ids)
    .eq("is_deleted", false)
    .select();

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }

  for (const task of data) {
    await recordTaskHistory(
      task.id,
      "status_changed",
      null,
      status
    );
  }

  res.json({
    success: true,
    message: "Tasks updated successfully",
    updated_count: data.length,
    tasks: data,
  });
});
// PUT update a task
router.put("/:id", async (req, res) => {
  const { id } = req.params;

  const { data: oldTask, error: fetchError } = await supabase
  .from("tasks")
  .select("*")
  .eq("id", id)
  .eq("is_deleted", false)
  .single();

if (fetchError || !oldTask) {
  return res.status(404).json({
    success: false,
    error: "Task not found",
  });
}

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

  if (oldTask.status !== data.status) {
  await recordTaskHistory(
    id,
    "status_changed",
    oldTask.status,
    data.status
  );
}

if (oldTask.priority !== data.priority) {
  await recordTaskHistory(
    id,
    "priority_changed",
    oldTask.priority,
    data.priority
  );
}

if (oldTask.title !== data.title) {
  await recordTaskHistory(
    id,
    "title_changed",
    oldTask.title,
    data.title
  );
}

  res.json({
    success: true,
    message: "Task updated successfully",
    task: data,
  });
});
// BULK SOFT DELETE TASKS
router.delete("/bulk", async (req, res) => {
  const { task_ids } = req.body;

  if (!Array.isArray(task_ids) || task_ids.length === 0) {
    return res.status(400).json({
      success: false,
      error: "task_ids must be a non-empty array",
    });
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    })
    .in("id", task_ids)
    .eq("is_deleted", false)
    .select();

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }

  for (const task of data) {
    await recordTaskHistory(
      task.id,
      "deleted",
      "active",
      "trash"
    );
  }

  res.json({
    success: true,
    message: "Tasks moved to trash successfully",
    deleted_count: data.length,
    tasks: data,
  });
});
// DELETE task (soft delete)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("tasks")
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("is_deleted", false)
    .select()
    .single();

  if (error) {
    return res.status(404).json({
      success: false,
      error: "Task not found or already deleted",
    });
  }

  res.json({
    success: true,
    message: "Task moved to trash successfully",
    task: data,
  });
});

export default router;