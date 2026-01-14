import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';

const app = express();
const httpServer = createServer(app);

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Connected to SQLite database');
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                deviceId TEXT,
                type TEXT,
                description TEXT,
                location TEXT,
                media TEXT
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS alarms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                deviceId TEXT,
                location TEXT,
                type TEXT
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS calls (
                id TEXT PRIMARY KEY,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                callerId TEXT,
                location TEXT,
                type TEXT
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS voice_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                deviceId TEXT,
                location TEXT,
                filename TEXT,
                path TEXT
            )`);
        });
    }
});

// Helper for DB queries
const dbRun = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

const dbAll = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

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
let dashboardClients = []; // List of { socketId }
let lastAssignedIndex = -1;

const addCallToHistory = async (data) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    const callRecord = {
        id,
        callerId: data.callerId || 'Mobile-User',
        location: data.location || 'غير محدد',
        timestamp: new Date(),
        type: data.type || 'voice'
    };
    try {
        await dbRun(
            'INSERT INTO calls (id, timestamp, callerId, location, type) VALUES (?, ?, ?, ?, ?)',
            [callRecord.id, callRecord.timestamp.toISOString(), callRecord.callerId, callRecord.location, callRecord.type]
        );
        io.emit('new_call_history', callRecord);
    } catch (err) {
        console.error('Error saving call to DB', err);
    }
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
        // data: { answer, callerId, targetId }
        console.log(`Call accepted for ${data.callerId} (Target: ${data.targetId})`);
        if (data.targetId) {
            io.to(data.targetId).emit('call_answered', data);
        } else {
            socket.broadcast.emit('call_answered', data);
        }
    });

    socket.on('call_reject', (data) => {
        // data: { callerId, targetId }
        console.log(`Call rejected/ended for ${data?.callerId}`);
        if (data.targetId) {
            io.to(data.targetId).emit('call_ended', data);
        } else {
            socket.broadcast.emit('call_ended', data);
        }
    });

    socket.on('call_ended', (data) => {
        console.log(`Call ended by ${data?.callerId}`);
        if (data.targetId) {
            io.to(data.targetId).emit('call_ended', data);
        } else {
            socket.broadcast.emit('call_ended', data);
        }
    });

    socket.on('ice_candidate', (data) => {
        // data: { candidate, targetId }
        if (data.targetId) {
            io.to(data.targetId).emit('ice_candidate', data);
        } else {
            socket.broadcast.emit('ice_candidate', data);
        }
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
app.get('/api/reports', authMiddleware, async (req, res) => {
    try {
        const rows = await dbAll('SELECT * FROM reports ORDER BY timestamp DESC');
        const formattedRows = rows.map(r => ({
            ...r,
            media: JSON.parse(r.media || '[]')
        }));
        res.json(formattedRows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// Create a new report
app.post('/api/reports', upload.array('media'), async (req, res) => {
    try {
        console.log('Received report:', req.body);
        const files = req.files || [];
        const mediaPaths = files.map(f => ({
            filename: f.filename,
            path: `/uploads/${f.filename}`,
            mimetype: f.mimetype
        }));

        const newReport = {
            timestamp: new Date().toISOString(),
            deviceId: req.body.deviceId,
            type: req.body.type,
            description: req.body.description,
            location: req.body.location,
            media: JSON.stringify(mediaPaths)
        };

        const result = await dbRun(
            'INSERT INTO reports (timestamp, deviceId, type, description, location, media) VALUES (?, ?, ?, ?, ?, ?)',
            [newReport.timestamp, newReport.deviceId, newReport.type, newReport.description, newReport.location, newReport.media]
        );

        const savedReport = { id: result.lastID, ...newReport, media: mediaPaths };
        io.emit('new_report', savedReport);
        res.status(201).json(savedReport);
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ error: 'Failed to create report', details: error.message });
    }
});

// Voice Message Upload
app.post('/api/voice', upload.single('audio'), async (req, res) => {
    try {
        console.log('Received voice message:', req.body);
        console.log('Audio file:', req.file?.filename || 'none');

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const voiceMsg = {
            timestamp: new Date().toISOString(),
            filename: req.file.filename,
            path: `/uploads/${req.file.filename}`,
            deviceId: req.body.deviceId || 'Mobile-User',
            location: req.body.location || 'غير محدد'
        };

        const result = await dbRun(
            'INSERT INTO voice_messages (timestamp, deviceId, location, filename, path) VALUES (?, ?, ?, ?, ?)',
            [voiceMsg.timestamp, voiceMsg.deviceId, voiceMsg.location, voiceMsg.filename, voiceMsg.path]
        );

        const savedVoice = { id: result.lastID, ...voiceMsg };
        io.emit('new_voice', savedVoice);
        res.status(201).json(savedVoice);
    } catch (error) {
        console.error('Error uploading voice message:', error);
        res.status(500).json({ error: 'Failed to upload voice message', details: error.message });
    }
});

app.get('/api/voice', authMiddleware, async (req, res) => {
    try {
        const rows = await dbAll('SELECT * FROM voice_messages ORDER BY timestamp DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch voice messages' });
    }
});

// Trigger Alarm
app.post('/api/alarms', async (req, res) => {
    try {
        console.log('Received alarm:', req.body);
        const newAlarm = {
            timestamp: new Date().toISOString(),
            deviceId: req.body.deviceId,
            location: req.body.location,
            type: req.body.type || 'SOS'
        };

        const result = await dbRun(
            'INSERT INTO alarms (timestamp, deviceId, location, type) VALUES (?, ?, ?, ?)',
            [newAlarm.timestamp, newAlarm.deviceId, newAlarm.location, newAlarm.type]
        );

        const savedAlarm = { id: result.lastID, ...newAlarm };

        // Log to call history
        await addCallToHistory({
            callerId: req.body.deviceId || 'Mobile-User',
            location: req.body.location || 'غير محدد',
            type: 'SOS'
        });

        io.emit('new_alarm', savedAlarm);
        res.status(201).json(savedAlarm);
    } catch (error) {
        console.error('Error creating alarm:', error);
        res.status(500).json({ error: 'Failed to create alarm', details: error.message });
    }
});

// Get all alarms
app.get('/api/alarms', async (req, res) => {
    try {
        const rows = await dbAll('SELECT * FROM alarms ORDER BY timestamp DESC LIMIT 50');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch alarms' });
    }
});

// Get call history (Protected)
app.get('/api/calls', authMiddleware, async (req, res) => {
    try {
        const rows = await dbAll('SELECT * FROM calls ORDER BY timestamp DESC LIMIT 100');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch calls' });
    }
});



const PORT = process.env.PORT || 3000;
// Listen on all interfaces
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
