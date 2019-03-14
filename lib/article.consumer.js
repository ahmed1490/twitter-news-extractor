
/**
 * Module dependencies
 */
const _ = require('lodash');
const jsonfile = require('jsonfile');
const moment = require('moment');
const twitter = require('./twitter.client');
const { TweetsParser } = require('./twitter.data.parser');

const Articles = function Articles(settings) {
  this.config = settings;
  this.config.engine = jsonfile.readFileSync(this.config.headlines_file);
  this.rateLimit = {};
  this.articlesBySlug = {};
};

/**
 * get: public function
 * This function processes all of the twitter sources and produces the headlines and category data.
 */
Articles.prototype.get = function get({groupBy}) {
  return getArticles(this, groupBy);
};


/**
 * getArticles: private function
 * This purpose of this function is to collect the headlines and categories,
 * looping through each of the source files and processing each one.
 * Adding to the headlines and categories to the current Twitter-Headline instance
 * The headlines and categories are then sorted at the end.
 */
async function getArticles(thisInstance, groupBy) {
  thisInstance.articlesBySlug = {};
  thisInstance.articlesBySlugWithDate = {};

  // collecting the list of twitter sources from the instance config
  const { sources } = thisInstance.config.engine;
  let res, articles;

  for (let source of sources) {
    res = await twitter.getTwitterList(source.owner_screen_name, source.slug, source.rules, thisInstance.config);
    thisInstance.articlesBySlug[source.slug] = await collectSourceArticles(res.data, res.rules, thisInstance.config);
    //thisInstance.rateLimit = res.rate_limit;

    if ( groupBy === 'date' ) {
      articles = thisInstance.articlesBySlug[source.slug];
      thisInstance.articlesBySlugWithDate[source.slug] = orderByTweetDate(articles);
    }
  }

  return groupBy === 'date' ? thisInstance.articlesBySlugWithDate : thisInstance.articlesBySlug;
}
 

/**
 * collectArticles: private function
 * This purpose of this method is process raw tweet json objects into a articles object.
 */
async function collectSourceArticles(tweets, rules, config) {
  const articles = await TweetsParser.createArticlesFromTweetsWithLinks(tweets);
  return articles.map(article => article.toJson());
  // console.log('arguments', articles, arguments);
}

function orderByTweetDate(articles) {
  return _.toPairs(_.groupBy(articles, 'isoDate'));
}

module.exports = Articles;
