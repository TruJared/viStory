const Alexa = require('ask-sdk');
const Helpers = require('./helpers');

// TODO add in welcome back message //
// TODO set persistent data to session data //
// TODO add help event //
// TODO add multimodal scren //
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    // const sessionAttributes = await handlerInput.attributesManager.getPersistentAttributes();
    const speechText = "Welcome back. Let's continue where you left off";

    // get persistent sessionAttributes and check if returning from saved game
    // const persistentAttributes = (await attributesManager.getPersistentAttributes()) || {};

    // only run if new game
    // if (Object.keys(persistentAttributes).length === 0 ||) {
    //   speechText = 'Welcome to your cool game. Are you ready to begin your adventure?';
    //   return handlerInput.responseBuilder
    //     .speak(speechText)
    //     .reprompt(speechText)
    //     .withSimpleCard('V.I. Story Demo', speechText)
    //     .getResponse();
    // }

    // ! if not new game should just hand off to resume where last left off
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('V.I. Story Demo', speechText)
      .getResponse();
  },
};

const MakeChoiceHandler = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    return (
      request.type === 'IntentRequest'
      && sessionAttributes.inGame
      && request.intent.name === 'MakeChoiceIntent'
    );
  },
  handle(handlerInput) {
    // TODO save session data to persistent data
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    Helpers.getNextPassage(handlerInput);
    const speechText = sessionAttributes.text;
    console.log(JSON.stringify(sessionAttributes));

    // check if is end :(
    if (sessionAttributes.isEnd) {
      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('V.I. Story Demo', 'the end')
        .getResponse();
    }

    // if not end :)
    // deconstruct objects
    const { choices } = sessionAttributes;
    let repromptText = 'Here are your choices: ';
    choices.forEach(value => (repromptText += `| ${value.name} | `));

    // console.dir(sessionAttributes, false, null, true);
    // console.dir(repromptText, false, null, true);

    // * save data
    // handlerInput.attributesManager.setPersistentAttributes(sessionAttributes);
    // await handlerInput.attributesManager.savePersistentAttributes();

    return handlerInput.responseBuilder
      .speak(`${speechText} ${repromptText}`)
      .reprompt(repromptText)
      .withSimpleCard('V.I. Story Demo', repromptText)
      .getResponse();
  },
};

const YesRequestHandler = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    return (
      request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.YesIntent'
      && !sessionAttributes.inGame
    );
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    // get data for section and deconstruct objects
    Helpers.getNextPassage(handlerInput);
    const speechText = sessionAttributes.text;
    const { choices } = sessionAttributes;
    let repromptText = 'Here are your choices: ';
    choices.forEach(value => (repromptText += `| ${value.name} | `));

    // console.dir(sessionAttributes, false, null, true);
    // console.dir(repromptText, false, null, true);

    return handlerInput.responseBuilder
      .speak(`${speechText} ${repromptText}`)
      .reprompt(repromptText)
      .withSimpleCard('V.I. Story Demo', repromptText)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent'
    );
  },
  handle(handlerInput) {
    const speechText = 'Help is not currently set up';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent')
    );
  },
  handle(handlerInput) {
    const speechText = 'Thanks for playing';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('demo', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const FallbackHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const { choices } = sessionAttributes;
    let repromptText = 'Here are your choices: ';
    choices.forEach(value => (repromptText += `| ${value.name} | `));

    return handlerInput.responseBuilder
      .speak(repromptText)
      .reprompt(repromptText)
      .withSimpleCard('V.I. Story Demo', repromptText)
      .getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak("Sorry, I can't understand the command. Please say again.")
      .reprompt("Sorry, I can't understand the command. Please say again.")
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    YesRequestHandler,
    MakeChoiceHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    FallbackHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .withTableName('viStory')
  .withAutoCreateTable(true)
  .lambda();
