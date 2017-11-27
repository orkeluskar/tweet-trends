var AWS = require('aws-sdk');

// Set the region 
// Set the region 
AWS.config.update({
  region: 'us-east-2',
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey
});

var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

var queueURL = process.env.queueURL;


var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
var natural_language_understanding = new NaturalLanguageUnderstandingV1({
  "username": process.env.nluUsername,
  "password": process.env.nluPassword,
  'version_date': '2017-02-27'
});


exports.handle = function(e, ctx, cb) {

  console.log('processing event: %j', e)

    var params = {
      AttributeNames: [
        "All"
      ],
      MaxNumberOfMessages: 1,
      MessageAttributeNames: [
        "All"
      ],
      QueueUrl: queueURL,
      VisibilityTimeout: 5,
      WaitTimeSeconds: 5
    };
    let text;
    let tweet;
    sqs.receiveMessage(params, function(err, data) {
      if (err) {
        console.log("Receive Error", err);
      } else if (data.Messages) {
        console.log("received a message") 
        //SA this text

        // The text to analyze
      
      if(data !== undefined && data.Messages[0] !== undefined &&
         data.Messages[0].MessageAttributes !== undefined &&
         data.Messages[0].MessageAttributes.text !== undefined &&
         data.Messages[0].MessageAttributes.text.StringValue !== undefined){
         
        tweet = data.Messages[0].MessageAttributes;
        text = data.Messages[0].MessageAttributes.text.StringValue;

        var deleteParams = {
          QueueUrl: queueURL,
          ReceiptHandle: data.Messages[0].ReceiptHandle
        };
        sqs.deleteMessage(deleteParams, function(err, data) {
          if (err) {
            console.log("Delete Error", err);
          } else {
            console.log(data);
          }
        });
      }
      //console.log("tweet: " + JSON.stringify(tweet, null,2));
      //console.log(tweet);
      

      let sentAnalysis;

      try{ 
        var parameters = {
          'text': text,
          'features': {
            'sentiment': {
              
            }
          }
        };
      
        natural_language_understanding.analyze(parameters, function(err, response) {
          if (err)
            console.log('error:', err);
          else{
            console.log(response.sentiment.document.label);
            sentAnalysis = JSON.stringify(response, null, 2);

            //sanitize the received tweet message from SQS
            for (i in tweet){
              tweet[i] = tweet[i].StringValue;
            }
            //adding sentiment to the tweet
            tweet.sentiment = response.sentiment.document.label;

            console.log(tweet);

            //sending to sns topic
            var sns = new AWS.SNS();

            var params = {
              Message: JSON.stringify(tweet), /* required */
              Subject: 'tweet',
              TopicArn: process.env.snsTopicArn
            };

            sns.publish(params, function(err, data) {
              if (err) console.log(err, err.stack); // an error occurred
              else     console.log(data);           // successful response
            })
            
            //console.log(sentAnalysis);
            text = undefined;
          }
        });
      }
      catch(err) {
        console.log(er);
      }


      }
    });
}