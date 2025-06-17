import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { uploadToCloudinary } from "../service/media.service.js";
import FriendRequest from "../models/friend-request.model.js";


export const getAllUser = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password -__v")
      .sort({ createdAt: -1 });

    if (!users || users < 1)
      return res.status(404).json({ message: "No users found" });

    res
      .status(200)
      .json({ message: "Successfully retrieved all users", data: users });
  } catch (error) {
    console.log("Error in getAllUser controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) return res.status(400).json({ message: "id is require" });

    const user = await User.findById(id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res
      .status(200)
      .json({ message: "Successfully retrieved user", data: user });
  } catch (error) {
    console.log("Error in getUserById controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  const id = res.locals.user.id;

  try {
    if (!id) return res.status(400).json({ message: "user id is require" });

    const user = await User.findById(id).select("-password -__v");

    if (!user) return res.status(400).json({ message: "user not found!" });

    await user.deleteOne();

    res.status(200).json({ message: "user successfully deleted", data: user });
  } catch (error) {
    console.log("Error in deleteUser controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  const { fullName, bio } = req.body;
  const id = res.locals.user.id;

  try {
    if (!id)
      res
        .status(401)
        .json({ message: "You are not authorized to update this profile" });

    const user = await User.findById(id);

    if (!user) return res.status(400).json({ message: "User not found" });

    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file);
      user.profilePic = imageUrl;
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    const updatedUser = await User.findById(id).select("-password -__v");

    res
      .status(200)
      .json({ message: "Update profile successfully", data: updatedUser });
  } catch (error) {
    console.log("Error in updateProfile controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePassword = async (req, res) => {
  const id = res.locals.user.id;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {
    if (!id)
      return res
        .status(401)
        .json({ message: "You are not authorized to update password" });

    if (!currentPassword || !newPassword || !confirmPassword)
      return res.status(400).json({ message: "All fields are required" });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "New passwords do not match" });

    if (newPassword.length < 6)
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });

    const user = await User.findById(id);

    const isMatch = await bcrypt.compare(
      String(currentPassword),
      String(user.password)
    );

    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    const salt = await bcrypt.genSalt(10);
    const hasedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hasedPassword;

    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log("Error in updatePassword controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const findUniqueUserByUserId = async (req, res) => {
  const { userId } = req.query;
  const myId = res.locals.user.id;

  try {
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const user = await User.findOne({ userId }).select("-password -__v");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if(myId === user._id.toString()) return res.status(401).json({ message: "Unauthorized" });

    const isFriend = await FriendRequest.findOne({
      $or: [
        { sender: myId, receiver: user._id, status: "Accepted" },
        { sender: user._id, receiver: myId, status: "Accepted" },
      ],
    });

    const isPending = await FriendRequest.findOne({
      sender: myId,
      receiver: user._id,
      status: "Pending",
    });

    res.status(200).json({
      message: "User found successfully",
      data: {
        ...user.toObject(),
        isFriend: !!isFriend,
        isPending: !!isPending,
      },
    });
  } catch (error) {
    console.error("Error in findUniqueUserByUserId:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const findUserByName = async (req, res) => {
  const { query } = req.query;
  const myId = res.locals.user.id;

  try {
    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "Invalid search query" });
    }

    const acceptedRequests = await FriendRequest.find({
      status: "Accepted",
      $or: [{ sender: myId }, { receiver: myId }],
    }).populate("sender receiver");



    const friendIds = [];
    acceptedRequests.forEach((request) => {
      if (request.sender._id.toString() === myId) {
        friendIds.push(request.receiver._id);
      } else if (request.receiver._id.toString() === myId) {
        friendIds.push(request.sender._id);
      }
    });



    const matchedFriends = await User.find({
      _id: { $in: friendIds },
      fullName: new RegExp(query.trim(), "i"),
    }).select("-password -__v");


    if (!matchedFriends.length) {
      return res
        .status(404)
        .json({ message: "No friends found matching the query" });
    }

    const enrichedFriends = matchedFriends.map((friend) => ({
      ...friend.toObject(),
      isFriend: true,
    }));

    res.status(200).json({
      message: "Matched friends found",
      data: enrichedFriends,
    });
  } catch (error) {
    console.error("Error in findUserByName:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
