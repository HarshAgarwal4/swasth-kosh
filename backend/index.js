import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { isLoggedIn } from './middlewares/Auth.js';
import { userRoutes } from './App/routes/user.js';
import workerRoutes from './App/routes/workerRoutes.js';
import mineRoutes from './App/routes/mineRoutes.js';
import screeningRoutes from './App/routes/screeningRoutes.js';
import spirometryRoutes from './App/routes/spirometryRoutes.js';
import audioRoutes from './App/routes/audioRoutes.js';
import riskRoutes from './App/routes/riskRoutes.js';
import referralRoutes from './App/routes/referralRoutes.js';
import facilityRoutes from './App/routes/facilityRoutes.js';
import chatRoutes from './App/routes/chatRoutes.js';
import callRoutes from './App/routes/callRoutes.js';
import aiRoutes from './App/routes/aiRoutes.js';
import analyticsRoutes from './App/routes/analyticsRoutes.js';
import notificationRoutes from './App/routes/notificationRoutes.js';
import roleRequestRoutes from './App/routes/roleRequestRoutes.js';
import formRoutes from './App/routes/formRoutes.js';
import appointmentRoutes from './App/routes/appointmentRoutes.js';
import adminRoutes from './App/routes/adminRoutes.js';
import { initializeSocket } from './services/socketService.js';

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Global Auth middleware
app.use(isLoggedIn);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SwasthaKosh Occupational Health Platform API',
  });
});

// Existing & extended user auth routes
app.use('/', userRoutes);

// Core platform endpoints
app.use('/api/workers', workerRoutes);
app.use('/api/mines', mineRoutes);
app.use('/api/screenings', screeningRoutes);
app.use('/api/spirometry', spirometryRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Enterprise Admin, Role Requests, Dynamic Forms, & Gated Appointments
app.use('/api/role-requests', roleRequestRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 4000;
const DB_URL = process.env.DB_URL || "mongodb://localhost:27017/RBF";

mongoose
  .connect(DB_URL, {
    dbName: "Swasth_Kosh_App",
  })
  .then(() => {
    console.log("Connected to MongoDB Database");
    server.listen(PORT, () => {
      console.log(`Server and Socket.IO running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });