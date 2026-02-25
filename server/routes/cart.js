import express from "express";
import Session from "../models/Session.js";
import Course from "../models/Course.js";

const router = express.Router();

// GET cart
router.get("/", async (req, res) => {
  //Add your code here
  const { sessionId } = req.signedCookies;

  const session = Session.findById(sessionId).lean();
  const courseIds = session.data.cart.map(({ courseId }) => courseId);

  const cartCourses = Course.find({ _id: { $in: courseIds } });

  res.json(result);
});

// Add to cart
router.post("/", async (req, res) => {
  //Add your code here

  const courseId = req.body.courseId;
  const { sessionId } = req.signedCookies;
  const result = await Session.updateOne(
    {
      _id: sessionId,
      "data.cart.courseId": courseId,
    },
    {
      $inc: { "data.cart.$.quantity": 1 },
    },
  );
  if (result.matchedCount == 0) {
    await Session.updateOne(
      {
        _id: sessionId,
      },
      {
        $push: {
          "data.cart": {
            courseId,
            quantity: 1,
          },
        },
      },
    );
  }

  console.log(courseId, sessionId);

  // session.markModified("data");
  // session.set("data.cart", []);
});

// Remove course from cart
router.delete("/:courseId", async (req, res) => {
  //Add your code here
});

// Clear cart
router.delete("/", async (req, res) => {
  //Add your code here
});

export default router;
