require('dotenv').config();
const Discord = require("discord.js");
const prefix = process.env.PREFIX;
const colors = require("../json/colors.json");
const Users = require("../models/users.js"); // Database "users"

module.exports.run = async (bot, message, args) => {
    const user = await Users.findOne({id: message.author.id});
    if (!user) {
        message.reply("catch a pokemon using the pokemon command first!");
        return;
    }

    var currencyString = (user.currency).toLocaleString(undefined, {maximumFractionDigits:0});

    message.channel.send(`<:PokeCoin:666879070650236928> **${user.username}**, you currently have **${currencyString} PokeCoins**!`);
}

module.exports.help = {
    name: "coins",
    description: "Tells you how many PokeCoins you have.",
    usage: `\`\`${prefix}coins\`\``,
    aliases: [ "currency", "pokecoins", "balance" ]
}