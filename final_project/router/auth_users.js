const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];


// Check whether username already exists
const isValid = (username) => {
  return users.some(user => user.username === username);
};


// Check whether username and password match
const authenticatedUser = (username, password) => {
  return users.some(
    user => user.username === username && user.password === password
  );
};


// Login registered user
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: "Invalid username or password"
    });
  }

  const token = jwt.sign(
    { username: username },
    "fingerprint_customer",
    { expiresIn: "1h" }
  );

  req.session.authorization = {
    accessToken: token,
    username: username
  };

  return res.status(200).json({
    message: "Login successful",
    accessToken: token
  });
});


// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.body.username;
  const review = req.body.review;

  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  if (!username || !review) {
    return res.status(400).json({
      message: "Username and review are required"
    });
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review successfully added/modified",
    reviews: books[isbn].reviews
  });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.body.username;
  
    if (!books[isbn]) {
      return res.status(404).json({
        message: "Book not found"
      });
    }
  
    if (!username || !books[isbn].reviews[username]) {
      return res.status(404).json({
        message: "Review not found"
      });
    }
  
    delete books[isbn].reviews[username];
  
    return res.status(200).json({
      message: "Review successfully deleted",
      reviews: books[isbn].reviews
    });
  });