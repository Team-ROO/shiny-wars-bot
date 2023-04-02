const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const initialState = require('./initialState.json');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const announcementChannelId = process.env.ANNOUNCEMENT_CHANNEL_ID;

const startDate = new Date();
const endDate = new Date(startDate.getTime() + 15 * 60000);
const challengeInterval = 1;
const teamNames = ['Darkrai', "Cresselia", "Bidoof", "None"];

const stateFile = './state.json';

let challenges;
let activeChallenge = null;
let challengeTimeoutId = null;

function loadState() {
  console.log('inside loadState');
  if (fs.existsSync(stateFile)) {
    const stateData = fs.readFileSync(stateFile, 'utf8');
    challenges = JSON.parse(stateData);
  } else {
    challenges = initialState;
    saveState();
  }
  console.log('End of loadState')
}

function saveState() {
  console.log('inside saveState');
  const stateData = JSON.stringify(challenges, null, 2);
  fs.writeFileSync(stateFile, stateData, 'utf8');
}

function scheduleChallenge() {
  console.log('inside scheduleChallenge');
  if (new Date() >= endDate) {
    return;
  }

  if (challengeTimeoutId !== null) {
    clearTimeout(challengeTimeoutId);
  }

  challengeTimeoutId = setTimeout(() => {
    const nextChallenge = challenges.find(challenge => challenge.timeSent === null);

    if (nextChallenge) {
      activeChallenge = nextChallenge;
      activeChallenge.timeSent = new Date().toISOString();
      saveState();
      client.channels.cache.get(announcementChannelId).send(activeChallenge.challengeText);
    }
  }, challengeInterval * 60000);
}

client.once('ready', () => {
  console.log('Bot is online!');
  loadState();
});

client.on('messageCreate', message => {
  if (message.content.startsWith('!challenge start')) {
    scheduleChallenge();
    message.channel.send(`Shiny Wars Challenges have started!`);
  }

  if (message.content.startsWith('!challenge complete')) {
    const teamName = message.content.split(' ')[2];

    if (teamNames.includes(teamName) && activeChallenge && activeChallenge.timeCompleted === null) {
      activeChallenge.timeCompleted = new Date().toISOString();
      activeChallenge.challengeWonBy = teamName;
      activeChallenge.timeToComplete = (new Date(activeChallenge.timeCompleted) - new Date(activeChallenge.timeSent)) / 1000;
      saveState();
      message.channel.send(`Team ${teamName} has completed the challenge!`);

      scheduleChallenge();
    } else {
      message.channel.send(`Invalid team name or no active challenge.`);
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
