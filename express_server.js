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

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// List long and short URLs
app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// User registration page
app.get("/register", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase };
  res.render("urls_register", templateVars);
});


// Type in long URL to creat new short URL
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});


app.get("/urls/:id", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
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

// User register
app.post("/register", (req, res) => {
  let templateVars =
  // let userKey = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  console.log(userKey);
  let userEmail = req.body.userEmail;
  let userPass = req.body.userPass;
  console.log(userEmail);
  console.log(userPass);

  // let templateVars = {
  //   username: req.cookies["username"],
  //   urls: urlDatabase };
  res.render("/urls", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // let shortURL = req.params.id;
  console.log("shortURL "+req.params.shortURL);
  let longURL = urlDatabase[req.params.shortURL];
  console.log("longURL  "+longURL);
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
  let username = req.body.username;
  res.cookie("username", username);
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
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}
