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

  s += ('0' + hour).slice(-2) + ':' + t.getMinutes()
  s += pm ? 'pm' : 'am'

  return s

}

function scanTweets() {

  console.log('\n\n', timeStamp(), 'Yglesias Bot: scanning Tweets')

  T.get('statuses/user_timeline', {
      screen_name: 'mattyglesias',
      count: 1,
      trim_user: true,
      exclude_replies: true
    }, function(err, data, response) {

        console.log('number of tweets downloaded: ', data.length)
        // console.log(data)
        data.forEach(function(tweet) {
          console.log('tweet (' + tweet.favorite_count + '): ' + tweet.text)


        })
    })
}

//run on startup
console.log('\n\n', timeStamp(), 'Yglesias Bot: up and running')

var blah = new Date()

console.log('blah: ', timeStamp(blah))

var msMinute = 60 * 1000
var msHour =   60 * msMinute

var meh = blah.getTime() - (msMinute * 5)
// var meh = blah.getTime() - (msMinute * 4)


var bleh = new Date(meh)


console.log('bleh2: ', timeStamp(bleh))




// scanTweets()

// // run once a minute
// setInterval(scanTweets, 60000)