import { Router } from "express";
import { supabase } from "../supabase";

const router = Router();

// GET all users
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("*");

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }

  res.json({
    success: true,
    users: data,
  });
});

// POST create a new user
router.post("/", async (req, res) => {
  const { name, email, role } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      error: "Name and email are required",
    });
  }

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        name,
        email,
        role: role || "developer",
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
    message: "User created successfully",
    user: data,
  });
});

export default router;