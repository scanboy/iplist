//  OpenShift sample Node application
var express       = require('express'),
    app           = express(),
    fs            = require('fs'),
    urls          = require('url'),
    util          = require('util'),
    https         = require('https'),
    bodyParser    = require('body-parser'),
    cookieParser  = require('cookie-parser'),
    cookieSession = require('cookie-session'),
    multipart     = require('connect-multiparty'),
    bcrypt        = require('bcrypt'),
    morgan        = require('morgan');

var multipartMiddleware = multipart();

var message = '';
var timer = 0;
var style;
var script;
var path = 'public/';
var ipfile = 'iplist.json';
var pwfile = 'password.json';
var iplist = {};

Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(cookieParser('sbellfanmossall'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 1000 * 60 * 5
//  maxAge: 1000 * 5
  }));

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

////////////////////////////////////////////////////////////////////////
// Read all info from files.
////////////////////////////////////////////////////////////////////////
var readInfo = function() {
  try {
    fs.mkdirSync(path);
  } catch (err) {}
  try {
    iplist = JSON.parse(fs.readFileSync(ipfile).toString());
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
  if (!req.session.user) {
    message = 'Session timed out. Please login again.';
    timer = 0;
    res.send(basePage() + loginPage());
  } else {
    req.session.user = "klau";
//    req.session.maxAge = 1000 * 60 * 5;
    res.send(basePage() + accessPage());
  }
});

app.post('/login', function(req, res) {
  try {
    var auth = JSON.parse(fs.readFileSync(pwfile).toString());
    // var hash = bcrypt.hashSync(req.body.pwd, 10);
    // fs.writeFileSync('test.json', hash);

    if (req.body.user == auth["username"] && bcrypt.compareSync(req.body.pwd, auth["password"])) {
      req.session.user = "klau";
      message = '';
      timer = 1;
    } else {
      message = "Invalid username/password!";
      timer = 0;
    }
  } catch (err) {
    message = "Username/password info not found!";
    timer = 0;
  }
  res.redirect('/');
});

app.get('/updateip', function(req, res) {
  var params = urls.parse(req.url, true).query;

  iplist[params['machine']] = [params['ip'], params['time']];
  res.send('Saved.\n');
  fs.writeFileSync('iplist.json', JSON.stringify(iplist));
});

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

app.post('/upload', multipartMiddleware, function(req, res) {
  fs.createReadStream(req.files.file.path).pipe(fs.createWriteStream(path + req.files.file.originalFilename));
  res.redirect('/');
});

readInfo();

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;