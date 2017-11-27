# TweetTrends

This is event-driven implementation of Tweet Trends using Sentimental Analysis.


## Tools/Frameworks Used
1. NodeJS(via Lambda) - for serverless nodeJS code

2. Twitter API  - fetch live public tweet streams

3. Sentiment Analysis    - IBM Watson NLU API

4. AWS: 
   1. Lambda                - Serverless implementation
   2. API Gateway           - Route API req/res to/from Lambda/Client
   3. SQS                   - Message queue to pipe tweets asynchronously
   4. SNS                   - Kinda pub/sub implementation between client & back-end to notify of fetched tweets
   5. S3                    - Hosting static landing page to interact with back-end 
   6. ElasticSearch         - Store tweets with Sentiment analysis
   7. API Gateway           - To deploy API into a REST endpoint, this way the client can make REST calls to lambda functions


## Architecture diagram

[Insert Image here with markdown!!]


## Checklist (sanity purposes :-) )

- [x] 1st Lambda function to fetch tweets from Twitter-streaming API & filter out tweets with no location & check for language to be english
- [x] send those stream of tweets onto SQS, SNS. SNS triggers 2nd Lambda (sqsToSa)
- [x] 2nd Lambda function to fetch tweets from SQS, Sentiment analyse(text) & send to second SNS topic which triggers 3rd lambda
- [x] 3rd lambda function to fetch tweets from SNS & & index the tweet as document onto ElasticSearch
- [x] Client listens onto new tweets through Static website hosted on S3