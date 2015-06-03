$(document).ready(function(){

    var s3_screensaver_config = window.s3_screensaver_config || {};

    var defaultOpts = {
        displayInterval: s3_screensaver_config.displayInterval || 30000, 
        queueLimit: s3_screensaver_config.queueLimit || 200,
        displayCount: s3_screensaver_config.displayCount || 200,
        shuffleInterval: s3_screensaver_config.shuffleInterval || 10000,
        displayStyle: s3_screensaver_config.displayStyle || 'grid',
        autoStart: true
    };
    
	function S3Screensaver(opts){
        opts = opts || {};
        this.displayed = [];
        this.imgQueue = [];
        this.queueLimit = opts.queueLimit || defaultOpts.queueLimit;
        this.displayInterval = opts.displayInterval || defaultOpts.displayInterval;
        this.autoStart = opts.autoStart || defaultOpts.autoStart;
        this.displayCount = opts.displayCount || defaultOpts.displayCount;
        this.shuffleInterval = opts.shuffleInterval || defaultOpts.shuffleInterval;

        this.$grid = $('#grid').isotope({
            itemSelector: '.grid-item',
            layoutMode: 'fitRows'
            /*
            getSortData: {
                name: '.created parseInt', // text from querySelector
                category: '[data-created]' // value of attribute
            },
            sortBy: 'category'
           */
        });

        this._intervalDisplay = null;
        this._intervalShuffle = null;
    }

    S3Screensaver.prototype.displayImgGrid = function() {
        var self = this;

        var gridImgContent = "";
        for (var i = 0; i < self.displayCount; i++){
            var img = self.imgQueue.shift();
            if (img) {
                //console.log("Displaying img: ", img.src);
                //gridImgContent += "<div class='grid-item' data-created='"+imgMeta.created+"'><img class='grid-item-img' src='"+imgMeta.img.src+"'></img></div>";
                gridImgContent += "<div class='grid-item'><img class='grid-item-img' src='"+img.src+"'></img></div>";
                self.displayed.unshift(img.src);
                //$('.grid-item').last().remove();
            }
        }

        //this.$grid.prepend(gridImgContent);

        $("#grid").isotope('insert', $(gridImgContent), function(){
            //console.log("inserted content");
            if (self.imgQueue.length < self.displayCount) {
                self.fetchAndQueue();
            }
        }); 
    };


    S3Screensaver.prototype.getPhotos = function(cb) {
        var self = this;
        $.getJSON("/api/photos?limit=" + self.queueLimit, function(res){
            cb(null, res);
        });
    };

    S3Screensaver.prototype.queueImg = function(imgUrl) {
        if (this.displayed.indexOf(imgUrl) === -1) {
            //console.log("Queueing image");
            var img = new Image();
            img.src = imgUrl;
            this.imgQueue.push(img);
        }
    };

    S3Screensaver.prototype.fetchAndQueue = function(cb) {
        var self = this;
        this.getPhotos(function(err, photoKeys){
            if (err) {
                console.log("Error fetching photos: ", err);
                return;
            }

            console.log("Fetched " + photoKeys.length + " photos");

            for (var i=0; i < photoKeys.length; i++) {
                self.queueImg(photoKeys[i]);
            }

            if (cb) cb();
        });
    };

    S3Screensaver.prototype.displayImg = function() {
        var img = this.imgQueue.shift();
        if (img) {
            console.log("Displaying img: ", img.src);
            $("#img-main").attr("src", img.src); 
        }
        
        if (this.imgQueue.length < 2) {
            this.fetchAndQueue();
        }
    };

    S3Screensaver.prototype.start = function() {
        var self = this;
        console.log("Starting s3 slideshow");

        this.fetchAndQueue(function(){
            if (self.displayStyle === 'grid') self.displayImgGrid();
            else self.displayImg();

            self.setIntervals();
        });
    };

    S3Screensaver.prototype.setIntervals = function() {
        var self = this;

        if (this.displayInterval !== 0) {
            this._intervalDisplay = setInterval(function(){
                //self.displayImg();
                self.displayImgGrid();
            }, this.displayInterval);
        }

        if (this.shuffleInterval !== 0) {
            this._intervalShuffle = setInterval(function(){
                self.$grid.isotope('shuffle');

            }, this.shuffleInterval);
        }
    };

    S3Screensaver.prototype.stop = function() {
        if (this._intervalDisplay) {
            this._intervalDisplay.clearInterval();
        }

        if (this._intervalShuffle) {
            this._intervalShuffle.clearInterval();
        }
    };

    window.S3Screensaver = S3Screensaver;

});
