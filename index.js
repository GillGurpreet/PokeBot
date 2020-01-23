require('dotenv').config();

const token = process.env.TOKEN;
const prefix = process.env.PREFIX;

const Discord = require('discord.js');
const mongoose = require("mongoose");
const fs = require("fs");

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

// Checking for commands in commands folder.
fs.readdir("./commands", (err, files) => {
    if (err) console.log(err);

    // Find command file names
    let jsfile = files.filter(f => f.split(".").pop() === "js");
    if (jsfile.length <= 0) {
        console.log("Could not find commands.");
        return;
    }

    // Prints each command name when loaded
    jsfile.forEach((file, i) => {
        let props = require(`./commands/${file}`);
        console.log(`${file} loaded!`);
        client.commands.set(props.help.name, props);
        props.help.aliases.forEach(alias => {
            client.aliases.set(alias, props.help.name);
        });
    });
});

let db = mongoose.connection;

client.mongoose = require('./utils/mongoose');

client.on('ready', () => {
    console.log('Bot is online!');
})

// Pokemon cooldown timer
var cooldowns = {};
var minute = 700;
var hour = minute * 1;

client.on('message', async (msg) => {
    if(msg.author.bot) return;
    if(msg.channel.type === "dm") return;
    if(!msg.content.startsWith(prefix)) return;

    // Cooldown for all messages starting with the prefix
    var cooldownOn = true;
    var commandSplit = msg.content;
    var initialCommand = commandSplit.substring(1).split(" ")[0];

    let messageArray = msg.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);

    // Run the command
    let commandfile = client.commands.get(cmd.slice(prefix.length)) || client.commands.get(client.aliases.get(cmd.slice(prefix.length)));
    if (commandfile) commandfile.run(client, msg, args);
})

client.mongoose.init();
client.login(token);
