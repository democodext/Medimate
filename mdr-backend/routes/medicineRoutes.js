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
    const { name, time, notes, duration } = req.body;
    const image = req.file ? req.file.filename : null;

    console.log("Incoming duration:", duration); // debug print

    if (!name || !time) {
        return res.status(400).json({ error: "Missing required fields" });
}

    medicines.push({
        medicine_name: name,
        dosage_time: time,
        instructions: notes || "",
        image: image,
        days_left: duration ? parseInt(duration, 10) : 1 // safe fallback
    });

    return res.status(200).json({ message: "Medicine saved successfully!" });
});


router.get("/", (req, res) => {
    res.json(medicines);
});


// Get all medicines (this will be used in your 'show' logic)
router.get("/all", (req, res) => {
    res.json(medicines);
});
// 

//  Delete medicine and image file
router.delete("/delete/:image", (req, res) => {
    const imageToDelete = req.params.image;
    // Remove from memory
    const index = medicines.findIndex(med => med.image === imageToDelete);
    if (index === -1) {
        return res.status(404).json({ error: "Medicine not found" });
    }

    medicines.splice(index, 1); // remove from array

    // Delete image from file system
    const filePath = path.join("uploads", imageToDelete);
    fs.unlink(filePath, (err) => {
        // even if file not found, respond success
        return res.json({ message: "Medicine deleted successfully!" });
    });
});
module.exports = router;
