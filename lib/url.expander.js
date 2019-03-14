var async = require('async');
var urlExpander = require('expand-url');

function expandParallel(shortUrls, logCallback = ()=>{}, concurrency=10) {
    
    return new Promise((resolve, reject) => {
        const expandedUrlHash = {};

        //setup async queue
        let log_counter=0;
        let q = async.queue(function (shortUrl, callback) {
            urlExpander.expand(shortUrl, function(err, longUrl){
                log_counter++;
                
                if (err) {
                    console.log("ERROR shortUrl:",log_counter, shortUrl, err);
                    return callback(err);
                }
                if ( shortUrl !== longUrl ) {
                    console.log("SUCCESS shortUrl:",log_counter, shortUrl, longUrl);
                    expandedUrlHash[shortUrl] = longUrl;
                } else {
                    console.log("skipped shortUrl:",log_counter);
                }
                return callback();
            });
        }, concurrency);

        q.drain = function() {
            console.log(log_counter);
            console.log('ALL URLS HAVE BEEN PROCESSED');
            resolve(expandedUrlHash);
        }

        let i = 0;
        while (i< shortUrls.length){
            q.push(shortUrls[i], (function (i) {
                return function(err) {
                    if(err){
                        console.log('ERROR Pushing ',i, shortUrls[i], err);
                        logCallback(i);
                        reject(err);
                    }
                }
            })(i));
            i++;
        }
    });
}

module.exports = expandParallel;