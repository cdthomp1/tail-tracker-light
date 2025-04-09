const express = require('express');
const router = express.Router();
const User = require("../models/user");
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Register
router.post('/register', async (req, res) => {
    console.log("register")
    const { username, password } = req.body;
    try {
        const user = new User({ username, password });
        await user.save();
        res.status(201).json({ message: 'User created' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    console.log("login")
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ username: user.username });
});

// Get airlines
router.get('/airlines', (req, res) => {
    const dataDir = path.join(__dirname, '../data');
    const airlines = fs.readdirSync(dataDir)
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
    res.json(airlines);
});

// Get aircraft for an airline
router.get('/aircraft/:airline', (req, res) => {
    const { airline } = req.params;
    const filePath = path.join(__dirname, `../data/${airline}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json(data);
});

// Update seen aircraft
router.post('/seen', async (req, res) => {
    const { username, airline, registration } = req.body;
    const user = await User.findOne({ username });
    let seen = user.seenAircraft.get(airline) || [];
    if (seen.includes(registration)) {
        seen = seen.filter(reg => reg !== registration);
    } else {
        seen.push(registration);
    }
    user.seenAircraft.set(airline, seen);
    await user.save();
    res.json({ seen });
});

// Get seen aircraft
router.get('/seen/:username/:airline', async (req, res) => {
    const { username, airline } = req.params;
    const user = await User.findOne({ username });
    const seen = user.seenAircraft.get(airline) || [];
    console.log(seen)
    res.json(seen);
});

module.exports = router;