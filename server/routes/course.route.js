import express from "express";
import Course from "../models/course.model.js";
import Session from "../models/session.model.js";

const router = express.Router();

// GET all courses✅
router.get("/", async (req, res) => {
  
  try {
    const { sessionId } = req.signedCookies;
    var session = await Session.findById(sessionId);
    if (!sessionId || !session) {
      const session = new Session();
      await session.save();
      res.cookie("sessionId", session.id, {
        signed: true,
      });
    }
    const courses = await Course.find().lean();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
