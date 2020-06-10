const express = require('express');
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(morgan('tiny'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: '1234'
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};

const generateRandomString = (n) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUXYZ123456789';
  let random = '';
  while (random.length < n) {
    let randomAlpha = alphabet[Math.floor(Math.random() * alphabet.length)];
    random += Math.round(Math.random())
      ? randomAlpha
      : randomAlpha.toLowerCase();
  }
  return random;
};

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`magic port is ${PORT}!`);
});

const getUserByID = (ID) => {
  return users[ID];
};

app.get('/urls', (req, res) => {
  const ID = req.cookies['user_id'];
  const templateVars = { urls: urlDatabase, user: getUserByID(ID) };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const ID = req.cookies['user_id'];
  res.render('urls_new', { user: getUserByID(ID) });
});

app.get('/urls/:url', (req, res) => {
  const ID = req.cookies['user_id'];
  const templateVars = {
    longURL: urlDatabase[req.params.url],
    shortURL: req.params.url,
    user: getUserByID(ID)
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
  const templateVars = { urls: urlDatabase, user: getUserByID(ID) };

  res.render('register', templateVars);
});

const addUserToDB = (id, email, password) => {
  users[id] = {
    id,
    email,
    password
  };
};

const isEmailRegistered = (email) => {
  for (const user in users) {
    console.log(users[user].email + '===' + email);
    if (users[user].email === email) return true;
  }
  return false;
};

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send('Please provide valid credentials.');
  } else if (isEmailRegistered(email)) {
    res.status(400).send('A user already exists with that email.');
  } else {
    const userID = 'user' + generateRandomString(6);
    addUserToDB(userID, email, password);
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

const validate = (email, password) => {
  return (
    Object.values(users).find((user) => user.email === email).password ===
    password
  );
};

const getUserByEmail = (email) => {
  return Object.values(users).find((user) => user.email === email);
};

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send('Please provide valid credentials.');
  } else if (!isEmailRegistered(email)) {
    res.status(403).send('User does not exist.');
  } else if (validate(email, password)) {
    const userID = getUserByEmail(email).id;
    res.cookie('user_id', userID);
    res.redirect(`/urls`);
  } else {
    res.status(403).send('Password and email do not match.');
  }
});
//ss

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const ID = req.cookies['user_id'];
  const templateVars = { urls: urlDatabase, user: getUserByID(ID) };

  res.render('login', templateVars);
});
