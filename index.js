//  https://www.npmjs.com/package/twit
//  https://dev.twitter.com/rest/reference/get/statuses/user_timeline

var Twit = require('twit')
var cred = require('./credentials.js')

var favCounts = [73, 52, 17, 47, 35, 47, 64, 104, 57, 17, 87, 10, 69, 67, 20, 121, 133, 22, 23, 50]

var followee = 15446531  // matt yglesias

var T = new Twit({
  consumer_key:         cred.consumer_key,
  consumer_secret:      cred.consumer_secret,
  access_token:         cred.access_token,
  access_token_secret:  cred.access_token_secret,
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
})


function timeStamp(t) {

  if (!t) var t = new Date()
  if (!t instanceof Date) t = new Date()

  var s = t.getFullYear() + '-'
  s += ('0' + t.getMonth()).slice(-2) + '-'
  s += ('0' + t.getDate()).slice(-2) + ' '

  var hour = t.getHours()
  var pm = false

  if (hour > 11) {
    pm = true
    hour = hour - 12
  }
  if (hour == 0) hour = 12

  s += ('0' + hour).slice(-2) + ':'
  s += ('0' + t.getMinutes()).slice(-2)
  //s += ':' + ('0' + t.getSeconds()).slice(-2)
  s += pm ? 'pm' : 'am'

  return s

}

var stream = T.stream('statuses/filter', { follow: followee })

stream.on('message', function (tweet) {
  // console.log('stream: ' + tweet.created_at + ' (' + tweet.favorite_count + '): ' + tweet.text)

  // twitter will stream user's tweets and others' retweets
  // we only want the user's tweets
  var notRetweet = (tweet.user.id == followee)

  // we also want to ignore our target's @replies to others
  var notAtReply = (tweet.text.slice(0,1) != '@')

  if (notRetweet && notAtReply) {
    setTimeout(function() {
      // console.log('+5min : ' + tweet.created_at + ' (' + tweet.favorite_count + '): ' + tweet.text)

      // getTweetById(tweet.id_str)

      T.get('statuses/show/:id', { id: tweet.id_str }, function(err, tweet) {
        if (err) console.log('ERROR FROM TWITTER: ' + err )


        console.log('favCounts: ' + favCounts)

        favCountsTmp = favCounts
        favCountsTmp.sort();

        console.log(tweet.created_at + ' (' + tweet.favorite_count + '): ' + tweet.text.slice(0,20))

        if (tweet.favorite_count > favCountsTmp[15]) {
          console.log(tweet.favorite_count + ' > ' + favCounts[3] +'!: RETWEETED!')

          T.post('statuses/retweet/:id', { id: tweet.id_str }, function (err, data, response) {
            if (err) console.log('Retweeting Error: ' + err)
            console.log('Retweeting: ' + data)
          })

        } else {
          console.log(tweet.favorite_count + ' < ' + favCounts[3] +'!: NOT RETWEETED')
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


//run on startup
console.log('\n\n', timeStamp(), 'Yglesias Bot: up and running')

