const _ = require('lodash');
const moment = require('moment');
const parallelExpandUrls = require('./url.expander');
const parallelMetadataByUrl = require('./url.meta');

const Article = function Article({ tweet={}, metadata={} }) {
    this.tweet = tweet;
    this.metadata = metadata;
    //gives a deprecation warning "value provided is not in a recognized RFC2822 or ISO format"
    this.isoDate = moment(this.tweet.created_at).startOf('day').toISOString();
    this.article = {};
    // this.tweet = {
    //     created_at,
    //     id,
    //     text,
    //     expanded_url,
    //     display_url,
    //     media: [
    //         // {
    //         //         type: "video",
    //         //         media_url_https,
    //         //         video_info
    //         // }
    //     ],
    //     user
    // };

    this.toJson = function(){
        return {
            metadata: this.metadata,
            tweet: this.tweet,
            isoDate: this.isoDate
        }
    }
};

const TweetsParser = {

    async createArticlesFromTweetsWithLinks(tweets) {
        const filteredTweets = TweetsParser.tweetsWithExternalUrls(tweets);
        const metadataByUrl = await TweetsParser.fetchMetadataByUrl(filteredTweets);

        let originalUrl, metadata;
        const articles = _.map(filteredTweets, tweet => {
            originalUrl = _.get(tweet, 'entities.urls[0].expanded_url');
            metadata = metadataByUrl[originalUrl];
            return metadata ? new Article({ tweet, metadata }) : undefined;
        });

        return articles.filter(article => !!article);
    },

    tweetsWithExternalUrls(tweets) {
        return tweets.filter(tweet => tweet.entities.urls.length);
    },

    async fetchMetadataByUrl(tweets) {
        const shortUrls = _.map(tweets, 'entities.urls[0].expanded_url');
        const metadataByUrl = await parallelMetadataByUrl(shortUrls, function logCallback(index){
            console.log('error in', tweets[index].user.screen_name, tweets[index].id_str);
        });
        return metadataByUrl;
    },

};

module.exports = { Article, TweetsParser };


// async expandUrls(tweets) {
//     const shortUrls = _.map(tweets, 'entities.urls[0].expanded_url');
//     const expandedUrlHash = await parallelExpandUrls(shortUrls, function logCallback(index){
//         console.log('error in', tweets[index].user.screen_name, tweets[index].id_str);
//     });
//     let originalUrl, finalUrl;

//     _.map(tweets, tweet => {
//         originalUrl = _.get(tweet, 'entities.urls[0].expanded_url');
//         finalUrl = expandedUrlHash[originalUrl];
//         _.set(tweet, 'entities.urls[0].final_url', finalUrl || originalUrl);
//     })

//     return tweets;
// }