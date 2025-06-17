import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import bcrypt from 'bcryptjs'

export const register = async (req, res) => {
  const { email, password, fullName } = req.body;

  try {
    if (!email || !password || !fullName)
      return res.status(400).json({ message: "all fields are require" });

    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be atleast 6 characters" });

    const findEmail = await User.findOne({ email })

    if (findEmail)
      return res.status(400).json({ message: "Email already exist" });

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      email,
      password: hashedPassword,
      fullName,
    });

    if (!newUser) return res.status(400).json({ message: "Invalid user data" });

    await newUser.save();

    res.status(201).json({
      message: "User succesfully created",
      data: {
        _id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
      },
    });
  } catch (error) {
    console.log("Error in register controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password)
      return res.status(400).json({ message: "all fields are require" });

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Email is incorrect" });

    const isMatch = await bcrypt.compare(
      String(password),
      String(user.password)
    );

    if (!isMatch)
      return res.status(400).json({ message: "Password is incorrect" });

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getMe = async (req, res) => {
  const  userId  = res.locals.user.id;

  try {
    if (!userId) return res.status(400).json({ message: "userId is require" });
    const user = await User.findById(userId).select("-password -__v");

    if (!user) return res.status(404).json({ message: "User not found" });

    res
      .status(200)
      .json({ message: "Successfully retrieved user", data: user });
  } catch (error) {
    console.log("Error in getMe controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
