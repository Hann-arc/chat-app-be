import { Router } from "express";
import authRouter from "./auth.route.js";
import userRouter from "./user.route.js";
import messageRouter from "./message.route.js";
import { auth } from "../middlewares/auth.middleware.js";
import conversationRouter from "./conversation.route.js";
import requestRouter from './friend-request.route.js';
 
const router = Router();

router.use("/auth", authRouter);
router.use("/user", auth, userRouter);
router.use("/conversation", auth, conversationRouter);
router.use("/message", auth, messageRouter);
router.use('/request',auth, requestRouter)

export default router;