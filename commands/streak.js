require('dotenv').config();
const Discord = require("discord.js");
const prefix = process.env.PREFIX;
const colors = require("../json/colors.json");
const Users = require("../models/users.js"); // Database "users"

module.exports.run = async (bot, message, args) => {
    const user = await Users.findOne({id: message.author.id});

    // Get user streaks 
    const streaks = user.streaks;

    var finalText = "";

    // Append to final text
    finalText += `**General Streaks**\n`;
    finalText += catchStreak;
    finalText += dailyStreak;
    finalText += commonText;
    finalText += uncommonText;

    let embed = new Discord.RichEmbed()
        .setAuthor(`${message.author.username}'s Streaks`, message.author.displayAvatarURL)
        .setColor(colors.cyan)
        .setTitle("Displays your current streaks")
        .setFooter("A Pokemon breakout resets the respective streak.")
        .setDescription(finalText);

    message.channel.send(embed);
}

module.exports.help = {
    name: "streak",
    description: "Displays your streaks!",
    usage: `\`\`${prefix}streak\`\``,
    aliases: [ "streaks" ]
}