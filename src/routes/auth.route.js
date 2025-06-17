import { Router } from "express";
import * as authController from '../controllers/auth.controller.js'
import { auth } from "../middlewares/auth.middleware.js";

const authRouter = Router()

authRouter.get('/me', auth, authController.getMe)
authRouter.post('/login', authController.login)
authRouter.post('/register', authController.register)


export default authRouter