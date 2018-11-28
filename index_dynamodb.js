/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

'use strict';

var aws = require('aws-sdk');
var docClient = new aws.DynamoDB.DocumentClient({region: 'ap-northeast-1'});

//=========================================================================================================================================
//TODO: このコメント行より下の項目に注目してください。
//=========================================================================================================================================

const SKILL_NAME = "サービス";
const GET_FACT_MESSAGE = "たとえば";
const HELP_MESSAGE = "サービスの内容を聞きたい時は「awsのサービスで何か教えて」と、終わりたい時は「おしまい」と言ってください。どうしますか？";
const HELP_REPROMPT = "どうしますか？";
const FALLBACK_MESSAGE = "それについてはわかりません。サービスの内容を聞きたい時は「awsのサービスで何か教えて」と、終わりたい時は「おしまい」と言ってください。どうしますか？";
const FALLBACK_REPROMPT = "どうしますか？";
const STOP_MESSAGE = "さようなら";
const ERR_MESSAGE = "error!";

//=========================================================================================================================================
//「TODO: ここから下のデータを自分用にカスタマイズしてください。」
//=========================================================================================================================================
const data = [

    "EC2があります。",
    "RDSがあります。",
    "ELBがあります。",
    "S3があります。",
    "SageMakerがあります。",
    "Cloudwatchがあります。",
    "SNSがあります。",
    "SESがあります。",
    "CloudTrailがあります。",
    "IAMがあります。",
];

//=========================================================================================================================================
//この行から下のコードに変更を加えると、スキルが動作しなくなるかもしれません。わかる人のみ変更を加えてください。  
//=========================================================================================================================================
function getRandomItem(arrayOfItems) {
    // can take an array, or a dictionary
    if (Array.isArray(arrayOfItems)) {
      // the argument is an array []
      let i = 0;
      i = Math.floor(Math.random() * arrayOfItems.length);
      return (arrayOfItems[i]);
    }

    if (typeof arrayOfItems === 'object') {
      // argument is object, treat as dictionary
      const result = {};
      const key = this.getRandomItem(Object.keys(arrayOfItems));
      result[key] = arrayOfItems[key];
      return result;
    }
    // not an array or object, so just return the input
    return arrayOfItems;
}

const GetNewFactHandler = {
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'LaunchRequest'
        || (request.type === 'IntentRequest'
          && request.intent.name === 'GetNewFactIntent');
    },
    handle(handlerInput) {
      const randomFact = getRandomItem(data);
      const speechOutput = GET_FACT_MESSAGE + randomFact;
      return handlerInput.responseBuilder
        .speak(speechOutput)
        .withSimpleCard(SKILL_NAME, randomFact)
        .getResponse();
    },
};


const GetAWSHandler = {
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'IntentRequest'
          && request.intent.name === 'GetAWSIntent';
    },
    handle(handlerInput,test) {
    const service = handlerInput.requestEnvelope.request.intent.slots.services.value;
      var params = {
    TableName : 'awsservice',
    Key: {
        'servicename': service
    }
   };
   docClient.get(params, function(err, data) {
        if (err){
       return handlerInput.responseBuilder
       .speak(ERR_MESSAGE)
       .getResponse();
        } else {
       const data_kinou = data.Item.kinou;
       const data_kinou = 'リレーショナルデータベース';
       const speechOutput = service + 'は' + data_kinou + 'です。';
       return handlerInput.responseBuilder
       .speak(speechOutput)
       .getResponse();
        }
    });       
    },
};


const HelpHandler = {
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'IntentRequest'
        && request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
      return handlerInput.responseBuilder
        .speak(HELP_MESSAGE)
        .reprompt(HELP_REPROMPT)
        .getResponse();
    },
};
  
const FallbackHandler = {
    // 2018-May-01: AMAZON.FallackIntent is only currently available in en-US locale.
    //              This handler will not be triggered except in that locale, so it can be
    //              safely deployed for any locale.
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'IntentRequest'
        && request.intent.name === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
      return handlerInput.responseBuilder
        .speak(FALLBACK_MESSAGE)
        .reprompt(FALLBACK_REPROMPT)
        .getResponse();
    },
};
  
const ExitHandler = {
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'IntentRequest'
        && (request.intent.name === 'AMAZON.CancelIntent'
          || request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
      return handlerInput.responseBuilder
        .speak(STOP_MESSAGE)
        .getResponse();
    },
  };
  
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
      console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
  
      return handlerInput.responseBuilder.getResponse();
    },
};
  
const ErrorHandler = {
    canHandle() {
      return true;
    },
    handle(handlerInput, error) {
      console.log(`Error handled: ${error.message}`);
  
      return handlerInput.responseBuilder
        .speak('Sorry, an error occurred.')
        .reprompt('Sorry, an error occurred.')
        .getResponse();
    },
};
  
const skillBuilder = Alexa.SkillBuilders.custom();
  
exports.handler = skillBuilder
    .addRequestHandlers(
      GetNewFactHandler,
      GetAWSHandler,
      HelpHandler,
      ExitHandler,
      FallbackHandler,
      SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
