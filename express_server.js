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
  addURLtoDB,
  getStats,
  logVisit,
  addURLtoLogDB,
  formatDate
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
app.use(express.static('public'));

let userIDMiddleWare = (req, res, next) => {
  req.userID = req.session.user_id;
  next();
};

app.use(userIDMiddleWare);

app.listen(PORT, () => {
  console.log(`magic port is ${PORT}!`);
});

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlsForUser(urlDatabase, req.userID, logDB),
    user: getUserByID(users, req.userID)
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new', { user: getUserByID(users, req.userID) });
});

app.get('/urls/:url', (req, res) => {
  const ID = req.userID;
  const shortURL = req.params.url;

  if (urlDatabase[shortURL] && urlDatabase[shortURL].userID === ID) {
    const allVisitsData = logDB[shortURL];
    const { count, uniqueCount } = getStats(allVisitsData);

    const templateVars = {
      longURL: urlDatabase[shortURL].longURL,
      shortURL: shortURL,
      user: getUserByID(users, ID),
      visits: allVisitsData,
      count: count,
      uniqueCount: uniqueCount
    };

    res.render('urls_show', templateVars);
  } else {
    res.status(400).render('error', {
      error: '400 -  Bad Request.',
      user: undefined
    });
  }
});

app.post('/urls', (req, res) => {
  if (req.userID) {
    const longURL = req.body.longURL;
    const shortURL = generateRandomString(6);
    addURLtoDB(
      urlDatabase,
      longURL,
      shortURL,
      req.userID,
      formatDate(new Date())
    );
    addURLtoLogDB(logDB, shortURL);
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(400).render('error', {
      error: '400 -  Bad Request.',
      user: undefined
    });
  }
});

app.get('/u/:shortURL', (req, res) => {
  const shortURLObject = urlDatabase[req.params.shortURL];

  if (!shortURLObject) {
    res.status(404).render('error', {
      error: '404 -  Not Found',
      user: undefined
    });
  } else {
    let visitorID = req.session.visitor_id;
    if (!visitorID) {
      visitorID = generateRandomString(3) + '_' + generateRandomString(3);
      req.session.visitor_id = visitorID;
    }
    const shortURL = req.params.shortURL;
    const longURL = shortURLObject.longURL;
    logVisit(visitorID, shortURL, logDB);
    res.redirect(longURL);
  }
});

app.get('/register', (req, res) => {
  const templateVars = { user: getUserByID(users, req.userID) };

  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    res.status(400).render('error', {
      error: '400 -  Please provide valid credentials..',
      user: undefined
    });
  } else if (isEmailRegistered(users, email)) {
    res.status(400).render('error', {
      error: '400 -  A user already exists with that email.',
      user: undefined
    });
  } else {
    const userID = 'user' + generateRandomString(6);
    addUserToDB(users, userID, email, hashedPassword);
    req.session.user_id = userID;
    res.redirect(`/urls`);
  }
});

app.delete('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === req.userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  } else {
    res.status(400).render('error', {
      error: '400 -  Bad Request.',
      user: undefined
    });
  }
});

app.put('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === req.userID) {
    const newURL = req.body.newURL;
    updateURL(urlDatabase, shortURL, newURL);
    res.redirect(`/urls`);
  } else {
    res.status(400).render('error', {
      error: '400 -  Bad Request.',
      user: undefined
    });
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).render('error', {
      error: '400. Please provide valid credentials.',
      user: undefined
    });
  } else if (!isEmailRegistered(users, email)) {
    res.status(403).render('error', {
      error: '403. User does not exist.',
      user: undefined
    });
  } else if (bcrypt.compareSync(password, getHashedPassword(users, email))) {
    const userID = getUserIDByEmail(users, email);
    req.session.user_id = userID;
    res.redirect(`/urls`);
  } else {
    res.status(403).render('error', {
      error: 'Password and email do not match.',
      user: undefined
    });
  }
});

app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const templateVars = { user: getUserByID(users, req.userID) };
  res.render('login', templateVars);
});

app.get('/about', (req, res) => {
  const templateVars = { user: getUserByID(users, req.userID) };
  res.render('about', templateVars);
});

app.get('/users', (req, res) => {
  res.send(JSON.stringify(users));
});

app.get('/databaseofurl', (req, res) => {
  res.send(JSON.stringify(urlDatabase));
});

app.get('/databaseoflog', (req, res) => {
  res.send(JSON.stringify(logDB));
});
