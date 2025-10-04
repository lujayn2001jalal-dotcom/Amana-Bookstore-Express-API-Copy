const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const booksPath = path.join(__dirname, "..", "data", "books.json");
const reviewsPath = path.join(__dirname, "..", "data", "reviews.json");

// Helper to read JSON
function readData(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

// Helper to write JSON
function writeData(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ✅ GET all books
router.get("/", (req, res) => {
  const rawData = readData(booksPath);
  const books = Array.isArray(rawData) ? rawData : rawData.books;
  res.json({ success: true, data: books });
});

// ✅ GET single book by ID
router.get("/:id", (req, res) => {
  const rawData = readData(booksPath);
  const books = Array.isArray(rawData) ? rawData : rawData.books;

  const book = books.find((b) => Number(b.id) === Number(req.params.id));
  if (!book) {
    return res.status(404).json({ success: false, message: "Book not found" });
  }
  res.json({ success: true, data: book });
});

// ✅ GET books published between date range
router.get("/range/published", (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({
      success: false,
      message: "Start and end dates are required"
    });
  }

  const rawData = readData(booksPath);
  const books = Array.isArray(rawData) ? rawData : rawData.books;

  const startDate = new Date(start);
  const endDate = new Date(end);

  const filtered = books.filter((b) => {
    const pubDate = new Date(b.datePublished); // ✅ must match JSON key
    return pubDate >= startDate && pubDate <= endDate;
  });

  res.json({ success: true, data: filtered });
});


// ✅ GET top 10 rated books (rating * reviewsCount)
router.get("/top/rated", (req, res) => {
  const rawData = readData(booksPath);
  const books = Array.isArray(rawData) ? rawData : rawData.books;

  const sorted = [...books].sort((a, b) => {
    const scoreA = (a.rating || 0) * (a.reviewsCount || 0);
    const scoreB = (b.rating || 0) * (b.reviewsCount || 0);
    return scoreB - scoreA;
  });

  res.json({ success: true, data: sorted.slice(0, 10) });
});

// ✅ GET books that are featured
router.get("/featured/list", (req, res) => {
  const rawData = readData(booksPath);
  const books = Array.isArray(rawData) ? rawData : rawData.books;

  const featured = books.filter((b) => b.featured === true);
  res.json({ success: true, data: featured });
});

// ✅ GET reviews for a specific book
// Example: GET /books/1/reviews
router.get("/:id/reviews", (req, res) => {
  const rawBooks = readData(booksPath);
  const books = Array.isArray(rawBooks) ? rawBooks : rawBooks.books;
  const book = books.find((b) => Number(b.id) === Number(req.params.id));
  if (!book) {
    return res.status(404).json({ success: false, message: "Book not found" });
  }

  const rawReviews = readData(reviewsPath);
  const reviews = Array.isArray(rawReviews) ? rawReviews : rawReviews.reviews;

  const bookReviews = reviews.filter((r) => Number(r.bookId) === Number(req.params.id));
  res.json({ success: true, data: bookReviews });
});

// ✅ POST new book
router.post("/", (req, res) => {
  const rawData = readData(booksPath);
  const books = Array.isArray(rawData) ? rawData : rawData.books;

  const {
    title,
    author,
    description,
    price,
    image,
    isbn,
    genre,
    tags,
    datePublished,
    pages,
    language,
    publisher,
    rating,
    reviewCount,
    inStock,
    featured,
  } = req.body;

  if (!title || !author) {
    return res.status(400).json({
      success: false,
      message: "Title and author are required"
    });
  }

  const newBook = {
    id: (books.length ? String(parseInt(books[books.length - 1].id) + 1) : "1"), // keep id as string
    title,
    author,
    description: description || "",
    price: price || 0,
    image: image || "",
    isbn: isbn || "",
    genre: genre || [],
    tags: tags || [],
    datePublished: datePublished || null, // match dataset key
    pages: pages || 0,
    language: language || "Unknown",
    publisher: publisher || "Unknown",
    rating: rating || 0,
    reviewCount: reviewCount || 0, // match dataset key
    inStock: inStock !== undefined ? inStock : true,
    featured: featured || false,
  };

  books.push(newBook);
  writeData(booksPath, { books }); // keep consistent structure

  res.status(201).json({ success: true, data: newBook });
});


module.exports = router;
