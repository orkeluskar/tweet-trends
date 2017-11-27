var AWS = require('aws-sdk');

//SNS
var sns = new AWS.SNS();

var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client( {  
    host: process.env.esHostUrl
});


exports.handle = function(e, ctx, cb) {

    let tweet = JSON.parse(e.Records[0].Sns.Message);
    console.log('processing event: %j', tweet);

    client.index({
        index: 'tweettrends',
        type: 'tweets',
        body: tweet
    }, function (error, response) {
        if (error)
            console.log(error);
        else
            console.log(response);
    });


}