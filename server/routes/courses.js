import express from "express";
import Course from "../models/Course.js";
import Session from "../models/Session.js";

const router = express.Router();

// GET all courses
router.get("/", async (req, res) => {
  try {
    const {sessionId} = req.cookies;
    if (!sessionId) {
      const session = new Session();
      await session.save();
      res.cookie("sessionId", session.id, {
        signed: true,
      });
    }
    console.log(sessionId);
    const courses = await Course.find();

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
