const app = require('./app');

app.listen(app.get('port'));
console.log('Server Listening on port', app.get('port'));