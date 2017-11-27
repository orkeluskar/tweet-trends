# TweetTrends

This is event-driven implementation of Tweet Trends using Sentimental Analysis.


## Tools/Frameworks Used
1. NodeJS(via Lambda) - for serverless nodeJS code

2. Twitter API  - fetch live public tweet streams

3. Sentiment Analysis    - IBM Watson [NLU API](https://www.ibm.com/watson/services/natural-language-understanding/)

4. AWS: 
   1. [Lambda](https://aws.amazon.com/lambda)                - Serverless implementation
   2. API Gateway           - Route API req/res to/from Lambda/Client
   3. [SQS](https://aws.amazon.com/sqs/)                   - Message queue to pipe tweets asynchronously
   4. [SNS](https://aws.amazon.com/sns/)                   - Kinda pub/sub implementation between client & back-end to notify of fetched tweets
   5. S3                    - Hosting static landing page to interact with back-end 
   6. ElasticSearch         - Store tweets with Sentiment analysis
   7. [API Gateway](https://aws.amazon.com/api-gateway/)           - To deploy API into a REST endpoint, this way the client can make REST calls to lambda functions

5. [Apex](http://apex.run/)                 - To deploy AWS lambda functions through command line


## Architecture diagram

[Insert Image here with markdown!!]


## Checklist (sanity purposes :-) )

- [x] 1st Lambda function to fetch tweets from Twitter-streaming API & filter out tweets with no location & check for language to be english
- [x] send those stream of tweets onto SQS, SNS. SNS triggers 2nd Lambda (sqsToSa)
- [x] 2nd Lambda function to fetch tweets from SQS, Sentiment analyse(text) & send to second SNS topic which triggers 3rd lambda
- [x] 3rd lambda function to fetch tweets from SNS & & index the tweet as document onto ElasticSearch
- [x] Client listens onto new tweets through Static website hosted on S3


## Getting Started

1. For every functions in [functions](functions/) folder run `npm install` which will download all the required packages from NPM
2. [Setup apex](http://apex.run/#installation) for command line changes to lambda & deploy them to AWS
3. Learn to setup environment variables, add required rules to run lambdas
   - Setup all the infrastructure
     - SQS - one queue
     - SNS - two sns topics
     - ElasticSearch - to document tweets
     - S3 - create a front-end and deploy it onto S3 for [hosting](http://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html)
4. `apex deploy` to delpoy all lambda(s) to AWS Lambda
5. Call first lambda via API Gateway, it should fetch tweets and store them onto ElasticSearch