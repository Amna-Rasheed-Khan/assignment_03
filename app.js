const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/taskmanager';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory Tasks array for fast deployment
let tasks = [];
let idCounter = 1;

// Mock Task Model for unit tests
class Task {
    constructor(data) {
        this.title = data.title;
        this.completed = data.completed || false;
    }
    validateSync() {
        if (!this.title) {
            return { errors: { title: { message: 'Title is required' } } };
        }
        return null;
    }
}

// API Routes
app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
    if (!req.body.title || req.body.title.trim() === '') {
        return res.status(400).json({ error: 'Title is required' });
    }
    const newTask = { id: idCounter++, title: req.body.title, completed: false };
    tasks.push(newTask);
    res.status(201).json(newTask);
});

// For unit testing
module.exports = { app, Task };


// Start server if not in test mode
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
