require('dotenv').config();
const Discord = require("discord.js");
const prefix = process.env.PREFIX;
const colors = require("../json/colors.json");
const Users = require("../models/users.js"); 
const items = require("../json/items.json");

module.exports.run = async (bot, msg, args) => {
    msg.channel.send("Pokemon inventory command changed! Try ;box or ;pc");

    const user = await Users.findOne({id: msg.author.id});

    if (!user) {
        msg.reply(`catch a pokemon first using ${prefix}pokemon`);
        return;
    }

    // Currency formatting
    var pokeCoins = (user.currency).toLocaleString(undefined, {maximumFractionDigits:0});
    var voteCoins = `${user.votecoin ? (user.votecoin).toLocaleString(undefined, {maximumFractionDigits:0}) : 0}`;

    // Balls formatting
    var pokeBalls = (user.items.balls.pokeballs).toLocaleString(undefined, {maximumFractionDigits:0});
    var greatBalls = (user.items.balls.greatballs).toLocaleString(undefined, {maximumFractionDigits:0});
    var ultraBalls = (user.items.balls.ultraballs).toLocaleString(undefined, {maximumFractionDigits:0});
    var masterBalls = (user.items.balls.masterballs).toLocaleString(undefined, {maximumFractionDigits:0});

    // Special items formatting
    var shinyCharm = (user.items.shinycharm).toLocaleString(undefined, {maximumFractionDigits:0});

    let topdesc = `**Currencies**\n${items.PokeCoin} **${pokeCoins}**x Poke coins\n${items.votecoin} **${voteCoins}**x Vote coins \n\n`;
    let topdesc2 = `**Balls**\n${items.pokeball} **${pokeBalls}**x Pokeballs\n${items.greatball} **${greatBalls}**x Greatballs\n${items.ultraball} **${ultraBalls}**x Ultraballs\n${items.masterball} **${masterBalls}**x Masterballs\n\n`
    let topdesc3 = `**Special items**\n${items.shinycharm} **${shinyCharm}**x Shiny charms`
    const desc = topdesc + topdesc2 + topdesc3;

    let embedMsg = new Discord.RichEmbed()
    .setColor("#0099ff")
    .setFooter("PokeMeow 2020")
    .setAuthor(`${msg.author.username}'s item inventory`, `${msg.author.displayAvatarURL}`)
    .setDescription(desc);

    msg.channel.send(embedMsg);
}

module.exports.help = {
    name: "items",
    description: "Displays the items you own",
    usage: `\`\`${prefix}items\`\``,
    aliases: [ "item", "inv", "inventory", "invent" ]
}