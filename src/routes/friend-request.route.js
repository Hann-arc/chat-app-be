import { Router } from "express";
import * as requesetFriendController from '../controllers/friend-request.controller.js'

const requestRouter = Router();

requestRouter.get('/pending', requesetFriendController.getPendingRequests);
requestRouter.get('/accepted', requesetFriendController.getAcceptedContacts);
requestRouter.patch('/accepted/:requestId', requesetFriendController.updateStatusFriendRequestToAccepted);
requestRouter.get('/acc', requesetFriendController.getAccReq);
requestRouter.get('/recive', requesetFriendController.getReceivedFriendRequests)
requestRouter.delete('/:requestId', requesetFriendController.rejectedRequest);
requestRouter.post('/:receiverId', requesetFriendController.sendFriendRequest);

export default requestRouter