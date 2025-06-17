import { Router } from "express";
import * as messageController from '../controllers/message.controller.js';
import upload from "../middlewares/file-upload.middleware.js";

const messageRouter = Router();


messageRouter.get('/', messageController.getMessagesByConversationId);
messageRouter.post('/', upload.single('image'), messageController.sendMessage);
messageRouter.delete('/:messageId', messageController.deleteMessage);

export default messageRouter;