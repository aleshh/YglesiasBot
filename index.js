var Twit = require('twit')
var cred = require('./credentials.js')

var T = new Twit({
  consumer_key:         cred.consumer_key,
  consumer_secret:      cred.consumer_secret,
  access_token:         cred.access_token,
  access_token_secret:  cred.access_token_secret,
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
})

console.log('cred.consumer_key: ', cred.consumer_key);

//
//  tweet 'hello world!'
//
// T.post('statuses/update', { status: 'hello world!' }, function(err, data, response) {
//   console.log(data)
// })