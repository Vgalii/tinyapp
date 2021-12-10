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
}
///Helper functions
function generateRandomString () {
  const result = Math.random().toString(36).substring(2,8);
  return result;
}
const confirmUser = (key, value) => {
  for (let user in users) {
    
    if (users[user][key] === value) {
      return users[user].id;
    }
  }
  return false;
}
const checkByCookie = function(req) {
  const user_id = req.cookies.user_id;
  let userObject = users[user_id];
  return userObject;
}
const checkURLByUser = function(user_id, urlDatabase) {
  let urlObject = {};
  for (let shortURL in urlDatabase) {
  
    if ( urlDatabase[shortURL].user_id === user_id) {
      urlObject[shortURL] = urlDatabase[shortURL];
    }
  }
  return urlObject;
}
app.get("/", (req, res) => {
  // const user_id = req.cookies.user_id;
  // const templateVars = { "user_id": user_id, user: users[user_id], urls: urlDatabase };
  const user = checkByCookie(req);
  if (user) {
    const userURLs = checkURLByUser(user_id, urlDatabase);
    const templateVars = {userURLs, user};
    res.render("urls_index", templateVars);
  }
  res.redirect(400, "/login")
});
app.post("/", (req, res) => {
  const user_id = req.cookies.user_id;
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL, user_id}

  res.redirect(`urls/${shortURL}`)
})

// login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = confirmUser('password', password);
  const id = confirmUser('email', email);
  if (id && confirmPassword) {
    res.cookie('user_id', id);
    res.redirect('/urls');
  } else {
    res.redirect(403, '/login');
  }
})

app.get("/login", (req, res) => {
  
  const user_id = req.cookies.user_id;
  const templateVars = {"user_id": user_id, user: users[user_id]};
  res.render("login", templateVars);
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
  const confirmEmail = confirmUser('email', email);

  if (!email || !password) {
    res.redirect(401, '/register');
  } else if (confirmEmail) {
    res.redirect(401, '/register');
  } else {
    users[id] = {id, email, password};
    res.cookie('user_id', id);
    res.redirect('/urls');
  }
})
app.get("/urls", (req, res) => {
  
  const user_id = req.cookies.user_id;
  const userURLs = checkURLByUser(user_id, urlDatabase);
  
  const templateVars = { "user_id": user_id, user: users[user_id], userURLs: userURLs};
  console.log("user urls   ",  userURLs);
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  // const user_id = req.cookies.user_id;
  const user = checkByCookie(req);


  if (user) {
    // const templateVars = {"user_id": user_id, user: users[user_id] };
    const templateVars = {user};
    res.render("urls_new", templateVars);
    return;
  }
  res.redirect(403, "/login")
  
});
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  const user_id = req.cookies.user_id;
  urlDatabase[shortURL] = {longURL: longURL, user_id: user_id};
  console.log("###", urlDatabase)
  console.log("4444", urlDatabase[shortURL])
  res.redirect(`/urls/${shortURL}`);
});
app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = checkByCookie(req);
  const userURLs = checkURLByUser(user_id, urlDatabase);

  if(user) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[user]};
    res.render("urls_show", templateVars);
    return;
  }
  res.redirect(403, "/login")
});
app.post("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies.user_id;
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {longURL, user_id}
  res.redirect("/urls")
})
app.get("/urls.json", (req, res) => {
  res.json(users);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.post("/urls/:shortURL/edit", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = checkByCookie(req);
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const userURLs = checkURLByUser(user_id, urlDatabase);

  if (user) {
    if (userURLs[shortURL]){
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
  
})
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(`http://${longURL["longURL"]}`);
});
app.post("/urls/:shortURL/delete", (req, res) => {
  // delete urlDatabase[req.params.shortURL];
  // res.redirect("/urls");
  const user_id = req.cookies.user_id;
  const user = checkByCookie(req);
  const shortURL = req.params.shortURL;
  const userURLs = checkURLByUser(user_id, urlDatabase);
  if (user) {
    
    if (userURLs[shortURL]){
      delete urlDatabase[shortURL];
      res.redirect("/urls");
      return;
    } else {
      res.redirect(403, "/login");
      return;
    }
  } else {
    res.redirect(403, "/login");
    return;
  }
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});