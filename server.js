//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    fs      = require('fs'),
    urls    = require('url'),
    util    = require('util'),
    https   = require('https'),
    morgan  = require('morgan');
    
var message = '';
var timer = 0;
var style;
var script;
var path = 'public/';
var ipfile = 'iplist.json';
var iplist = {};

Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

////////////////////////////////////////////////////////////////////////
// Get endpoints
////////////////////////////////////////////////////////////////////////
app.get('/updateip', function(req, res) {
  var params = urls.parse(req.url, true).query;

  iplist[params['machine']] = [params['ip'], params['time']];
  res.send('Saved.\n');
  fs.writeFileSync(path + 'iplist.json', JSON.stringify(iplist));
};

app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  // if (!db) {
  //   initDb(function(err){});
  // }
  // if (db) {
  //   var col = db.collection('counts');
  //   // Create a document with request IP and current time of request
  //   col.insert({ip: req.ip, date: Date.now()});
  //   col.count(function(err, count){
  //     res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
  //   });
  // } else {
  //   res.render('index.html', { pageCountMessage : null});
  // }
  res.send('<html><head></head><body><h1>welcome, klau!</h1></body></html>')
});

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  // if (!db) {
  //   initDb(function(err){});
  // }
  // if (db) {
  //   db.collection('counts').count(function(err, count ){
  //     res.send('{ pageCount: ' + count + '}');
  //   });
  // } else {
  //   res.send('{ pageCount: -1 }');
  // }
  res.send('<html><head></head><body><h1>test</h1></body></html>')
});

////////////////////////////////////////////////////////////////////////
// Post endpoints
////////////////////////////////////////////////////////////////////////
// app.post('/upload', function(req, res) {
//   fs.createReadStream(req.files.file.path).pipe(fs.createWriteStream(path + req.files.file.originalFilename));
//   res.redirect('/');
// });

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;