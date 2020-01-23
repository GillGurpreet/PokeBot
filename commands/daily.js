require('dotenv').config();
const Discord = require("discord.js");
const prefix = process.env.PREFIX;
const colors = require("../json/colors.json");
const Users = require("../models/users.js"); // Database "users"

const day = 86400000;
//const day = 3000;

module.exports.run = async (bot, message, args) => {
    const user = await Users.findOne({id: message.author.id});
    if (!user) {
        message.reply(`catch a pokemon first using ${prefix}pokemon`);
        return;
    }
    var incDict = {}

    var setDict = {}
    setDict['daily.time'] = new Date();

    var rewardMsg = "";
    
    const testFlag = false;
    var currStreak = user.daily.streak;
    var nextDaily;

    const newDate = new Date();

    nextDaily = `\n:clock1: **|** Your next daily is in: **24H 0M 0S**`

    // If we're not testing, then go to normal behavior
    if (!testFlag) {
        // Check if they have used the daily command before (non-empty time)
        if (user.daily.time) {
        
            if (newDate.getTime() < diffDate) {
                message.reply(`you must wait :clock1: **${hours}H ${minutes}M ${seconds}S** until your next daily.`);
                return;
            }

            // If the difference between NOW and user's past daily time is >= 2days, reset
            const dailyReset = Math.abs(newDate - user.daily.time.getTime());
            if (dailyReset >= 2*day) {
                rewardMsg += `:ghost: *Your daily streak of **${currStreak}** has been reset!*\n`;
                user.daily.streak = 0;
                setDict['daily.streak'] = 1;
            } else {
                incDict['daily.streak'] = 1;
            }
        }
    }

    var randNum = ((user.daily.streak + 1) * 50) + 500;
    incDict['currency'] = randNum;
    incDict['stats.dailies'] = 1;
    incDict['daily.streak'] = user.daily.streak + 1;
    
    // Streak should be here since it can be reset by the user before this
    const streak = user.daily.streak + 1;

    var streakMsg = "";

    var streakMedal = ":medal:";

    await Users.updateOne(
        {id: user.id}, 
        {$inc: incDict, $set: setDict}, { useFindAndModify: false});

    rewardMsg += `**${user.username}** is on a ${streakMedal} **${user.daily.streak + 1} daily streak**!`;
    rewardMsg += `\n<:PokeCoin:666879070650236928> **|** Here are your daily **${randNum} PokeCoins**!`;    
    rewardMsg += streakMsg;
    rewardMsg += nextDaily;
    message.channel.send(rewardMsg);
}

module.exports.help = {
    name: "daily",
    description: "Gifts user their daily reward!",
    usage: `\`\`${prefix}daily\`\``,
    noalias: "No Aliases",
    aliases: []
}