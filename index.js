const express = require('express');
const app = express();
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const db = require('./db'); // Connect SQL
default_port = 8080;
const port = process.env.PORT || default_port;

// Setup EJS and middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Home route
app.get("/main", (req, res) => {
  res.render("index", { message: null });
});

// Login Page
app.get("/main/login", (req, res) => {
  res.render("login", { message: null });
});

// Handle Login Submission
app.post("/main/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render("login", {
      message: { type: 'error', text: 'Both fields are required.' }
    });
  }

  const query = `SELECT * FROM users WHERE email = ?`;
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.render("login", {
        message: { type: 'error', text: 'Database error. Try again later.' }
      });
    }

    if (results.length === 0) {
      return res.render("login", {
        message: { type: 'error', text: 'No account found with this email.' }
      });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.render("login", {
          message: { type: 'error', text: 'Invalid email or password.' }
        });
      }

      // Success
      console.log("Login success for:", user.email);
      res.redirect("/main/login/course");
    });
  });
});


// Register Page
app.get("/main/login/register", (req, res) => {
  res.render("register", { message: null });
});

// Handle Registration
app.post("/main/login/register", (req, res) => {
  const { fullName, email, mobile, country, postalCode, password } = req.body;

  if (!fullName || !email || !mobile || !country || !postalCode || !password) {
    return res.render("register", {
      message: { type: 'error', text: 'All fields are required.' }
    });
  }

  // Check if the email is already registered
  const checkQuery = `SELECT * FROM users WHERE email = ?`;
  db.query(checkQuery, [email], (err, results) => {
    if (err) {
      return res.render("register", {
        message: { type: 'error', text: 'Database error. Try again later.' }
      });
    }

    if (results.length > 0) {
      return res.render("register", {
        message: { type: 'error', text: 'This email is already registered. Please Login.' }
      });
    }

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.render("register", {
          message: { type: 'error', text: 'Error hashing password.' }
        });
      }

      const insertQuery = `
        INSERT INTO users (fullName, email, mobile, country, postalCode, password)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const values = [fullName, email, mobile, country, postalCode, hashedPassword];

      db.query(insertQuery, values, (err, result) => {
        if (err) {
          console.error(err);
          return res.render("register", {
            message: { type: 'error', text: 'Registration failed. Try again.' }
          });
        }

        console.log("User inserted:", result.insertId);
        res.redirect("/main/login/course");
      });
    });
  });
});


// Course and other pages
app.get("/main/login/course", (req, res) => {
  res.render("course", { message: null });
});

app.get("/main/login/contact", (req, res) => {
  res.render("contact", { message: null });
});

app.get("/main/login/home", (req, res) => {
  res.render("home", { message: null });
});

const courseRoutes = [
  "phy", "chem", "math", "data_str", "algorithim", "os", "cn", "database", "fullstack",
  "ml", "cyber", "eng_math", "cloud_comp", "digital_logic", "coa", "theory_of_compu",
  "comp_design", "payment"
];

courseRoutes.forEach(course => {
  const viewPath = course === 'payment'
    ? `course_inside/payment/${course}.ejs`
    : `course_inside/${course}.ejs`;

  app.get(`/main/login/course/${course}`, (req, res) => {
    res.render(viewPath, { message: null });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
