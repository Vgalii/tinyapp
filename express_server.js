const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
//Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
}

app.get("/", (req, res) => {
  res.send("Hello!");
});
// login
app.post("/login", (req, res) => {
  
  res.cookie("user_id", users[user_id]);
  res.redirect("/urls");
  
})
// logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})
// register
app.get("/register", (req, res) => {
  const user_id = req.cookies.user_id;
  let templateVars = {"user_id": user_id, user: users[user_id]};
  res.render("register", templateVars)
})

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  users[id] = {
    "id": id,
    email,
    password
  };
  res.cookie("user_id", id);
  res.redirect("/urls");

})
app.get("/urls", (req, res) => {
  console.log(req.cookies.user_id)
  const user_id = req.cookies.user_id;

  const templateVars = { "user_id": user_id, user: users[user_id], urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = {"user_id": user_id, user: users[user_id] }
  res.render("urls_new", templateVars);
});
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  
  urlDatabase[shortURL] = longURL;
  
  res.redirect(`/urls/${shortURL}`);
});
app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[user_id], user_id};
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(users);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.post("/urls/:shortURL/edit", (req, res) => {
  let longURL = req.body.longURL;
  let shortUrl = req.params.shortURL;
  urlDatabase[shortUrl] = longURL;
  res.redirect("/urls/")
})
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(`http://${longURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})

function generateRandomString () {
  const result = Math.random().toString(36).substring(2,8);
  return result;
}


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});