import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./libs/db.js";
import router from "./routes/index.route.js";
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PATCH','PUT', 'DELETE', 'OPTIONS'] }));
app.use(express.json());
app.use('/api', router);


connectDB();

export default app;
