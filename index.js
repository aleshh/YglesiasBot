var Twit = require('twit')
var cred = require('./credentials.js')

var minFavs = 50

var T = new Twit({
  consumer_key:         cred.consumer_key,
  consumer_secret:      cred.consumer_secret,
  access_token:         cred.access_token,
  access_token_secret:  cred.access_token_secret,
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
})

//  https://www.npmjs.com/package/twit
//  https://dev.twitter.com/rest/reference/get/statuses/user_timeline

//
//  retweet a tweet with id '343360866131001345'
//
// T.post('statuses/retweet/:id', { id: '343360866131001345' }, function (err, data, response) {
//   console.log(data)
// })

console.log('Yglesias Bot: up and running')

var scanTweets = function() {

  console.log('Yglesias Bot: scanning Tweets')

  T.get('statuses/user_timeline', {
      screen_name: 'mattyglesias',
      count: 100,
      trim_user: true,
      exclude_replies: true
    }, function(err, data, response) {

        console.log(data.length)
        // console.log(data)
        data.forEach(function(tweet) {
          console.log('tweet (', tweet.favorite_count, '): ', tweet.text)
        })
    })
}

// run once a minute
setTimeout(scanTweets(), 60000)