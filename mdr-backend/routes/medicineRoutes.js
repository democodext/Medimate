const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();


//  Setup storage and filename format
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
    let name = "medicine";
    let notes = "no_notes";

    if (req.body && req.body.name) {
        name = req.body.name.replace(/\s+/g, "-");
    }

    if (req.body && req.body.notes) {
        notes = req.body.notes.replace(/\s+/g, "-");
    }

    const ext = path.extname(file.originalname);
    cb(null, `${name}__${notes}${ext}`);
}

});

const upload = multer({ storage });

// ➕ Add new medicine
const medicines = []; // Add at the top of file (global)

router.post("/add", upload.single("image"), (req, res) => {
    const { name, time, notes } = req.body;

    if (!name || !time) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Save to memory (for now)
    const image = req.file ? req.file.filename : null;

    medicines.push({
        medicine_name: name,
        dosage_time: time,
        instructions: notes || "",
        image: image
    });

    return res.status(200).json({ message: "Medicine saved successfully!" });
});

router.get("/", (req, res) => {
    res.json(medicines);
});


// Get all medicines (this will be used in your 'show' logic)
router.get("/all", (req, res) => {
    fs.readdir("uploads", (err, files) => {
    if (err) return res.status(500).json({ error: "Failed to read medicines" });

    const meds = files.map((file) => {
        const [name, notesWithExt] = file.split("__");
        const notes = notesWithExt?.replace(/\.[^/.]+$/, "") || "No instructions";
        return {
        name: name || "Unknown",
        notes: notes,
        image: file,
        };
    });

    res.json(meds);
    });
});
// 

module.exports = router;
