import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const httpServer = createServer(app);

const JWT_SECRET = process.env.JWT_SECRET || 'za-secret-security-key-2024';

// Mock User Database (Normally this would be in a real DB)
const USERS = [
    {
        id: 1,
        username: 'admin',
        // Password is 'admin123' hashed
        passwordHash: '$2a$10$X87I.8vMv8m0xXhW2GzR8OQG8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q'
    }
];
// Note: Generating a fresh hash for 'admin123' if the above is placeholder-style
// '$2a$10$95zFfV8H6E9X9qVd5yG3.O7mE1P2g4p5Xv9zFfV8H6E9X9qVd5yG3'
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('admin123', 10);
const users = [
    { username: 'admin', password: ADMIN_PASSWORD_HASH }
];

// Setup Uploads Directory
const UPLOADS_DIR = 'uploads';
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// Serve static files from uploads
app.use('/uploads', express.static(UPLOADS_DIR));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Authentication Middleware
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

// Login Route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt for:', username);

    const user = users.find(u => u.username === username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username: user.username });
});

// Health Check Route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Mock Database
let reports = [];
let alarms = [];
let voiceMessages = [];
let dashboardClients = []; // List of { socketId }
let lastAssignedIndex = -1;
let callHistory = []; // Saved calls

const addCallToHistory = (data) => {
    const callRecord = {
        id: Date.now() + Math.random().toString(36).substr(2, 9), // More reliable unique ID
        callerId: data.callerId || 'Mobile-User',
        location: data.location || 'غير محدد',
        timestamp: new Date(),
        type: data.type || 'voice'
    };
    callHistory.unshift(callRecord);
    if (callHistory.length > 100) callHistory.pop(); // Keep it manageable
    io.emit('new_call_history', callRecord);
    return callRecord;
};

// Socket.io Connection
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Register as a Dashboard Client (Protected)
    socket.on('register_dashboard', (data) => {
        const token = data?.token;
        if (!token) {
            console.warn('Dashboard registration attempt without token');
            return;
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            if (!dashboardClients.includes(socket.id)) {
                dashboardClients.push(socket.id);
                console.log('Dashboard registered (Authenticated):', socket.id, 'User:', decoded.username);
            }
        } catch (err) {
            console.warn('Invalid token for dashboard registration:', socket.id);
        }
    });

    // Call Signaling (WebRTC Relay)
    socket.on('call_initiate', (data) => {
        // data: { callerId, offer, type }
        console.log(`Call initiated by ${data.callerId} (Type: ${data.type})`);

        if (dashboardClients.length === 0) {
            console.warn('No dashboards available to receive call');
            socket.broadcast.emit('incoming_call', { ...data, socketId: socket.id }); // Fallback to broadcast
            return;
        }

        // Round Robin Distribution
        lastAssignedIndex = (lastAssignedIndex + 1) % dashboardClients.length;
        const targetSocketId = dashboardClients[lastAssignedIndex];

        // LOG CALL (Only if not SOS, as SOS is logged via /api/alarms)
        if (data.type !== 'SOS') {
            addCallToHistory({
                callerId: data.callerId,
                location: data.location,
                type: data.type
            });
        }

        console.log(`Assigning call ${data.callerId} to dashboard ${targetSocketId}`);
        io.to(targetSocketId).emit('incoming_call', { ...data, socketId: socket.id });
    });

    socket.on('call_accept', (data) => {
        // data: { answer, callerId }
        console.log(`Call accepted for ${data.callerId}`);
        socket.broadcast.emit('call_answered', data);
    });

    socket.on('call_reject', (data) => {
        // data: { callerId }
        console.log(`Call rejected/ended for ${data?.callerId}`);
        socket.broadcast.emit('call_ended', data);
    });

    socket.on('ice_candidate', (data) => {
        // data: { candidate, targetId }
        socket.broadcast.emit('ice_candidate', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        dashboardClients = dashboardClients.filter(id => id !== socket.id);
        if (lastAssignedIndex >= dashboardClients.length) {
            lastAssignedIndex = Math.max(0, dashboardClients.length - 1);
        }
    });
});

// API Routes

// Get all reports (Protected)
app.get('/api/reports', authMiddleware, (req, res) => {
    res.json(reports);
});

// Create a new report
app.post('/api/reports', upload.array('media'), (req, res) => {
    try {
        console.log('Received report:', req.body);
        console.log('Files:', req.files?.length || 0);

        const files = req.files || [];
        const mediaPaths = files.map(f => ({
            filename: f.filename,
            path: `/uploads/${f.filename}`,
            mimetype: f.mimetype
        }));

        const newReport = {
            id: Date.now(),
            timestamp: new Date(),
            ...req.body,
            media: mediaPaths
        };

        reports.unshift(newReport); // Add to beginning
        io.emit('new_report', newReport); // Notify admin
        res.status(201).json(newReport);
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ error: 'Failed to create report', details: error.message });
    }
});

// Voice Message Upload
app.post('/api/voice', upload.single('audio'), (req, res) => {
    try {
        console.log('Received voice message:', req.body);
        console.log('Audio file:', req.file?.filename || 'none');

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const voiceMsg = {
            id: Date.now(),
            timestamp: new Date(),
            filename: req.file.filename,
            path: `/uploads/${req.file.filename}`,
            ...req.body // deviceId, location, etc.
        };

        voiceMessages.unshift(voiceMsg);
        io.emit('new_voice', voiceMsg);
        res.status(201).json(voiceMsg);
    } catch (error) {
        console.error('Error uploading voice message:', error);
        res.status(500).json({ error: 'Failed to upload voice message', details: error.message });
    }
});

app.get('/api/voice', authMiddleware, (req, res) => {
    res.json(voiceMessages);
});

// Trigger Alarm
app.post('/api/alarms', (req, res) => {
    try {
        console.log('Received alarm:', req.body);

        const newAlarm = {
            id: Date.now() + Math.random().toString(36).substr(2, 5),
            timestamp: new Date(),
            ...req.body
        };
        alarms.unshift(newAlarm);
        if (alarms.length > 50) alarms.pop();

        // Use unified logging helper
        addCallToHistory({
            callerId: req.body.deviceId || 'Mobile-User',
            location: req.body.location || 'غير محدد',
            type: 'SOS'
        });

        io.emit('new_alarm', newAlarm); // Keep this for urgent popup alert
        res.status(201).json(newAlarm);
    } catch (error) {
        console.error('Error creating alarm:', error);
        res.status(500).json({ error: 'Failed to create alarm', details: error.message });
    }
});

// Get all alarms
app.get('/api/alarms', (req, res) => {
    res.json(alarms);
});

// Get call history (Protected)
app.get('/api/calls', authMiddleware, (req, res) => {
    res.json(callHistory);
});

const PORT = process.env.PORT || 3000;
// Listen on all interfaces
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
