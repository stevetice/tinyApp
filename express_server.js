const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bcrypt = require('bcrypt');

// Set view engine
app.set("view engine", "ejs");

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const cookieSession = require("cookie-session");
app.use(cookieSession({
  name: 'session',
  keys: ['n98ysdf76g4uhbt'],
}));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2" : {
    id: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK" : {
    id: "9sm5xK",
    longURL: "http://www.google.com",
    userID: "testUserID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("asd", 10)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("funk", 10)
  },
  "testUserID": {
    id: "testUserID",
    email: "test@example.com",
    password: bcrypt.hashSync("asd", 10)
  }
};

// Listening on port...
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// List long and short URLs
app.get("/urls", (req, res) => {
  let user = findLoggedInUser(req.cookies.userKey);
  if (!user) {
    res.redirect("login");
    return;
  }
  let templateVars = {
    username: req.cookies["userKey"],
    urls: urlsForUser(user.id),
    user: user
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

  res.render("urls_register", templateVars);
});

// User Login page
app.get("/login", (req, res) => {
  let templateVars = {
    username: req.cookies["userKey"],
    urls: urlDatabase,
    user: users[req.cookies["userKey"]]
  };
  res.render("urls_login", templateVars);
});

// Type in long URL to creat new short URL
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["userKey"],
    user: users[req.cookies["userKey"]]
  };
  let user = findLoggedInUser(req.cookies.userKey);
    if (user) {
      res.render("urls_new", templateVars);
    } else {
      res.redirect("/login");
    }
});

// GO to page for shortURL
app.get("/urls/:id", (req, res) => {
  let user = findLoggedInUser(req.cookies.userKey);
  if (!user) {
      res.sendStatus(403);
      return;
  }
  let shortURL = req.params.id;
  let longURL = urlDatabase[shortURL].longURL
  let templateVars = {
    username: req.cookies["userKey"],
    shortURL: shortURL,
    longURL: longURL,
    user: users[req.cookies["userKey"]]
  };

  if (user.id === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = longURL
    res.render("urls_show", templateVars);
  } else {
    res.sendStatus(403);
  }
});

// Generate random unique key for shortURL
app.post("/urls", (req, res) => {
  let urlKey = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  // console.log(urlKey);
  // console.log(req.body);  // debug statement to see POST parameters
  urlDatabase[urlKey] = {id: urlKey, longURL: req.body['longURL'], userID: req.cookies.userKey}
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
      };
    };
  };
  // Check if email or password is left blank. Else add new user.
  if (req.body.email == '') {
    res.sendStatus(400); //add error message
    return;
  } else if (req.body.password === '') {
    res.sendStatus(400); //add error message
    return;
  } else {
    let hashedPassword = bcrypt.hashSync(req.body.password, 10)
    users[userKey] = {id: userKey, email: req.body.email, password: hashedPassword}
    res.cookie("userKey", userKey);
    res.redirect("/urls", 302);
  };
});

// Redirect from shortURL to longURL
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  console.log(shortURL);
  // console.log("shortURL "+req.params.shortURL);
  let longURL = urlDatabase[shortURL].longURL;
  // console.log("longURL  "+longURL);
  console.log(urlDatabase);
  res.redirect(longURL);
});

// Delete URL
app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id;
  let longURL= urlDatabase[shortURL].longURL
  let user = findLoggedInUser(req.cookies.userKey);
    if (user.id === urlDatabase[shortURL].userID) {
      delete urlDatabase[shortURL];
      res.redirect("/urls");
    } else {
      res.sendStatus(403);
    }

});

// Update the long URL
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = req.body.longURL
  let user = findLoggedInUser(req.cookies.userKey);
    if (user.id !== urlDatabase[shortURL].userID) {
      res.sendStatus(403);
    } else {
      urlDatabase[shortURL].longURL = longURL
    }
  res.redirect("/urls");
});

// Allow user to add username
app.post("/login", (req ,res) => {
  let userEmail = req.body.email;
  let user = findUser(req.body.email, req.body.password);
  console.log(user)
  if (user === 'User not found') {
    res.sendStatus(403);
  } else if (user === 'Password incorrect') {
    res.sendStatus(403);
  } else {
    res.cookie("userKey", user.id);
    res.redirect("/urls", 302);
    console.log(users);
  }
});

// Allow user to logout & clear username. Redirect to /urls where they may input new username
app.post("/logout", (req, res) => {
  res.clearCookie("userKey");
  res.redirect("/urls");
});

// Generate random 6 character string for short URL
function generateRandomString(length, chars) {
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

// Check if user email exists and password is correct
function findUser (email, password) {
  let result = '';
  for (let userID in users) {
    // if (users.hasOwnProperty(userID)) {
      if (users[userID].email === email) {
        if (bcrypt.compareSync(password, users[userID].password)) {
          result = users[userID];
          return result;
        } else {
          result = "Password incorrect";
        }
      } else {
        result = "User not found";
      }
  // };
  };
  return result;
}


// Find logged in user and return
function findLoggedInUser (cookie) {
  let foundUser;
  for (let userID in users) {
    if (users[userID].id === cookie) {
      foundUser = users[userID];
    }
  }
  return foundUser;
}

function urlsForUser(id) {
  let visibleURLS = {}
  for (let urlID in urlDatabase) {
    if (urlDatabase[urlID].userID === id)
      visibleURLS[urlID] = urlDatabase[urlID];
    }
  return visibleURLS;
  }