require('dotenv').config();
const Discord = require("discord.js");
const Users = require("../models/users.js");
const prefix = process.env.PREFIX;
const colors = require("../json/colors.json");
const catchquests = require("../json/quests/catchquests.json");
const items = require("../json/items.json");

module.exports.run = async (bot, message, args) => {
    const user = await Users.findOne({id: message.author.id});
    if (!user) {
        message.reply(`catch a pokemon first using ${prefix}pokemon`);
        return;
    }

    var firstQuest = false;
    // Add quest if user does not already have it, and if they have less than 3 quests.
    if (!user.quests) {
        user.quests = { completed: [], nextQuest: new Date(), totalCompleted: 0, questOrder: []};
        firstQuest = true;
    }

    // Timer for getting new quests is 1 hour since you last got your previous
    var day = 3600000;
    var newDate = new Date();
    var userNextQuestTime = user.quests.nextQuest;
 

    if (nextQuestAvailable) {
        [newQuestDict, newQuest] = await addQuest(user, user.quests);
    }

    var desc = "";
    // If we could add a quest to user, do it
    if (newQuestDict && nextQuestAvailable) {
        // Get desc by passing in new quests
        desc = getDesc(newQuestDict, newQuestDict.questOrder);

        // Set next quest date for user
        newQuestDict["nextQuest"] = new Date();

        await Users.updateOne(
            {id: user.id},
            {$set: {'quests': newQuestDict}},
            { useFindAndModify: false});
    } else {
        // Get the desc from current quests, since no more can be added
        desc = getDesc(user.quests, user.quests.questOrder);
        if (nextQuestAvailable) {
            embedMsg.setFooter(`Your next quest is available!`);
        }
    }

    // Set desc
    embedMsg.setDescription(desc);
    message.channel.send(embedMsg);
}

// Writes the description for quest display
function getDesc (dict, arrayOrder) {
    var desc = "";
    var counter = 1;
    arrayOrder.forEach(key => {
        // Check if the key is a quest number
        if (!isNaN(key)){
            var quest = dict[key];
            desc += `**${counter}. ${quest.description}**\n > :moneybag: \`\`Rewards:\`\` `;

            // Go through each quest reward and add it to the description
            for (var i = 0; i < quest.reward.length; i++) {
                var reward = quest.reward[i];
                // Clean reward amount for text display
                var rewardAmount = (reward.amount).toLocaleString(undefined, {maximumFractionDigits:0});
            }
        }
    })

    return desc;
}

const addQuest = async(user, questDict) => {
    // Check how many quests the user has. questTotal - 2 is actual number.
    var questsTotal = Object.keys(questDict).length;
    // 2 extra fields with the quests. Ignore them.
    var totalFields = 7;

    if (questsTotal < totalFields) {
        // Give user random quest

        questDict[randNum]["reward"] = newRewards;
        // Maintain ordering
        questDict.questOrder.push(randNum);
        console.log("quest given successfully");
        return [questDict, questDict[randNum]];
    } else {
        return undefined, "";
    }
}

module.exports.help = {
    name: "quests",
    description: "Assigns you quests for rewards!",
    usage: `\`\`${prefix}quests\`\``,
    aliases: [ "quest" ]
}