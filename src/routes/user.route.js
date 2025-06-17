import { Router } from "express";
import * as userController from '../controllers/user.controller.js'
import upload from "../middlewares/file-upload.middleware.js";

const userRouter = Router()

userRouter.get('/search', userController.findUniqueUserByUserId)
userRouter.get('/search/contact', userController.findUserByName)
userRouter.get('/', userController.getAllUser);
userRouter.get('/:id', userController.getUserById);
userRouter.delete('/delete/:id', userController.deleteUser);
userRouter.patch('/update', upload.single('profilePic'),userController.updateProfile);
userRouter.patch('/update/password', userController.updatePassword);


export default userRouter