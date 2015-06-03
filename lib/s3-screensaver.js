"use strict";

var AWS = require('aws-sdk'),
    _und = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    http = require('http'),
    bunyan = require('bunyan'),
    express = require('express'),
    exphbs  = require('express-handlebars'),
    app = express();

var maxLimit = 1000;
var config = {}, log;

// Allow node to be run with proxy passing
app.enable('trust proxy');

// Logging config
app.configure('local', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function(){
    app.use(express.errorHandler());
});


// Compression (gzip)
app.use( express.compress() );
app.use( express.methodOverride() );
app.use( express.urlencoded() );            // Needed to parse POST data sent as JSON payload
app.use( express.json() );


app.use(express.static(path.join(__dirname, 'public')));
app.engine("hbs", exphbs({
    defaultLayout: "main",
    extname: ".hbs"
    //helpers: require("./public/js/hbs-helpers.js").helpers, // same file that gets used on our client
}));

app.set('view engine', '.hbs');


function getAwsConfig() {
    var fileBuffer;
    try {
        fileBuffer = fs.readFileSync(path.join(process.env.HOME, ".s3-screensaver"));
        var configArr = fileBuffer.toString().split("\n");
        return {
            bucket: configArr[0],
            bucketUrl: 'http://' + configArr[0] + '.s3.amazonaws.com',
            region: configArr[1],
            access_key_id: configArr[2],
            secret_access_key: configArr[3]
        };
    } catch (e) {
        console.log("Error reading ~/.s3-screensaver file", e);
        process.exit(1);
    }
}

exports.getAwsConfig = getAwsConfig;


function init(config) {
    var awsConfig = getAwsConfig();
    config = config;
    AWS.config.region = awsConfig.region;
    AWS.config.update({ 
        accessKeyId: awsConfig.access_key_id, 
        secretAccessKey: awsConfig.secret_access_key 
    });

    log = bunyan.createLogger({ name: "s3-screensaver", level: config.loglevel });
    log.info("Started up s3-screensaver on port " + config.port);
    return http.createServer(app).listen(config.port);
}

exports.init = init;


function listObjects(limit, cb) {
    var awsConfig = getAwsConfig();
    var client = new AWS.S3();
    client.listObjects({
        Bucket: awsConfig.bucket,
        EncodingType: 'url',
        MaxKeys: limit
    }, function(err, res) {
        if(err) return cb(err);
        var sortedImages = _und.chain(res.Contents)
            .filter(function(content) { 
                // Filter only images
                return (content.Key.slice(-4) === "jpeg" || 
                        content.Key.slice(-3) === "png" || 
                        content.Key.slice(-3) === "jpg" || 
                        content.Key.slice(-3) === "gif"); 
            })
            .sortBy(function(content) { 
                // Sort by last modified (will appear first)
                return -(new Date(content.LastModified).getTime()); 
            })
            .map(function(content) {
                // Return full image path
                return awsConfig.bucketUrl + '/' + content.Key;
            })
            .value();

        cb(null, sortedImages);
    });
}

app.get("/", function(req, res){ 
    res.render('home', { 
        config: JSON.stringify({
            displayCount: config.displayCount,
            displayStyle: config.displayStyle,
            shuffleInterval: config.shuffleInterval,
            displayInterval: config.displayInterval
        })
    }); 
});

// respond to all requests
app.get("/api/photos", function(req, res){
    var limit = req.query.limit || 100;
    log.debug("Received request to fetch " + limit + " photos");

    // Enforce a max limit on listObjects
    if (limit > maxLimit) limit = maxLimit;
    else limit = parseInt(limit, 10);

    listObjects(limit, function(err, objects){
        if(err) {
            log.error(err);
            return err;
        }
        res.end(JSON.stringify(objects));
    });
});

