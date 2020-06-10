const express = require('express');
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const {
  generateRandomString,
  getUserByID,
  addUserToDB,
  isEmailRegistered,
  validateUser,
  getUserIDByEmail
} = require('./helpers');

const { users, urlDatabase } = require('./stores');

const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(morgan('tiny'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`magic port is ${PORT}!`);
});

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const ID = req.cookies['user_id'];
  const templateVars = { urls: urlDatabase, user: getUserByID(users, ID) };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const ID = req.cookies['user_id'];
  res.render('urls_new', { user: getUserByID(users, ID) });
});

app.get('/urls/:url', (req, res) => {
  const ID = req.cookies['user_id'];
  const templateVars = {
    longURL: urlDatabase[req.params.url],
    shortURL: req.params.url,
    user: getUserByID(users, ID)
  };
  res.render('urls_show', templateVars);
});

app.post('/urls', (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString(6);
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if (!longURL) {
    res.status(404).send('Not found');
  } else {
    res.redirect(longURL);
  }
});

app.get('/register', (req, res) => {
  const ID = req.cookies['user_id'];
  const templateVars = { user: getUserByID(users, ID) };

  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send('Please provide valid credentials.');
  } else if (isEmailRegistered(users, email)) {
    res.status(400).send('A user already exists with that email.');
  } else {
    const userID = 'user' + generateRandomString(6);
    addUserToDB(users, userID, email, password);
    res.cookie('user_id', userID);
    res.redirect(`/urls`);
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newURL;
  res.redirect(`/urls`);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send('Please provide valid credentials.');
  } else if (!isEmailRegistered(email)) {
    res.status(403).send('User does not exist.');
  } else if (validateUser(users, email, password)) {
    const userID = getUserIDByEmail(users, email);
    res.cookie('user_id', userID);
    res.redirect(`/urls`);
  } else {
    res.status(403).send('Password and email do not match.');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const ID = req.cookies['user_id'];
  const templateVars = { user: getUserByID(users, ID) };
  res.render('login', templateVars);
});
