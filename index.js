const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const announcementChannelId = process.env.ANNOUNCEMENT_CHANNEL_ID;

const startDate = new Date('Sat Apr 01 2023 20:00:55 GMT-0400 (Eastern Daylight Time)');
const durationInMinutes = 20;
const endDate = new Date(startDate.getTime() + durationInMinutes * 60 * 1000);

const numberOfNotifications = 14;
const intervalInMinutes = durationInMinutes / numberOfNotifications;

const stateFile = './state.json';

let challenges;
let activeChallenge = null;
let challengeTimeoutId = null;

function loadState() {
  if (fs.existsSync(stateFile)) {
    const stateData = fs.readFileSync(stateFile, 'utf8');
    challenges = JSON.parse(stateData);
  } else {
    challenges = [
      {
        challengeText: 'Darkrai challenge',
        timeCompleted: null,
        timeSent: null,
        challengeWonBy: null,
        timeToComplete: null
      },
      {
        challengeText: 'Cresselia challenge',
        timeCompleted: null,
        timeSent: null,
        challengeWonBy: null,
        timeToComplete: null
      }
    ];
    saveState();
  }
}

function saveState() {
  const stateData = JSON.stringify(challenges, null, 2);
  fs.writeFileSync(stateFile, stateData, 'utf8');
}

client.once('ready', () => {
  console.log('Bot is online!');
  loadState();
  scheduleChallenge();
});

function scheduleChallenge() {
  const currentTime = new Date();

  // Check if the current time is within the start and end dates
  if (currentTime >= startDate && currentTime <= endDate) {
    // Expire the active challenge, if there is one
    if (activeChallenge) {
      activeChallenge.timeCompleted = null;
      activeChallenge.challengeWonBy = null;
      activeChallenge.timeToComplete = null;
      activeChallenge = null;
      clearTimeout(challengeTimeoutId);
    }

    // Get the available challenges
    const availableChallenges = challenges.filter(challenge => challenge !== activeChallenge);

    // If all challenges have been used, reset the active challenge and used challenges
    if (availableChallenges.length === 0) {
      activeChallenge = null;
      challenges.forEach(challenge => {
        challenge.timeCompleted = null;
        challenge.challengeWonBy = null;
        challenge.timeToComplete = null;
      });
    }

    // Select a random challenge from the available challenges
    const randomIndex = Math.floor(Math.random() * availableChallenges.length);
    const selectedChallenge = availableChallenges[randomIndex];

    // Set the selected challenge as the active challenge
    activeChallenge = selectedChallenge;

    // Generate a random time between 12:00am and 11:59pm
    const randomHour = Math.floor(Math.random() * 24);
    const randomMinute = Math.floor(Math.random() * 60);
    const challengeTime = new Date();
    challengeTime.setHours(randomHour);
    challengeTime.setMinutes(randomMinute);

    // Calculate the time until the next challenge
    let timeUntilChallenge = startDate.getTime() + Math.floor(((currentTime - startDate) / (intervalInMinutes * 60 * 1000) + 1) * intervalInMinutes * 60 * 1000) - currentTime.getTime();

    // Schedule the challenge and the 10-minute warning
    challengeTimeoutId = setTimeout(() => {
      const challengeChannel = client.channels.cache.get(announcementChannelId);
      challengeChannel.send(selectedChallenge.challengeText);
      selectedChallenge.timeSent = new Date();

      // Schedule the 10-minute warning
      setTimeout(() => {
        if (activeChallenge === selectedChallenge && !activeChallenge.timeCompleted) {
          challengeChannel.send('Only 10 minutes left to complete the challenge!');
        }
      }, 20 * 60 * 1000);

      scheduleChallenge();
    }, timeUntilChallenge);
  } else {
    // Expire the active challenge, if there is one
    if (activeChallenge) {
      activeChallenge.timeCompleted = null;
      activeChallenge.challengeWonBy = null;
      activeChallenge.timeToComplete = null;
      activeChallenge = null;
      clearTimeout(challengeTimeoutId);
    }
    // If the current time is outside the start and end dates, schedule the next challenge for the start date
    const timeUntilStart = startDate.getTime() - currentTime.getTime();
    setTimeout(() => {
      scheduleChallenge();
    }, timeUntilStart);
  }
}

client.on('message', message => {
  // Ignore messages sent by the bot itself
  if (message.author.bot) {
    return;
  }

  // Check if the message is a challenge completion command
  if (message.content.startsWith('!challenge complete')) {
    // Check if the user has the Owner, Executive, or Admin role
    if (!message.member.roles.cache.some(role => role.name === 'Owner' || role.name === 'Executive' || role.name === 'Admin')) {
      message.reply('You do not have permission to complete challenges!');
      return;
    }
    // Check if there is an active challenge
    if (!activeChallenge) {
      message.reply('There is no active challenge!');
      return;
    }

    // Mark the active challenge as completed and record the completion time and winner
    activeChallenge.timeCompleted = new Date();

    // Set the challengeWonBy field based on the message content
    if (/^c(resselia)?$/i.test(message.content)) {
      activeChallenge.challengeWonBy = 'Cresselia';
      console.log('Challenge won by Cresselia');
    } else if (/^d(arkrai)?$/i.test(message.content)) {
      activeChallenge.challengeWonBy = 'Darkrai';
      console.log('Challenge won by Darkrai');
    } else {
      message.reply('Invalid challenge completion command!');
      return;
    }

    // Mark the active challenge as completed and record the completion time and winner
    activeChallenge.timeCompleted = new Date();

    // Set the challengeWonBy field based on the message content
    if (/^c(resselia)?$/i.test(message.content)) {
      activeChallenge.challengeWonBy = 'Cresselia';
      console.log('Challenge won by Cresselia');
    } else if (/^d(arkrai)?$/i.test(message.content)) {
      activeChallenge.challengeWonBy = 'Darkrai';
      console.log('Challenge won by Darkrai');
    } else {
      message.reply('Invalid challenge completion command!');
      return;
    }
  }

  activeChallenge.timeToComplete = activeChallenge.timeCompleted - activeChallenge.timeSent;
  message.reply(`Congratulations, ${activeChallenge.challengeWonBy} completed the challenge in ${activeChallenge.timeToComplete / 60000} minutes!`);
  clearTimeout(challengeTimeoutId);
  activeChallenge = null;

  // Save the updated state to the file
  saveState();
});

client.login(process.env.DISCORD_BOT_TOKEN);
