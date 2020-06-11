const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');

const {
  generateRandomString,
  getUserByID,
  addUserToDB,
  isEmailRegistered,
  getHashedPassword,
  getUserIDByEmail,
  urlsForUser,
  updateURL,
  addURLtoDB
} = require('./helpers');

const { users, urlDatabase, logDB } = require('./stores');

const PORT = 8080;

app.set('view engine', 'ejs');
app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: 'session',
    keys: ['secretkey', 'secretkey2']
  })
);
app.use(methodOverride('_method'));

app.listen(PORT, () => {
  console.log(`magic port is ${PORT}!`);
});

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const ID = req.session.user_id;
  //console.log(urlsForUser(users, ID));
  const templateVars = {
    urls: urlsForUser(urlDatabase, ID),
    user: getUserByID(users, ID)
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const ID = req.session.user_id;
  res.render('urls_new', { user: getUserByID(users, ID) });
});

app.get('/urls/:url', (req, res) => {
  const ID = req.session.user_id;
  const shortURL = req.params.url;

  if (urlDatabase[shortURL] && urlDatabase[shortURL].userID === ID) {
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

app.post('/urls', (req, res) => {
  const ID = req.session.user_id;
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6);
  addURLtoDB(urlDatabase, longURL, shortURL, ID);
  res.redirect(`/urls/${shortURL}`);
});

const logVisit = (visitorID, shortURL, logDatabase) => {
  if (!logDatabase[shortURL]) logDatabase[shortURL] = [];
  logDatabase[shortURL].push({
    timestamp: new Date(),
    visitor_id: visitorID
  });
  console.log(logDatabase);
};

app.get('/u/:shortURL', (req, res) => {
  const shortURLObject = urlDatabase[req.params.shortURL];

  if (!shortURLObject) {
    res.status(404).send('Not found');
  } else {
    let visitorID = req.session.visitor_id;
    if (!visitorID) {
      visitorID = generateRandomString(3) + '_' + generateRandomString(3);
      req.session.visitor_id = visitorID;
    }
    const shortURL = req.params.shortURL;
    logVisit(visitorID, shortURL, logDB);
    const longURL = shortURLObject.longURL;
    // res.send('redirecting to ' + longURL);
    res.redirect(longURL);
  }
});

app.get('/register', (req, res) => {
  const ID = req.session.user_id;
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
    req.session.user_id = userID;
    res.redirect(`/urls`);
  }
});

app.delete('/urls/:shortURL/delete', (req, res) => {
  const ID = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === ID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  } else {
    res.status(400).send('Bad request');
  }
});

app.put('/urls/:shortURL', (req, res) => {
  const ID = req.session.user_id;
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
    req.session.user_id = userID;
    res.redirect(`/urls`);
  } else {
    res.status(403).send('Password and email do not match.');
  }
});

app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const ID = req.session.user_id;
  const templateVars = { user: getUserByID(users, ID) };
  res.render('login', templateVars);
});

app.get('/users', (req, res) => {
  res.send(JSON.stringify(users));
});
