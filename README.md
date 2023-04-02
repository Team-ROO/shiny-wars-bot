# Shiny Wars Bot

This is a bot for aiding with [ROO]'s Shiny War events.

## Background
This is an app that will schedule a challenge every `challengeInterval` (for example, every 1 minute). The  challenges won't be scheduled after the `endDate`. Challenges can be marked as complete by a user issuing the `!challenge complete {teamName}` command. The bot will then mark the challenge as complete, attribute the team with the completion, and schedule the next challenge within the next challenge window.

## Process

1. Load's the application's state
   1. The shape is an array of objects of this shape `{ "challengeText": "Challenge 1", "timeCompleted": null, "timeSent": null, "challengeWonBy": null, "timeToComplete": null}`
2. After the bot receives a message that starts with `!challenge start`, it will:
   1. Schedule the first challenge
3. When a challenge has been issued, the bot will:
   1. Listen for a message that starts with `!challenge complete {teamName}`
   2. Will mark the challenge as complete,
   3. attribute the team with the completion
   4. save the application's state
   5. schedule the next challenge within the next challenge window.
