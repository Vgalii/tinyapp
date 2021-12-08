const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});
// login
app.post("/login", (req, res) => {
  
  res.cookie("username", req.body["username"]);
  res.redirect("/urls");
  console.log(username)
})
// logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
})
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const templateVars = {username: null}
  res.render("urls_new", templateVars);
});
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  
  urlDatabase[shortURL] = longURL;
  
  res.redirect(`/urls/${shortURL}`);
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
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