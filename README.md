# Yglesias Bot

Retweets the top 20% of a user's tweets based on number of favorites after 5 minutes.

Sucks down the user's stream, sets a 5-minute wait for non RT's or @ replies then compares the number of favorites to the last 20 tweets. If the tweet has gotten more than the top 4, it's retweeted. Repurposing this for another account should be as easy as plugging in new Twitter credentials and changing the followee ID. Uses [twit](https:www.npmjs.com/package/twit) running on Node.

[Posting to Twitter here](https://twitter.com/yglesias_bot)