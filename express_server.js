var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

// Set view engine
app.set("view engine", "ejs");

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "testUserID": {
    id: "testUserRandomID",
    email: "testUser@example.com",
    password: "snaggle_hoof"
  }
}

// Listening on port...
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// List long and short URLs
app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["userKey"],
    urls: urlDatabase,
    user: users[req.cookies["userKey"]]
  };
  res.render("urls_index", templateVars);
});

// User registration page
app.get("/register", (req, res) => {
  let templateVars = {
    username: req.cookies["userKey"],
    urls: urlDatabase,
    user: users[req.cookies["userKey"]]
  };
  console.log(templateVars);
  console.log(users);
  res.render("urls_register", templateVars);
});

// User Login page
// app.get("/login", (req, res) => {
//   let templateVars = {
//     userKey: req.cookies["userKey"],
//     urls: urlDatabase };
//   res.render("/urls", templateVars);
// });

// Type in long URL to creat new short URL
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["userKey"],
    user: users[req.cookies["userKey"]]
  };
  res.render("urls_new", templateVars);
});

// GO to page for shortURL
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    username: req.cookies["userKey"],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["userKey"]]
  };
  res.render("urls_show", templateVars);
});

// Generate random unique key for shortURL
app.post("/urls", (req, res) => {
  let urlKey = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  // console.log(urlKey);
  // console.log(req.body);  // debug statement to see POST parameters
  urlDatabase[urlKey] = req.body['longURL'];
  console.log(urlDatabase);
  res.redirect("http://localhost:8080/urls/" + urlKey); // Respond with 'Ok' (we will replace this)
});

// User registration
app.post("/register", (req, res) => {
  let userKey = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
   // Check if user email already exists in database
  for (let userID in users) {
    if (users.hasOwnProperty(userID)) {
      if (users[userID].email === req.body.email) {
        res.sendStatus(400); //add specific message
      return;
      }
    };
  }
  // Check if email or password is left blank. Else add new user.
  if (req.body.email == '') {
    res.sendStatus(400); //add error message
    return;
  } else if (req.body.password === '') {
    res.sendStatus(400); //add error message
    return;
  } else {
    users[userKey] = {id: userKey, email: req.body.email, password: req.body.password}
    res.cookie("userKey", userKey);
    res.redirect("/urls", 302);
  }
});

// Redirect from shortURL to longURL
app.get("/u/:shortURL", (req, res) => {
  // let shortURL = req.params.id;
  // console.log("shortURL "+req.params.shortURL);
  let longURL = urlDatabase[req.params.shortURL];
  // console.log("longURL  "+longURL);
  res.redirect(longURL);
});

// Delete URL
app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// Update the long URL
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL
  res.redirect("/urls");
});

// Allow user to add username
app.post("/login", (req ,res) => {
  let userEmail = req.body.email;
  res.cookie("email", userEmail);
  // console.log(username);
  res.redirect("/urls");
});

// Allow user to logout & clear username. Redirect to /urls where they may input new username
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

// Generate random 6 character string for short URL
function generateRandomString(length, chars) {
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

// function findUser (email, password) {
//   return users.find((user) => user.email == email && user.password == password);
// };