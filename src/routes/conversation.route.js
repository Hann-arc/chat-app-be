import { Router } from "express";
import * as conversationController from "../controllers/conversation.controller.js";

const conversationRouter = Router();

conversationRouter.post("/",  conversationController.startConversation);
conversationRouter.get("/",  conversationController.getConversations);
conversationRouter.delete("/:conversationId",  conversationController.deleteConversation);

export default conversationRouter;