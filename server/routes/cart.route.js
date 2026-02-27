import express from "express";
import Session from "../models/session.model.js";
import Cart from "../models/cart.model.js";

const router = express.Router();

// GET cart:✅
router.get("/", async (req, res) => {
  const { sessionId } = req.signedCookies;
  console.log(sessionId);
  if (!sessionId) {
    return res.json({ message: "session id not present" });
  }

  const session = await Session.findById(sessionId)
    .populate({
      path: "data.cart.courseId",
      select: "_id name price image",
    })
    .select("data.cart  userId")
    .lean();

  if (session.userId) {
    const cart = await Cart.findOne({
      userId: session.userId,
    })
      .select("courses userId")
      .populate({ path: "courses.courseId", select: "name price image _id" });
    return res.json({ cart });
  }

  if (!session) {
    return res.json({ message: "not valid user" });
  }

  if (session.userId) {
    const cart = await Cart.findById(session.userId).populate(
      "courses.courseId",
    );
    return res.json({ cart });
  }
  console.log(session.data.cart);

  const result = session.data.cart.map((course) => {
    const { _id, name, price, image } = course.courseId;
    const quantity = course.quantity;
    return {
      _id,
      name,
      price,
      quantity,
      image,
    };
  });

  if (!session) {
    return res.json({ message: "not valid user" });
  }
  // console.log(session.data.cart);
  return res.json(result);
});

// Add to cart✅
router.post("/", async (req, res) => {
  //Add your code here

  const courseId = req.body.courseId;
  const { sessionId } = req.signedCookies;

  const session = await Session.findById(sessionId);
  if (session.userId) {
    const result = await Cart.updateOne(
      {
        userId: session.userId,
        "courses.courseId": courseId,
      },
      {
        $inc: { "courses.$.quantity": 1 },
      },
    );
    if (result.matchedCount == 0) {
      await Cart.updateOne(
        {
          userId: session.userId,
        },
        {
          $push: {
            courses: {
              courseId,
              quantity: 1,
            },
          },
        },
      );
    }

    console.log(courseId, sessionId);

    return res.json({ result });
  } else {
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

    return res.json({ result });
  }

  // session.markModified("data");
  // session.set("data.cart", []);
});


router.delete("/:courseId", async (req, res) => {
  const { courseId } = req.params;
  const { sessionId } = req.signedCookies;
  const session = await Session.findByIdAndUpdate(sessionId, {
    $pull: { "data.cart": { courseId } },
  });
});



export default router;
