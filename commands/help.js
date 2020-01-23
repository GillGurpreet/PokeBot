require('dotenv').config();
const Discord = require("discord.js");
const prefix = process.env.PREFIX;
const colors = require("../json/colors.json");

module.exports.run = async (bot, message, args) => {
    if (args[0] == "help") return message.channel.send(`Please use ${prefix}help instead`);

    if (args[0]) {
        // Check if the command exists. If it does, send a personalized command help to users.
        let command = args[0];
        if (bot.commands.has(command)) {
            command = bot.commands.get(command);
            
            var commandName = String(command.help.name[0]).toUpperCase() + String(command.help.name).slice(1);

            var descString = `:robot: The bot prefix is: ${prefix}\n\n**Command:** ${prefix}${command.help.name}\n**Description:** ${command.help.description || "No Description"}\n**Aliases:** ${command.help.noalias || command.help.aliases}\n\n**Command Usage:** ${command.help.usage || "No usage"}`;

            var embed = new Discord.RichEmbed()
            .setColor(colors.cyan)
            .setTitle(`${commandName} command`)
            .setAuthor("PokeMeow HELP", message.guild.iconURL)
            .setDescription(descString);
            message.channel.send(embed);
        } else {
            message.channel.send(`${message.author.username}, **${message}** is not a command! Try **${prefix}help** instead.`)
            .then(m => m.delete(10000));
        }
    }

    // No argument provided, send general help command
    if (!args[0]) {
        let embed = new Discord.RichEmbed()
        .setAuthor("Help Command", message.guild.iconURL)
        .setColor(colors.red)
        .setDescription(`${message.author.username} check your DMs!`);

        let Sembed = new Discord.RichEmbed()
        .setColor(colors.cyan)
        .setAuthor("PokeMeow HELP", message.guild.iconURL)
        .setThumbnail(bot.user.displayAvatarURL)
        .setTimestamp()
        .setDescription(`These are the available commands for PokeMeow!\n\n:robot: The bot prefix is: ${prefix}`)
        .addField('Commands:', "``pokemon`` ``shop`` ``box`` ``daily`` ``quests`` ``pokedex``\n``streaks`` ``coins`` ``help``")
        .setFooter("PokeMeow 2020", bot.user.displayAvatarURL);
        //message.channel.send(embed).then(m => m.delete(10000));
        message.channel.send(Sembed);
    }
}

module.exports.help = {
    name: "help",
    description: "Helps you solve all of your issues!",
    usage: `\`\`${prefix}help\`\``,
    aliases: [ "commands", "commandhelp", "info"]
}