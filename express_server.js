const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

const generateRandomString = (n) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUXYZ';
  let random = '';
  while (random.length < n) {
    randomAlpha = alphabet[Math.floor(Math.random() * alphabet.length)];
    random += Math.round(Math.random())
      ? randomAlpha
      : randomAlpha.toLowerCase();
  }
  return random;
};

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.listen(PORT, () => {
  console.log(`magic port is ${PORT}!`);
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:url', (req, res) => {
  let templateVars = {
    longURL: urlDatabase[req.params.url],
    shortURL: req.params.url
  };

  res.render('urls_show', templateVars);
});

app.post('/urls', (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send('Ok'); // Respond with 'Ok' (we will replace this)
});
