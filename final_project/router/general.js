const express = require('express');
const axios = require('axios');

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

const BASE_URL = "http://localhost:5000";


// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  if (isValid(username)) {
    return res.status(409).json({
      message: "User already exists"
    });
  }

  users.push({
    username: username,
    password: password
  });

  return res.status(201).json({
    message: "User successfully registered"
  });
});


// Get all books
public_users.get('/', function (req, res) {
  return res.status(200).json(books);
});


// Get book details based on ISBN using Axios + async/await
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;

    const response = await axios.get(`${BASE_URL}/`);
    const allBooks = response.data;

    if (allBooks[isbn]) {
      return res.status(200).json(allBooks[isbn]);
    }

    return res.status(404).json({
      message: "Book not found"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving book",
      error: error.message
    });
  }
});


// Get books by author using Axios + async/await
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;

    const response = await axios.get(`${BASE_URL}/`);
    const allBooks = response.data;

    const result = {};

    for (const isbn in allBooks) {
      if (
        allBooks[isbn].author.toLowerCase() ===
        author.toLowerCase()
      ) {
        result[isbn] = allBooks[isbn];
      }
    }

    if (Object.keys(result).length > 0) {
      return res.status(200).json(result);
    }

    return res.status(404).json({
      message: "No books found for this author"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving books",
      error: error.message
    });
  }
});


// Get books by title using Axios + async/await
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;

    const response = await axios.get(`${BASE_URL}/`);
    const allBooks = response.data;

    const result = {};

    for (const isbn in allBooks) {
      if (
        allBooks[isbn].title.toLowerCase() ===
        title.toLowerCase()
      ) {
        result[isbn] = allBooks[isbn];
      }
    }

    if (Object.keys(result).length > 0) {
      return res.status(200).json(result);
    }

    return res.status(404).json({
      message: "No books found with this title"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving books",
      error: error.message
    });
  }
});


// Get book reviews
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }

  return res.status(404).json({
    message: "Book not found"
  });
});


module.exports.general = public_users;