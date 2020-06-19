const express = require('express');
const morgan = require('morgan');
const exhbs = require('express-handlebars');
const path = require('path');
const cooKieParser = require('cookie-parser');
const session = require('express-session');


// Initialization
const app = express();

// Settings
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exhbs({
    defaultLayout: 'main',
    extname: '.hbs'
}));
app.set('view engine', '.hbs');


// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(cooKieParser())
app.use(session({
    secret: 'Quaker',
    resave: false,
    saveUninitialized: true
}))

// Routes
app.use(require('./routes/index.js'));

// Static Files
app.use(express.static(path.join(__dirname, 'public')))

// Exporting
// module.exports = boot;
module.exports = app;