import FriendRequest from "../models/friend-request.model.js";
import User from "../models/user.model.js";

export const sendFriendRequest = async (req, res) => {
  const { receiverId } = req.params;
  const senderId = res.locals.user.id;

  try {
    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required" });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
      status: { $in: ["Pending", "Accepted"] },
    }).select("-__v");

    if (
      existingRequest &&
      existingRequest.sender.toString() === receiverId &&
      existingRequest.receiver.toString() === senderId &&
      existingRequest.status === "Pending"
    ) {
      existingRequest.status = "Accepted";
      await existingRequest.save();

      return res.status(200).json({
        message: "Friend request automatically accepted",
        data: existingRequest,
      });
    }

    if (existingRequest) {
      return res.status(400).json({
        message: "You have already sent or are already friends with this user",
      });
    }

    const friendRequest = new FriendRequest({
      sender: senderId,
      receiver: receiverId,
      status: "Pending",
    });

    await friendRequest.save();

    return res.status(201).json({
      message: "Friend request sent successfully",
      data: friendRequest,
    });
  } catch (error) {
    console.error("Error in sendFriendRequest:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAcceptedContacts = async (req, res) => {
  const userId = res.locals.user.id;

  try {
    const acceptedContacts = await FriendRequest.find({
      $or: [
        { sender: userId, status: "Accepted" },
        { receiver: userId, status: "Accepted" },
      ],
    })
      .populate("sender", "fullName profilePic userId")
      .populate("receiver", "fullName profilePic userId");

    if (!acceptedContacts) {
      return res.status(404).json({ message: "No accepted contacts found" });
    }

    res.status(200).json({
      message: "Accepted contacts retrieved successfully",
      data: acceptedContacts,
    });
  } catch (error) {
    console.error("Error in getAcceptedContacts:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPendingRequests = async (req, res) => {
  const userId = res.locals.user.id;

  try {
    const pendingRequests = await FriendRequest.find({
      sender: userId,
      status: "Pending",
    })
      .populate("receiver", "fullName profilePic userId bio")
      .select("-__v");

    if (!pendingRequests) {
      return res
        .status(404)
        .json({ message: "No pending friend requests found" });
    }

    res.status(200).json({
      message: "Pending friend requests retrieved successfully",
      data: pendingRequests,
    });
  } catch (error) {
    console.error("Error in getPendingRequests:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateStatusFriendRequestToAccepted = async (req, res) => {
  const { requestId } = req.params;
  const myId = res.locals.user.id;

  try {
    if (!myId) return res.status(401).json({ message: "Unauthorized" });

    const friendRequest = await FriendRequest.findById(requestId);

    if (myId != friendRequest.receiver) {
      return res.status(401).json({
        message: "Unauthorized: youre not authorized to comfirm this request",
      });
    }

    console.log(friendRequest);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    friendRequest.status = "Accepted";
    await friendRequest.save();

    res.status(200).json({
      message: `Friend request accepted successfully`,
      data: friendRequest,
    });
  } catch (error) {
    console.error(
      "Error in updateStatusFriendRequestToAccepted:",
      error.message
    );
    res.status(500).json({ message: "Internal server error" });
  }
};

export const rejectedRequest = async (req, res) => {
  const { requestId } = req.params;
  const myId = res.locals.user.id;

  try {
    if (!myId) return res.status(401).json({ message: "Unauthorized" });

    const friendRequest = await FriendRequest.findById(requestId).select(
      "-__v"
    );

    if (myId != friendRequest.receiver) {
      return res.status(401).json({
        message: "Unauthorized: youre not authorized to decline this request",
      });
    }
    console.log(`friend reciver id : ${friendRequest.receiver} myId: ${myId}`);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    await friendRequest.deleteOne();
    res
      .status(200)
      .json({ message: "Message deleted successfully", data: friendRequest });
  } catch (error) {
    console.error("Error in rejectedRequest:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getReceivedFriendRequests = async (req, res) => {
  const userId = res.locals.user.id;

  try {
    const receivedRequests = await FriendRequest.find({
      receiver: userId,
      status: "Pending",
    })
      .populate("sender", "fullName profilePic userId bio")
      .select("-__v");

    res.status(200).json({
      message: "Received friend requests retrieved successfully",
      data: receivedRequests,
    });
  } catch (error) {
    console.error("Error in getReceivedFriendRequests:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAccReq = async (req, res) => {
  const myId = res.locals.user.id;

  try {
    const acceptedRequests = await FriendRequest.find({
      status: "Accepted",
      $or: [
        { sender: myId },
        { receiver: myId }
      ]
    })
      .populate("sender", "fullName profilePic userId")
      .populate("receiver", "fullName profilePic userId")
      .select("-__v");

    if (!acceptedRequests.length) {
      return res.status(404).json({ message: "No accepted requests found" });
    }

    res.status(200).json({
      message: "Accepted requests retrieved successfully",
      data: acceptedRequests,
    });
  } catch (error) {
    console.error("Error in getAccReq:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

