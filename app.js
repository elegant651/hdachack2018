const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json());

const key = JSON.parse(fs.readFileSync('./.key', 'utf8'));

// app.use((err, req, res, next) => next());

app.use('/web', express.static(__dirname + '/web/hdac-web'));

//Nagle Algorithm off
app.use(function(req,res,next){
	req.connection.setNoDelay(true);
	if (req.url.match(/^\/(css|js|img|font|png|jpg|jpeg|gif|bmp)\/.+/)) {
	} else {
		res.header("Cache-Control", 'private, no-cache, no-store, must-revalidate');
		res.header('Expires', '0');
		res.header('Pragma', 'no-cache');
	}
	respCorsHeader(req,res);
	next();
});

function respCorsHeader(req,res) {
	// res.header("Access-Control-Allow-Origin", req.protocol+"://" + apiinfo.origin_domain);
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
	res.header("Access-Control-Allow-Credentials", true);
	return res;
}

let multichain = require('multichain-node')({
	port: key.port,
	host: key.host,
	user: key.user,
	pass: key.password
});

require('./hdacapi')(app, multichain);

const server = app.listen(3000, function(){
  console.log("Express server has started on port 3000")
});