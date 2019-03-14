const Twitter = require('twitter');

const getTwitterList = function getTwitterList(ownerScreenName, slug, rules, config) {
  return new Promise(((resolve) => {
    const client = new Twitter(config);
    let response;

    client.get('application/rate_limit_status', (limitError, limitStatus) => {
      if (!limitError) {
        if (limitStatus.resources.lists['/lists/statuses'].remaining > 0) {
          // Rate Limit Acceptable, collecting data from Twitter and adding it to tweet_list.
          console.log('Rate Limit Acceptable ', limitStatus.resources.lists['/lists/statuses'].remaining, ', collecting data from Twitter and adding it to tweet_list.');
          const params = { owner_screen_name: '', slug: '', count: '200' };
          params.owner_screen_name = ownerScreenName;
          params.slug = slug;
          params.tweet_mode = 'extended';
          client.get('lists/statuses', params, (listError, tweets) => {
            response = {
              status: 'Success',
              rate_limit: {
                remaining: limitStatus.resources.lists['/lists/statuses'].remaining,
                limit: limitStatus.resources.lists['/lists/statuses'].limit,
              },
              slug,
              rules,
              data: tweets,
            };
            resolve(response);
            return response;
          });
        } else {
          // Rate Limit Status NOT Acceptable.
          response = {
            status: 'Rate Limit Status NOT Acceptable Error',
            rate_limit: {
              remaining: limitStatus.resources.lists['/lists/statuses'].remaining,
              limit: limitStatus.resources.lists['/lists/statuses'].limit,
            },
          };
          resolve(response);
          return response;
        }
      } else {
        response = {
          status: `Error - ${limitError}`,
          rate_limit: {
            remaining: 'unknown',
            limit: 'unknown',
          },
        };
        resolve(response);
        return response;
      }
      return limitStatus;
    });
  }));
};

const getTweetDetail = function getTweetDetail(ownerScreenName, slug, rules, config) {
}

exports.getTwitterList = getTwitterList;
