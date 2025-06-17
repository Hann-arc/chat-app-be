import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./libs/db.js";
import router from "./routes/index.route.js";
import cors from 'cors'
import { app, server } from "./libs/socket.js";

dotenv.config();

const port = process.env.PORT

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json())

app.use('/api', router)

server.listen(port, () => {
    console.log('Server berjalan di port' , port)
    connectDB()
})