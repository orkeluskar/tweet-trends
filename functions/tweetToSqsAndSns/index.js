console.log('starting function')
var Twitter = require('twitter');

var AWS = require('aws-sdk');
var elasticsearch = require('elasticsearch');
// Set the region 
AWS.config.update({
  region: 'us-east-2',
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey
});

//sqs instance
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});


var Tclient = new Twitter({
    consumer_key: process.env.consumer_key,
    consumer_secret: process.env.consumer_secret,
    access_token_key: process.env.access_token_key,
    access_token_secret: process.env.access_token_secret
});

var ESclient = new elasticsearch.Client( {  
    host: process.env.esHostUrl
});

exports.handle = function(e, ctx, cb) {
  let keyword = e.keyword;
  console.log('processing keyword: %j', e.keyword)

  ESclient.indices.delete({
      index: '_all'
  }, function(err, res) {

      if (err) {
          console.error(err.message);
      } else {
          console.log('Indexes have been deleted!');
      }
  });
  // Our rich twitter stream
  Tclient.stream('statuses/filter', {track: keyword}, function(stream) {
  
      stream.on('data', function(event) {
          
          if (event != undefined){
              if (event.place != null && 'full_name' in event.place){
                  
                  // if there's user details in the stream event
                  if ('user' in event && event.lang == 'en'){
                      // log for knowing whether the stream resumes
                      console.log(event.place.full_name);

                      var params = {
                        MessageAttributes: {
                          "user_id_str": {
                           DataType: "String",
                           StringValue: event.id_str
                          },
                          "profile_img_url": {
                           DataType: "String",
                           StringValue: event.user.profile_image_url_https
                          },
                          "screen_name": {
                           DataType: "String",
                           StringValue: event.user.screen_name
                          },
                          "location": {
                            DataType: "String",
                            StringValue: event.place.full_name
                          },
                          "date": {
                            DataType: "String",
                            StringValue: event.created_at
                          },
                          "text": {
                            DataType: "String",
                            StringValue: event.text
                          }
                        },
                        MessageBody: event.text,
                        QueueUrl: process.env.queueUrl
                       };
                       
                       sqs.sendMessage(params, function(err, data) {
                         if (err) {
                           console.log("Error", err);
                         } else {
                           console.log("Success", data.MessageId);
                            //when successfully sent to SQS, pub to SNS topic
                            //This way next lambda is triggered
                            var sns = new AWS.SNS();
                            
                            var params = {
                              Message: data.MessageId, /* required */
                              Subject: 'new message alert',
                              TopicArn: process.env.sns_topicArn
                            };
                
                            sns.publish(params, function(err, data) {
                              if (err) console.log(err, err.stack); // an error occurred
                              else     console.log(data);           // successful response
                            })
                         }
                       });
                      
                      console.log({
                        user_id_str: event.id_str,
                        profile_img_url: event.user.profile_image_url_https,
                        screen_name: event.user.screen_name,
                        location: event.place.full_name,
                        date: event.created_at,
                        text: event.text
                    });          
                  }
              }
          }
      });   
      stream.on('error', function(error) {
        throw error;
      });    
  });
  
}
