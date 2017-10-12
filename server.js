//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    fs      = require('fs'),
    urls    = require('url'),
    util    = require('util'),
    https   = require('https'),
    morgan  = require('morgan');
    
var message = '';
//var timer = 0;
var style;
var script;
var path = 'public/';
var ipfile = 'iplist.json';
var pwfile = 'password.json';
var iplist = {};

global.timer = 0;

Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

////////////////////////////////////////////////////////////////////////
// Read all info from files.
////////////////////////////////////////////////////////////////////////
var readInfo = function() {
  try {
    iplist = JSON.parse(fs.readFileSync(path + ipfile).toString());
  } catch (err) {}
  try {
      style = '<style>' + fs.readFileSync('css/index.css').toString() + '</style>';
  } catch (err) {}
  try {
      script = '<script>' + fs.readFileSync('js/index.js').toString() + '</script>';
  } catch (err) {}
};


////////////////////////////////////////////////////////////////////////
// Buile main page
////////////////////////////////////////////////////////////////////////
var basePage = function() {
  var page;
  
  page = '<html><head>' + style + script + '</head><body onload="init(' + timer + ')"><h3>IP list:</h3><table border="1"><tr><th>Machine</th><th>IP</th><th>Last Update</th></tr>';
      
  // IP list  
  Object.keys(iplist).sort().forEach(function (k) {
    page += '<tr><td>' + k + '</td><td>' + iplist[k][0] + '</td><td>' + iplist[k][1] + '</td></tr><tr>';
  });
  page += '</table><br/><hr/>';
  return(page);
};

var loginPage = function() {
  var page;
  
  page = '<table style="margin-left: 0;"><tr><td><h3>Login:</h3></td><td><h3 style="color: #d60000;">&nbsp;&nbsp;' + message + '</h3></td></tr></table><form id="login" action="/login" method="post"><table><tr><td>Username</td><td>Password</td></tr><tr><td><input type="text" name="user"></td><td><input type="password" name="pwd" onkeypress="checkKeyPress(event, \'13\', enterKey);"></td><td><span onclick=\'document.getElementById("login").submit();\'>Login</span></td></tr></table></form>';
  page += '</body></html>';
  return (page);
};

var accessPage = function() {
  var page;
  var files = fs.readdirSync(path);

  //message = 'Session timed out. Please login again.';
  //timer = '';
  // File access
  page = '<h3>Files available in: <b style="color: blue;padding-left: 10px;">public/</b></h3><form id="rmlist" action="/remove" method="post"><table class="space"><tr><th>Name</th><th>Last modified</th><th>Size</th></tr><tr><th colspan="3"><hr/></th></tr>';
  for (var f in files) {
    var stats = fs.statSync(path + files[f]);

    page += '<tr><td><input type="checkbox" name="rmlist" value="' + files[f] + '" onclick="toggleSubmit(this);"><a href="' + path + files[f] + '">' + files[f] + '</a></input></td><td>' + stats['mtime'] + '</td><td align=right>' + stats ['size'] + '</td></tr>';
  }
  page += '<tr><td colspan="3"><hr/></td></tr><tr><td><span id="remove" style="background: lightgrey;" onclick="null">Remove</span></td></tr></table></form><br/><hr/>';
  
  // File upload
  page += '<h3>File upload:</h3><div class="invisible"><form id="upload" action="/upload" method="post" enctype="multipart/form-data"><input id="ifile" type="file" name="file" onchange=\'document.getElementById("upload").submit();\'/></form></div><table><tr><td><span onclick=\'document.getElementById("ifile").click();\'>Upload</span></td></tr></table>';
  page += '</body></html>';
  return(page);
};

////////////////////////////////////////////////////////////////////////
// Get endpoints
////////////////////////////////////////////////////////////////////////
app.get('/', function(req, res) {
  // try {
  //   var auth = JSON.parse(fs.readFileSync(pwfile).toString());
  //   res.send(auth["username"] + auth["password"]);
  // } catch (err) {
  //   res.send("read failed!")
  // } 
  fs.appendFile('log.txt', "/ " + global.timer + "\n");
  if (global.timer == 0) {
    message = 'Session timed out. Please login again.';
//    global.timer = 0;
    res.send(basePage() + loginPage());
  } else {
    res.send(basePage() + accessPage());
  }
});

app.post('/login', function(req, res) {
  fs.appendFile('log.txt', req.body.user + "\n");
  fs.appendFile('log.txt', req.body.pwd + "\n");
  try {
    var auth = JSON.parse(fs.readFileSync(pwfile).toString());
    if (req.body.user == auth["username"] && req.body.pwd == auth["password"]) {
      message = ''
      global.timer = 1;
      fs.appendFile('log.txt', "/login: success " + global.timer + "\n");
    } else {
//      message = JSON.stringify(auth);
      message = "Invalid username/password!";
      global.timer = 0;
      fs.appendFile('log.txt', "/login: failed " + global.timer + "\n");
    }
  } catch (err) {
//    message = JSON.stringify(auth);
    fs.appendFile('log.txt', "Error: " + err.message + "\n");
    message = "Username/password info not found!";
    global.timer = 0;
    fs.appendFile('log.txt', "/login: catch " + global.timer + "\n");
  }
  res.redirect('/');
});

app.get('/updateip', function(req, res) {
  var params = urls.parse(req.url, true).query;

  iplist[params['machine']] = [params['ip'], params['time']];
  res.send('Saved.\n');
  fs.writeFileSync(path + 'iplist.json', JSON.stringify(iplist));
});

// app.get('/', function (req, res) {
//   // try to initialize the db on every request if it's not already
//   // initialized.
//   // if (!db) {
//   //   initDb(function(err){});
//   // }
//   // if (db) {
//   //   var col = db.collection('counts');
//   //   // Create a document with request IP and current time of request
//   //   col.insert({ip: req.ip, date: Date.now()});
//   //   col.count(function(err, count){
//   //     res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
//   //   });
//   // } else {
//   //   res.render('index.html', { pageCountMessage : null});
//   // }
//   res.send('<html><head></head><body><h1>welcome, klau!</h1></body></html>')
// });

// app.get('/pagecount', function (req, res) {
//   // try to initialize the db on every request if it's not already
//   // initialized.
//   // if (!db) {
//   //   initDb(function(err){});
//   // }
//   // if (db) {
//   //   db.collection('counts').count(function(err, count ){
//   //     res.send('{ pageCount: ' + count + '}');
//   //   });
//   // } else {
//   //   res.send('{ pageCount: -1 }');
//   // }
//   res.send('<html><head></head><body><h1>test</h1></body></html>')
// });

app.get('/public/:file', function(req, res) {
  res.download(path + req.params.file);
});

app.get('/retrieve/:machine', function(req, res) {
  if (req.params.machine in iplist) {
    res.send(iplist[req.params.machine]);
  } else {
    res.send('No IP info for "' + req.params.machine + '"\n');
  }
});

app.post('/remove', function(req, res) {
  if (req.body.rmlist != undefined) {
    var list = [];
    if (typeof req.body.rmlist === 'string') {
      list.push(req.body.rmlist);
    } else {
      list = req.body.rmlist;
    }
    for (var f in list) {
      fs.unlinkSync(path + list[f]);
    }
  }
  res.redirect('/');      
});

app.post('/upload', function(req, res) {
  fs.createReadStream(req.files.file.path).pipe(fs.createWriteStream(path + req.files.file.originalFilename));
  res.redirect('/');
});

readInfo();

// Authenticator
// app.use(express.cookieParser('sbellfanmossall'));
// app.use(function(req, res, next) {
//   express.cookieSession({
//     cookie: {
//       maxAge: 1000 * 60 * 5
//     },
//   })(req, res, next);
// });

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;