// routes/imageScan.js
const express = require("express");
const tesseract = require("tesseract.js");
const multer = require("multer");
const sharp = require("sharp");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), async (req, res) => {
    try {
        const buffer = await sharp(req.file.path)
            .grayscale()
            .threshold(150)
            .resize(800)
            .toBuffer();

        const { data: { text } } = await tesseract.recognize(buffer, "eng", {
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        });

        const cleanedText = text.split("\n").find(line => line.length > 3);
        res.json({ medicineName: cleanedText || "Unknown" });
    } catch (err) {
        res.status(500).json({ error: "OCR failed", details: err.message });
    }
});

module.exports = router;
