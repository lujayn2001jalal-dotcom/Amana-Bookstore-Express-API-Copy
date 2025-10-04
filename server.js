const express = require("express");
const logger = require("./middleware/logger");

const booksRoutes = require("./routes/books");
const reviewsRoutes = require("./routes/reviews");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(logger);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "📚 Welcome to the Amana Bookstore API",
    routes: ["/books", "/reviews"]
  });
});

// Use routes
app.use("/books", booksRoutes);
app.use("/reviews", reviewsRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
