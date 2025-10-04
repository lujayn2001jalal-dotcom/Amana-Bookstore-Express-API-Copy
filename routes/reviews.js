const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const reviewsPath = path.join(__dirname, "..", "data", "reviews.json");

// ==========================
// Read reviews JSON file
// ==========================
function readData(filePath) {
  const fileData = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(fileData);
  return parsed.reviews || [];
}

// ==========================
// Write reviews JSON file
// ==========================
function writeData(filePath, reviews) {
  fs.writeFileSync(filePath, JSON.stringify({ reviews }, null, 2));
}

// ==========================
// GET: Reviews by Book ID
// ==========================
router.get("/:bookId", (req, res) => {
  const reviews = readData(reviewsPath);
  const { bookId } = req.params;

  const bookReviews = reviews.filter(r => r.bookId == bookId);

  if (!bookReviews.length) {
    return res.status(404).json({ success: false, message: "No reviews found for this book" });
  }

  res.json({ success: true, data: bookReviews });
});

// ==========================
// POST: Add a New Review
// ==========================
router.post("/", (req, res) => {
  const reviews = readData(reviewsPath);
  const { bookId, author, title, comment, rating, verified } = req.body;

  // Validate required fields
  if (!bookId || !author || !title || !comment || !rating) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const newReview = {
    id: `review-${reviews.length + 1}`,
    bookId,
    author,
    title,
    comment,
    rating,
    verified: verified || false,
    timestamp: new Date().toISOString()
  };

  reviews.push(newReview);
  writeData(reviewsPath, reviews); // append and save back to file

  res.status(201).json({ success: true, data: newReview });
});

module.exports = router;
