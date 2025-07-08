const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require('fs');
const path = require('path');
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); // Serve image files

// Routes
const medicineRoutes = require("./routes/medicineRoutes");
const imageScanRoute = require("./routes/imageScan");

app.use("/api/medicines", medicineRoutes);
app.use("/api/scan", imageScanRoute);

// Show All Medicines
app.get('/api/medicines/all', (req, res) => {
    fs.readdir('uploads', (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to read medicines' });

    const meds = files.map(file => {
    const [name = 'Unknown', notes = 'No instructions'] = file.split('__');
        return {
        name,
        notes: notes?.replace(/\.[^/.]+$/, '') || 'No instructions',
        image: file
        };
    });

    res.json(meds);
    });
});

// Root Health Check
app.get("/", (req, res) => {
    res.send("Medimate backend is up & running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🟢 Backend server running on port ${PORT}`);
});
