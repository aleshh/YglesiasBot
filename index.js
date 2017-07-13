/*
 *  Yglesias Bot
 *
 *  Retweets the top 20% of a user's tweets based on number of favorites
 *  after 5 minutes.
 *
 *  Sucks down the user's stream, sets a 5-minute wait for non RT's or @ replies
 *  then compares the number of favorites to the last 20 tweets. If the tweet
 *  has gotten more than the top 4, it's retweeted. Repurposing this for another
 *  account should be as easy as plugging in new Twitter credentials and
 *  changing the followee ID.
 *
 *  Created by Alesh Houdek, http:projects.alesh.com
 *
 *  References
 *
 *  https:www.npmjs.com/package/twit
 *  https:dev.twitter.com/rest/reference/get/statuses/user_timeline
 *
 */

var Twit = require('twit')
var cred = require('./credentials.js')
const util = require('util')



var followee = 15446531  // matt yglesias
var initialLikeThreshold = 90

// just some seed values to start with
// var favCounts = [73, 52, 17, 47, 35, 47, 64, 104, 57, 17, 87, 10, 69, 67, 20, 121, 133, 22, 23, 50]
var favCounts = Array(20).fill(initialLikeThreshold)

var T = new Twit({
  consumer_key:         cred.consumer_key,
  consumer_secret:      cred.consumer_secret,
  access_token:         cred.access_token,
  access_token_secret:  cred.access_token_secret,
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
})

//run on startup
console.log('\n\n', 'Yglesias Bot: up and running\n\n')


var stream = T.stream('statuses/filter', { follow: followee })

stream.on('message', function (tweet) {

  // console.log( tweet.toString())

  if (!tweet.user) {
    console.log('\n\n\n\n\nERROR ON this TWEET:')
    console.log(util.inspect(tweet, {showHidden: false, depth: null}))
  }

  // twitter will stream user's tweets and others' retweets
  // we only want the user's tweets
  var notRetweet = (tweet.user.id == followee)

  // we also want to ignore our target's @replies to others
  var notAtReply = (tweet.text.slice(0,1) != '@')

  if (notRetweet && notAtReply) {
    setTimeout(function() {

      T.get('statuses/show/:id', { id: tweet.id_str }, function(err, tweet) {
        if (err) console.log('ERROR FROM TWITTER: ' + err )

        console.log('favCounts: ' + favCounts)

        // pass array by value
        var favCountsTmp = favCounts.slice()

        // sort the array numerically
        favCountsTmp.sort(function(a,b) {return a - b})

        var numberToBeat = favCountsTmp[16]

        console.log('favCounts sorted: ' + favCountsTmp)
        console.log('number to beat: ' + numberToBeat)

        console.log(tweet.created_at + ' (' + tweet.favorite_count + '): ' + tweet.text.slice(0,40))

        if (tweet.favorite_count > numberToBeat) {
          console.log(tweet.favorite_count + ' > ' + numberToBeat +'!: RETWEETED!')

          T.post('statuses/retweet/:id', { id: tweet.id_str }, function (err, data, response) {
            if (err) console.log('Retweeting Error: ' + err)
            console.log('Retweeting: ' + data)
          })

        } else {
          console.log(tweet.favorite_count + ' < ' + numberToBeat +'!: NOT RETWEETED')
        }

        console.log('\n')

        // add the new favorite and trim the stack
        favCounts.push(tweet.favorite_count);
        while (favCounts.length > 20) {
          favCounts.splice(0, 1)
        }

      })

    }, (5 * 60 * 1000)) // 5 minutes
  }

})