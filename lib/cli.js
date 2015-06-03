"use strict";

var path = require('path'),
    fs = require('fs'),
    defaultConfig = require('./config'),
    commander = require('commander'),
    s3screensaver = require(path.join(__dirname, './s3-screensaver')),
    packageJson = require(path.join(__dirname, '..', 'package.json'));

commander
    .version(packageJson.version)
    .usage('[options]') 
    .option('--port', 'Port to host the server')
    .option('--loglevel', 'Log level')
    .option('--display-interval', 'Frequency to check for new photos')
    .option('--shuffle-interval', 'Frequency to shuffle the displayed images (0 for no shuffle)')
    .option('--display-count', 'Number of images to display')
    .option('--display-style', 'Style of image display ("grid" or "single")')
    .parse(process.argv);



s3screensaver.init({
    port: commander.port || defaultConfig.port,
    loglevel: commander.logLevel || defaultConfig.loglevel,
    displayStyle: commander.displayStyle,
    shuffleInterval: commander.shuffleInterval,
    displayCount: commander.displayCount,
    displayInterval: commander.displayInterval
});
