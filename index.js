require('dotenv').config(); //handle error
const cron = require('node-cron');
const express = require('express');
const TwitterArticles = require('./lib/article.consumer');

console.log('TwitterHeadlines', 'dsd', TwitterArticles);

const articles = new TwitterArticles({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    // headlines_file: './projectname.headlines.json',
    headlines_file: './umm.headlines.json'
  });

  const app = express();
//   articles.get();
  
  app.get('/', (req, res) => {
    articles.get().then(function(data){
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'X-Requested-With');
      res.header('Content-type', 'application/json');
      res.send(data);
    });
  });
  
  app.get('/datewise', (req, res) => {
    articles.get({groupBy: 'date'}).then(function(data){
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'X-Requested-With');
      res.header('Content-type', 'application/json');
      res.send(data);
    });
  });
  
  
  cron.schedule('0,15,30,45 * * * *', () => {
    articles.get();
  });
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT);