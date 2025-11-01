import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import { ENV } from './config/env.config'
import { errorHandler } from "./middleware/errorHandler.middleware";

dotenv.config();

const app = express();

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
const apiVersion = 1
const routePrefix = `/api/v${apiVersion}`;
// app.use(`${routePrefix}`, reservationRoutes);

//Health Check Endpoint
app.get(`${routePrefix}/health`, (req, res) => {
    return res.json({
        status: "ok",
        message: "TicketBoss API is running"
    });
});

//Error Handler
app.use(errorHandler)

export default app;

