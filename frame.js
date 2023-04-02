const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const initialState = require('./initialState.json');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const announcementChannelId = process.env.ANNOUNCEMENT_CHANNEL_ID;

const startDate = new Date();
const endDate = new Date(startDate.getTime() + 15 * 60000);
const challengeIntervalUnit = "minute";
const challengeInterval = 1;
const teamNames = ['Darkrai', "Cresselia", "Bidoof"];

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

client.once('ready', () => {
  console.log('Bot is online!');
  loadState();
});

function scheduleChallenge() {
  console.log('inside scheduleChallenge');
}


client.on('messageCreate', message => {

});

client.login(process.env.DISCORD_BOT_TOKEN);
