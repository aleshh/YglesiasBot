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

const devKeywords = [
  'css',
  'html',
  'javascript',
  'development',
  'react',
  'frontend',
  'dev',
  'agile',
  'git',
  'php',
  'design',
  'code',
  'website',
  'vscode',
  'deploy',
  'facebook',
  'work',
  'fb',
  'error',
]

// // twitter ID
// var followee = 15446531 // matt yglesias

// // in the long run, should tweet this percent of the user's tweets
// // var tweetPercent = 0.2

// // value for initial buffer population
// var initialLikeThreshold = 0

// // populate the buffer
// // var favCounts = Array(likesBuffer).fill(initialLikeThreshold)
// var favCounts = [initialLikeThreshold]

// the larger the buffer the slower the responsiveness to time of day etc.
var likesBuffer = 5

const users = [
  {
    name: 'Matt Yglesias',
    screenName: 'mattyglesias',
    id: 15446531,
    tweetPercent: 0.4,
    doRetweets: true,
    keywords: [],
    favCounts: [0],
  },
  {
    name: 'Laura González',
    screenName: 'freezydorito',
    id: 3004020255,
    tweetPercent: 0.1,
    doRetweets: true,
    keywords: devKeywords,
    favCounts: [0],
  },
  {
    name: 'Christopher Mims',
    screenName: 'mims',
    id: 1769191,
    tweetPercent: 0.8,
    doRetweets: true,
    keywords: [],
    favCounts: [0],
  },
]

var T = new Twit({
  consumer_key: cred.consumer_key,
  consumer_secret: cred.consumer_secret,
  access_token: cred.access_token,
  access_token_secret: cred.access_token_secret,
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
})

console.log(`\n\nYglesias Bot: up and running at ${getTime()}\n\n`)

var stream = T.stream('statuses/filter', {
  follow: users.map((user) => user.id),
})

stream.on('message', function (streamedTweet) {
  if (!streamedTweet.user) return // tweet has been deleted

  const user = users.find((user) => user.id == streamedTweet.user.id)
  const isReply = streamedTweet.text.slice(0, 1) === '@'

  if (!user) return // for now we're ignoring retweets

  if (isReply) return
  console.log('>> is not an @')

  console.log(`>> It's not a reply, so we're starting 5-minute wait`)

  setTimeout(function () {
    T.get('statuses/show/:id', { id: streamedTweet.id_str }, function (
      err,
      delayedTweet
    ) {
      if (err) {
        console.log('>> ERROR FROM TWITTER: ' + err)
      }
      if (!delayedTweet.text) {
        console.log('>> Tweet deleted')
        return
      }

      const { name, id, tweetPercent, keywords, favCounts } = user

      console.log('>>>>> 5 minutes later, New tweet from ', name)

      var favCountsWeighted = calculateWeightedArray(favCounts)

      favCountsWeightedLength = favCountsWeighted.length

      var numbertoBeatIndex = Math.floor(
        favCountsWeightedLength - favCountsWeightedLength * tweetPercent
      )

      var numberToBeat = favCountsWeighted[numbertoBeatIndex]

      const includedKeyword = keywords.find((word) =>
        delayedTweet.extended_tweet.full_text.includes(word)
      )

      console.log('>>>>> favCounts sorted: ' + favCountsWeighted)
      console.log('>>>>> number to beat: ' + numberToBeat)

      console.log(
        delayedTweet.created_at +
          ' (' +
          delayedTweet.favorite_count +
          '):\n' +
          delayedTweet.text
      )

      if (delayedTweet.favorite_count >= numberToBeat) {
        console.log(
          delayedTweet.favorite_count + ' > ' + numberToBeat + '!: RETWEETED!'
        )

        retweetTweet(delayedTweet.id_str)
      } else if (includedKeyword) {
        console.log('tweet includes keyword', includedKeyword)

        retweetTweet(delayedTweet.id_str)
      } else {
        console.log(
          delayedTweet.favorite_count +
            ' < ' +
            numberToBeat +
            '!: NOT RETWEETED'
        )
      }

      console.log('\n')

      // add the new favorite and trim the stack
      favCounts.push(delayedTweet.favorite_count)
      while (favCounts.length > likesBuffer) {
        favCounts.splice(0, 1)
      }
    }) // T.get
  }, 5 * 60 * 1000) // 5 minutes // setTimeout
}) // stream.on

function retweetTweet(id) {
  T.post('statuses/retweet/:id', { id: id }, function (err, data, response) {
    if (err) console.log('Retweeting Error: ' + err)
    console.log('Retweeting: ' + Object.getOwnPropertyNames(data))
  })
}

function calculateWeightedArray(favCounts) {
  let favCountsWeighted = []

  // We're going to make an array that has the first value once, the
  // second value twice, and so on. This way when we take the X
  // position, more recent values will be more highly valued than
  // older values
  for (var i = 1; i <= favCounts.length; i++) {
    for (var j = 0; j < i; j++) {
      favCountsWeighted.push(favCounts[i - 1])
    }
  }

  return sortArrayNumerically(favCountsWeighted)
}

function sortArrayNumerically(array) {
  return array.sort(function (a, b) {
    return a - b
  })
}

function getTime() {
  return new Date().toLocaleString()
}
