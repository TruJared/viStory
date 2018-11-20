const Story = require('./story.json');

const { passages } = Story;

const specialEvent = (handlerInput, special) => {
  const attributes = handlerInput.attributesManager.getSessionAttributes();
  const event = special[0];
  console.log(`in special event ${special}`);

  // event controller, will eventually guide to other function calls
  switch (event) {
    case 'end' || 'event':
      // TODO add play again option //
      attributes.choices = [];
      attributes.text = passages[attributes.pid].text;
      attributes.isEnd = true;

      break;

    case 'dice':
      attributes.choices = [];
      attributes.isEnd = true;

      // * switched to 4 because computer wins too much :(
      const computerRoll = 1 + Math.floor(Math.random() * 4);
      const playerRoll = 1 + Math.floor(Math.random() * 6);
      let resultText = '';

      if (computerRoll > playerRoll) {
        resultText = 'You lose! <break time="500ms" /> So it turns out the price of losing was being eaten by the creature. <audio src="https://s3.amazonaws.com/mudcrablife/polly.0aa50b3f-64e6-4d71-b772-777cccced6d5.mp3" /> The End';
      } else {
        // win game and progress to next part of story
        resultText = 'You win! <break time="500ms" /> Looks like gambling comes pretty naturally to a posh mudcrab such as yourself. The creature looks both surprised and amused that you won. She rewards you with a large golden coin as promised.<audio src="soundbank://soundlibrary/musical/amzn_sfx_bell_short_chime_01"/> Seeing as a mud crab has no pockets, you decide that you should get this money put safely away. Perhaps the castle has a place you can store your coin or maybe you can find a place to hide the coin in the ocean?';
        attributes.isEnd = false;
        attributes.inventory.item = 'coin';
        attributes.choices = [
          {
            name: 'castle',
            link: 'castle',
            pid: '7',
          },
          {
            name: 'ocean',
            link: 'ocean',
            pid: '4',
          },
        ];
      }
      console.log(`NPC rolls ${computerRoll} :::: Player rolls ${playerRoll}`);

      attributes.text = `From your understanding you are about to play a dice game. You're pretty sure that an equal or higher roll means you win the coin. You, however, are a little unclear on what happens if you lose. <break time='500ms' />. The Khajitt rolls a ${computerRoll} and you roll a ${playerRoll}. ${resultText}`;
      break;

    case 'final':
      attributes.choices = [];
      attributes.isEnd = true;

      // TODO add posh mudcrab image to card //
      if (attributes.inventory.item) {
        attributes.text = "You arrive at the castle and instantly you are overwhelmed at how huge this place is. <audio src='soundbank://soundlibrary/musical/amzn_sfx_trumpet_bugle_03'/> Like an entire sequel could be written just about your adventures here! As you wonder around the castle you see a group of mud crabs at a cafe drinking some sort of steaming brown liquid.<audio src='soundbank://soundlibrary/human/amzn_sfx_drinking_slurp_01'/> They are all wearing monocles and top hats. You greet them with a wave of your claw, which also happens to be carrying the largest coin they have ever seen. They notice that you are a posh mudcrab, and that you are by mudcrab standards, extremely wealthy. You are immediately welcomed to their table and fitted with your own top hat and monocle. You are one of the mudcrab elite! <audio src='soundbank://soundlibrary/human/amzn_sfx_large_crowd_cheer_03'/> Tomorrow, you'll be joining the other mud crabs at their summer house, whatever that is.<break time='500ms' /> <audio src='https://s3.us-east-1.amazonaws.com/mudcrablife/polly.6d5ac991-ae83-455b-9e54-30eae73efb94.mp3' /> ";
      } else {
        attributes.text = "You arrive at the castle and instantly you are overwhelmed at how huge this place is. <audio src='soundbank://soundlibrary/musical/amzn_sfx_trumpet_bugle_03' /> Like an entire sequel could be written just about your adventures here! As you wonder around the castle you see a group of mud crabs at a cafe drinking some sort of steaming brown liquid.<audio src='soundbank://soundlibrary/human/amzn_sfx_drinking_slurp_01' /> They are all wearing monocles and top hats. You greet them with a wave of your claw.They notice that you are a posh mudcrab, but your lack of money keeps you from joining their table. <audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_negative_response_02' /> They motion over at the help wanted sign at the cafe.<audio src='soundbank://soundlibrary/foley/amzn_sfx_kitchen_ambience_01' /> You decide it's probably about time you get a job. The end";
      }
      break;

    // ! should never get here
    default:
      console.log('something has gone terribly wrong');
  }
};

const passageBuilder = (handlerInput) => {
  const attributes = handlerInput.attributesManager.getSessionAttributes();
  const { special } = passages[attributes.pid];

  if (special.length > 0) {
    specialEvent(handlerInput, special);
  } else {
    attributes.choices = passages[attributes.pid].links;
    attributes.text = passages[attributes.pid].text;
  }
};

const getNextPassage = (handlerInput) => {
  const attributes = handlerInput.attributesManager.getSessionAttributes();

  // if new game
  if (!attributes.inGame) {
    attributes.inGame = true;
    attributes.pid = 0;
    attributes.inventory = {};
    // start the choice loops
  } else {
    const { request } = handlerInput.requestEnvelope;
    const triggerWord = request.intent.slots.triggerWord.value;
    const { choices } = attributes;
    // find the correct pid
    choices.forEach((choice) => {
      if (choice.name === triggerWord) {
        // * need -1 to offset at PID starts at 1
        attributes.pid = choice.pid - 1;
      }
    });
  }
  passageBuilder(handlerInput);
};

module.exports = { getNextPassage };
