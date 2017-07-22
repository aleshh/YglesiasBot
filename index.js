/*
 *  Yglesias Bot
 *
 *  Retweets the top 20% of a user's tweets based on number of favorites
 *  after 5 minutes.
 *
 *  Sucks down the user's stream, sets a 5-minute wait for non RT's or @ replies
 *  then compares the number of favorites to the last 5 tweets. If the tweet
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
var util = require('util')


// twitter ID
var followee = 15446531  // matt yglesias

// in the long run, should tweet this percent of the user's tweets
var tweetPercent = .2

// the larger the buffer the slower the responsiveness to time of day etc.
var likesBuffer = 5

// value for initial buffer population
var initialLikeThreshold = 0

// populate the buffer
// var favCounts = Array(likesBuffer).fill(initialLikeThreshold)
var favCounts = [initialLikeThreshold];

var T = new Twit({
  consumer_key:         cred.consumer_key,
  consumer_secret:      cred.consumer_secret,
  access_token:         cred.access_token,
  access_token_secret:  cred.access_token_secret,
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
})

//run on startup
console.log('\n\nYglesias Bot: up and running\n\n')

var stream = T.stream('statuses/filter', { follow: followee })

stream.on('message', function (streamedTweet) {

  // if the tweet has been deleted
  if (streamedTweet.user) {

    // twitter will stream user's tweets and others' retweets
    // we only want the user's tweets
    var notRetweet = (streamedTweet.user.id == followee)

    // we also want to ignore our target's @replies to others
    var notAtReply = (streamedTweet.text.slice(0,1) != '@')

    if (notRetweet && notAtReply) {
      setTimeout(function() {

        T.get('statuses/show/:id', { id: streamedTweet.id_str }, function(err, delayedTweet) {
          if (err) {
            console.log('ERROR FROM TWITTER: ' + err )
          }

          if (delayedTweet.text) {

            console.log('favCounts: ' + favCounts)

            // // pass array by value
            // var favCountsTmp = favCounts.slice()

            var favCountsTmp = []

            // We're going to make an array that has the first value once, the
            // second value twice, and so on. This way when we take the X
            // position, more recent values will be more highly valued than
            // older values:

            for (var i = 1; i <= favCounts.length; i++) {
              for (var j = 0; j < i; j++) {
                favCountsTmp.push(favCounts[i-1])
              }
            }

            favCountsTmpLength = favCountsTmp.length

            // sort the array numerically
            favCountsTmp.sort(function(a,b) {return a - b})

            var numbertoBeatIndex = Math.floor(favCountsTmpLength -
                                      (favCountsTmpLength * tweetPercent))

            var numberToBeat = favCountsTmp[numbertoBeatIndex]

            console.log('favCounts sorted: ' + favCountsTmp)
            console.log('number to beat: ' + numberToBeat)

            console.log(delayedTweet.created_at + ' (' + delayedTweet.favorite_count + '):\n' + delayedTweet.text)

            if (delayedTweet.favorite_count >= numberToBeat) {
              console.log(delayedTweet.favorite_count + ' > ' +
                          numberToBeat +'!: RETWEETED!')

              T.post('statuses/retweet/:id', { id: delayedTweet.id_str },
                     function (err, data, response) {
                if (err) console.log('Retweeting Error: ' + err)
                console.log('Retweeting: ' + Object.getOwnPropertyNames(data))
              })

            } else {
              console.log(delayedTweet.favorite_count + ' < ' + numberToBeat +'!: NOT RETWEETED')
            }

            console.log('')

            // add the new favorite and trim the stack
            favCounts.push(delayedTweet.favorite_count)
            while (favCounts.length > likesBuffer) {
              favCounts.splice(0, 1)
            }


          }   // if (delayedTweet.text)

        }) // T.get

      }, (5 * 60 * 1000)) // 5 minutes // setTimeout
    } // if (notRetweet && notAtReply)

  } // if (streamedTweet.user)

}) // stream.on