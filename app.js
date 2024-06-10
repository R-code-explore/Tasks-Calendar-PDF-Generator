const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/', require('./routes/index'));

app.listen(port, () => {
    console.log(`App running at http://localhost:${port}`);
});