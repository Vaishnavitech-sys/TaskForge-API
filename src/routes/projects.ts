import { Router } from "express";
import { supabase } from "../supabase";

const router = Router();

// GET all projects
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("projects")
    .select("*");

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }

  res.json({
    success: true,
    projects: data,
  });
});

// GET project by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return res.status(404).json({
      success: false,
      error: "Project not found",
    });
  }

  res.json({
    success: true,
    project: data,
  });
});

// POST create a project
router.post("/", async (req, res) => {
  const { name, description, user_id } = req.body;
  console.log("Received user_id:", JSON.stringify(user_id));

  if (!name || !user_id) {
    return res.status(400).json({
      success: false,
      error: "Name and user_id are required",
    });
  }

  const { data, error } = await supabase
    .from("projects")
    .insert([
      {
        name,
        description: description || null,
        user_id,
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
    message: "Project created successfully",
    project: data,
  });
});

// PUT update a project
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const { data, error } = await supabase
    .from("projects")
    .update({
      name,
      description,
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
    message: "Project updated successfully",
    project: data,
  });
});

// DELETE project
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id);

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }

  res.json({
    success: true,
    message: "Project deleted successfully",
  });
});

export default router;