const Discord = require('discord.js');
require('dotenv').config();

const client = new Discord.Client();
const announcementChannelId = process.env.ANNOUNCEMENT_CHANNEL_ID;

const startDate = new Date('2023-04-02T22:00:00Z');
const endDate = new Date('2023-04-16T21:00:00Z');

const challenges = [
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

let activeChallenge = null;
let challengeTimeoutId = null;

client.once('ready', () => {
  console.log('Bot is online!');
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
    let timeUntilChallenge = challengeTime.getTime() - currentTime.getTime();
    if (timeUntilChallenge < 0) {
      // If the challenge time is in the past, schedule it for the next day instead
      timeUntilChallenge += 24 * 60 * 60 * 1000;
    }

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

    activeChallenge.timeToComplete = activeChallenge.timeCompleted - activeChallenge.timeSent;
    message.reply(`Congratulations, ${activeChallenge.challengeWonBy} completed the challenge in ${activeChallenge.timeToComplete / 60000} minutes!`);
    clearTimeout(challengeTimeoutId);
    activeChallenge = null;
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
