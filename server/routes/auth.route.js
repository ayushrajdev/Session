import express from "express";
import User from "../models/user.model.js";
import Session from "../models/session.model.js";
import Cart from "../models/cart.model.js";

const router = express.Router();

// Register new user✅
router.post("/register", async (req, res) => {
  // const transcationSession = await mongoose.startSession();

  try {
    const { email, password, name } = req.body;
    const { sessionId } = req.signedCookies;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // transcationSession.startTransaction();

    // Create new user
    const user = new User({
      email,
      password,
      name,
    });

    let session;

    if (!sessionId) {
      session = new Session({
        userId: user._id,
        expires: Math.round(Date.now() / 1000) + 60 * 60 * 24 * 30,
      });
    } else {
      session = await Session.findById(sessionId);
    }

    const cart = new Cart({
      userId: user._id,
      courses: session.data.cart,
    });

    session.data = {};
    session.expires = Math.round(Date.now() / 1000) + 60 * 60 * 24 * 30;
    session.userId = user._id;

    await session.save();
    await user.save();
    await cart.save();
    res.cookie("sessionId", sessionId, {
      signed: true,
    });

    // transcationSession.commitTransaction();

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    // transcationSession.abortTransaction();
    res.status(500).json({ message: error.message });
  }
});

// Login user
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const { sessionId } = req.signedCookies;

//     // Find user
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // Check password
//     const isPasswordValid = await user.comparePassword(password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // -----------------after user is authenticated------------------

//     if (!sessionId) {
//       return res.json({ message: "sessionId is not present" });
//     }

//     const currentSessionOfUser = await Session.findById(sessionId);

//     if (!currentSessionOfUser) {
//       return res.json({ message: "sessionID is expired" });
//     }
//     const previousSessionOfUser = await Session.findById(user.sessionId);

//     res.json({
//       message: "Login successful",
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

//logout
router.post("/logout", async (req, res) => {
  const { sessionId } = req.signedCookies;
  const deletedSession = await Session.findByIdAndDelete(sessionId);
  res.clearCookie("sessionId")
});

router.get("/profile", async (req, res) => {
  const { sessionId } = req.signedCookies;
  const session = await Session.findById(sessionId);
  if (!session.userId || !session) {
    res.clearCookie("sessionId");
    return res.json({ message: "you are not authorized" });
  }
  const userId = session.userId;
  const user = await User.findById(userId);
  return res.json(user);
});

export default router;
