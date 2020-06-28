# Twitter filter

Given a twitter account's credentials, will retweet specified users 5 minutes after a tweet is
posted based on the amounts of likes received, based on a target percentage, or based on the
inclusion of one of a series of specified keywords.

Sucks down the user's stream, sets a 5-minute wait for non RT's or @ replies then compares the
number of favorites to the last 5 tweets. If the tweet has gotten more than the top 4, it's
retweeted. Repurposing this for another account should be as easy as plugging in new Twitter
credentials and changing the followee ID. Uses [twit](https:www.npmjs.com/package/twit) running on
Node.

[Posting to Twitter here](https://twitter.com/yglesias_bot)
