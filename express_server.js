const express = require("express");
const app = express();
const PORT = 8080;

const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");

app.use(cookieSession({
  name: 'session',
  keys: ["key1", "key2"],
}));

app.set("view engine", "ejs");


app.use(bodyParser.urlencoded({extended: true}));

//Database

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", user_id:"aJ48lW"},
  "9sm5xK": {longURL: "http://www.google.com", user_id:"3ik5g3"}
};
const users = {
  "3ik5g3": {
    id: "3ik5g3",
    email: "bob@gmail.com",
    password: "bobbob"
  },
  "34rt34": {
    id: "34rt34",
    email: "peter@gmail.com",
    password: "peterpeter"
  }
};

///Helper functions

const { getUserByEmail } = require('./helpers');
function generateRandomString() {
  const result = Math.random().toString(36).substring(2,8);
  return result;
}
const checkByCookie = function(req) {

  const user_id = req.session.user_id;
  const userObject = users[user_id];
  return userObject;
};
const checkURLByUser = function(user_id, urlDatabase) {
  const urlObject = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].user_id === user_id) {
      urlObject[shortURL] = urlDatabase[shortURL];
    }
  }
  return urlObject;
};
//ROUTS
// redirects the existing user to /urls, or to /login if he/she is not logged in
app.get("/", (req, res) => {
  const user_id = req.session.user_id;
  res.clearCookie(user_id)
  const user = checkByCookie(req);
  if (user) {
    const userURLs = checkURLByUser(user_id, urlDatabase);
    const templateVars = {userURLs, user};
    return res.render("urls_index", templateVars);
    
  }
  res.redirect("/login");
});
app.post("/", (req, res) => {
  
  const user_id = req.session.user_id;
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL, user_id};

  res.redirect(`urls/${shortURL}`);
});

// login
app.post("/login", (req, res) => {
  const email = req.body.email; // gets the user's info from req.body
  const password = req.body.password;
 
  const user = getUserByEmail(email, users); // verifies the user
  if (!email || !password) {
    res.redirect(401, '/login');
  } else if (user) {
    const id  = user.id;
    const hashedPassword = users[id].password;
    if (bcrypt.compareSync(password, hashedPassword)) {
      
      req.session.user_id = id;
      res.redirect('/urls'); // redirects the existing user to /urls
    } else {
      res.redirect(403, '/login');
    }
  } else {
    res.redirect(403, '/login');
  }

});

app.get("/login", (req, res) => {
  
  
  const user_id = req.session.user_id;
  const user = users[user_id]
  const templateVars = {"user_id": user_id, user: user};
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});
// logout
// logs the user out and redirects to the login page
app.post("/logout", (req, res) => {
  
  req.session = null;
  res.redirect("/login");
});

// register
// renders the register form if the user is not in DB
app.get("/register", (req, res) => {
  
  const user_id = req.session.user_id;
  const user = users[user_id]
  const templateVars = {"user_id": user_id, user: user};
  if(user) {
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
  }
  
});

//creates a new user in DB if he/she is not registered yet
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const confirmEmail = getUserByEmail(email, users);

  if (!email || !password) {
    res.redirect(401, '/register');
  } else if (confirmEmail) {
    res.send("403 - Sorry, you are already registered!");
  } else {
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[id] = {id, email, password: hashedPassword};
    
    req.session.user_id = id;
    res.redirect('/urls');
  }
});
// URLs
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const userURLs = checkURLByUser(user_id, urlDatabase);
  const user = users[user_id];
  const templateVars = { "user_id": user_id, user: user, userURLs: userURLs};
  
  if (user) {
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});
app.get("/urls/new", (req, res) => {
  
  const user = checkByCookie(req);
  if (user) {
  
    const templateVars = {user};
    res.render("urls_new", templateVars);
    return;
  }
  res.redirect("/login");
  
});
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const user_id = req.session.user_id;
  urlDatabase[shortURL] = {longURL: longURL, user_id: user_id};
  
  res.redirect(`/urls/${shortURL}`);
});

//renders /urls_show if the user is logged in and owns the url
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.session.user_id;
  const user = checkByCookie(req);
  const userURLs = checkURLByUser(user_id, urlDatabase);

  if (user) {
    if (urlDatabase[shortURL]) {
      if (userURLs[shortURL]) {
        const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[user]};
        res.render("urls_show", templateVars);
        return;
      } else { 
        // res.redirect(403, "/login");
        res.send("Sorry, you do not own this URL.")
        return;
      }
    } else {
      // res.redirect(403, "/login");
      res.send("Sorry, you do not own this URL.")
      return;
    }
  }
  // res.redirect(403, "/login");
  res.send("Sorry, you do not own this URL.")
  return;
});
app.post("/urls/:shortURL", (req, res) => {
  
  const user_id = req.session.user_id;
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {longURL, user_id};
  res.redirect("/urls");
});
app.get("/urls.json", (req, res) => {
  res.json(users);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  
  const user_id = req.session.user_id;
  const user = checkByCookie(req);
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const userURLs = checkURLByUser(user_id, urlDatabase);

  if (user) {
    if (userURLs[shortURL]) {
      urlDatabase[shortURL].longURL = longURL;
      res.redirect("/urls/");
      return;
    } else {
      res.redirect(403, "/login");
      return;
    }
    
  } else {
    res.redirect(403, "/login");
    return;
  }
  
});
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//deletes the url if the user is logged in and owns it
app.post("/urls/:shortURL/delete", (req, res) => {
  
  const user_id = req.session.user_id;
  const user = checkByCookie(req);
  const shortURL = req.params.shortURL;
  const userURLs = checkURLByUser(user_id, urlDatabase);
  if (user) {
    
    if (userURLs[shortURL]) {
      delete urlDatabase[shortURL];
      res.redirect("/urls");
      return;
    } else {
      res.redirect(403, "/login");  
      return;
    }
  } else {        // if not a registered user => error message
    res.redirect(403, "/login");
    return;
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});