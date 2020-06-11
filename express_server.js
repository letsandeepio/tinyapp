const express = require('express');
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const {
  generateRandomString,
  getUserByID,
  addUserToDB,
  isEmailRegistered,
  getHashedPassword,
  getUserIDByEmail,
  urlsForUser,
  updateURL
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
  //console.log(urlsForUser(users, ID));
  const templateVars = {
    urls: urlsForUser(urlDatabase, ID),
    user: getUserByID(users, ID)
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const ID = req.cookies['user_id'];
  res.render('urls_new', { user: getUserByID(users, ID) });
});

app.get('/urls/:url', (req, res) => {
  const ID = req.cookies['user_id'];
  const shortURL = req.params.url;
  if (urlDatabase[shortURL].userID === ID) {
    const templateVars = {
      longURL: urlDatabase[req.params.url].longURL,
      shortURL: req.params.url,
      user: getUserByID(users, ID)
    };
    res.render('urls_show', templateVars);
  } else {
    res.status(400).send('Bad request');
  }
});

const addURLtoDB = (db, longURL, shortURL, userID) => {
  db[shortURL] = { longURL, userID };
  //console.log(db);
};

app.post('/urls', (req, res) => {
  const ID = req.cookies['user_id'];
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6);
  addURLtoDB(urlDatabase, longURL, shortURL, ID);
  res.redirect(`/urls/${shortURL}`);
});

app.get('/u/:shortURL', (req, res) => {
  //console.log(JSON.stringify(req.params.shortURL));
  //console.log(JSON.stringify(urlDatabase));
  //console.log(urlDatabase[req.params.shortURL].longURL);

  const shortURLObject = urlDatabase[req.params.shortURL];
  if (!shortURLObject) {
    res.status(404).send('Not found');
  } else {
    const longURL = shortURLObject.longURL;
    // res.send('redirecting to ' + longURL);
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
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    res.status(400).send('Please provide valid credentials.');
  } else if (isEmailRegistered(users, email)) {
    res.status(400).send('A user already exists with that email.');
  } else {
    const userID = 'user' + generateRandomString(6);
    addUserToDB(users, userID, email, hashedPassword);
    res.cookie('user_id', userID);
    res.redirect(`/urls`);
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const ID = req.cookies['user_id'];
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === ID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  } else {
    res.status(400).send('Bad request');
  }
});

app.post('/urls/:shortURL', (req, res) => {
  const ID = req.cookies['user_id'];
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === ID) {
    const newURL = req.body.newURL;
    updateURL(urlDatabase, shortURL, newURL);
    res.redirect(`/urls`);
  } else {
    res.status(400).send('Bad request');
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send('Please provide valid credentials.');
  } else if (!isEmailRegistered(users, email)) {
    res.status(403).send('User does not exist.');
  } else if (bcrypt.compareSync(password, getHashedPassword(users, email))) {
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

app.get('/users', (req, res) => {
  res.send(JSON.stringify(users));
});
