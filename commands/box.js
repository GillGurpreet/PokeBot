require('dotenv').config();
const Discord = require("discord.js");
const Users = require("../models/users.js"); // Database "users"
const prefix = process.env.PREFIX;

module.exports.run = async (bot, msg, args) => {
    const res = await Users.findOne({id: msg.author.id});
    if (!res) {
        msg.reply(`catch a pokemon first using ${prefix}pokemon`);
        return;
    }
    let userpokemon = res.pokemon;
    if (!userpokemon) {
        msg.reply(`catch a pokemon first using ${prefix}pokemon`);
        return;
    }
    userpokemon = Object.entries(userpokemon);
    var newArray = [];
    userpokemon.forEach(entry => { 
        newArray.push(entry[1]);
    });

    await showUserPokemon(msg, msg.author.id, newArray);   
}

const showUserPokemon = async (msg, userID, userpokemon) => {
    userpokemon.sort(compareValues('date', 'desc'));
    let pokemons = await pokemonPagination(userpokemon, page, limit);
    let sortFooter = "\nSorted by: Recently Caught";

    // Create embed to display user's pokemon in pages
    let embedMsg = new Discord.RichEmbed()
        .setColor("#0099ff")
        .setFooter("GopiBot | Inventory page " + page + "/" + totalpage + sortFooter)
        .setAuthor(`${msg.author.username}'s inventory`, `${msg.author.displayAvatarURL}`);
    
    // Build pokemon inventory message
    embedMsg = await pokemonDescription(pokemons, embedMsg);
    
    msg.channel.send(embedMsg).then(m => {
        m.react('⬅️').then(r => {
            m.react('➡️').then(r => {
                m.react('🔁');
                let sortCount = 0;
                const leftFilter = (reaction, user) => reaction.emoji.name === '⬅️' && user.id === msg.author.id;
                const rightFilter = (reaction, user) => reaction.emoji.name === '➡️' && user.id === msg.author.id;
                const sortingFilter = (reaction, user) => reaction.emoji.name === '🔁' && user.id === msg.author.id;
                // below are the time that the user can react to the list
                const backwards = m.createReactionCollector(leftFilter, { time: 60000 });
                const forwards = m.createReactionCollector(rightFilter, { time: 60000 });
                const sorting = m.createReactionCollector(sortingFilter, { time: 60000 });

                forwards.on('collect', r => {
                    pokemonPagination(userpokemon, page+1, limit).then(pokemons => {
                        if (pokemons.length == 0) return;
                        page += 1;
                        pokemonDescription(pokemons, embedMsg).then(desc => {
                            newEmbedMsg = updateFields(embedMsg, page, totalpage, sortFooter);
                            m.edit(newEmbedMsg);
                        });  
                    });
                    
                });
                sorting.on('collect', r => {
                    sortCount = (sortCount + 1) % 4;
                    // sort by recently caught: count = 0
                    // sort by pokemon rarity: count = 1
                    // sort by pokemon number: count = 2
                    // sort by pokemon name: count = 3
                    if (sortCount == 1) {
                        userpokemon = categorizePokemonByRarity(userpokemon);
                        sortFooter = "\nSorted by: Rarity";
                    }
                    
                    // edit the message with sort
                    pokemonPagination(userpokemon, page, limit).then(pokemons => {
                        // Build pokemon inventory message
                        pokemonDescription(pokemons, embedMsg).then(emsg => {
                            // Create embed to display user's pokemon in pages
                            emsg = updateFields(emsg, page, totalpage, sortFooter);
                            m.edit(emsg);
                        });
                    });
                });
            });
        });
    }
    );
}

const pokemonPagination = async (userpokemon, page, limit) => {
    // page starting from 1
    return userpokemon.slice(limit*(page-1), limit*page);
}

function categorizePokemonByRarity(userpokemon) {
    let dict = {"Common": [], "Uncommon": [], "Rare": [], "SuperRare": [], "Legendary": [], "Shiny": []};
    userpokemon.forEach(p => {
        let temp = dict[p.rarity];
        temp.push(p);
    });

    let newuserpokemon = dict["Shiny"].concat(dict["Legendary"], dict["SuperRare"],dict["Rare"],dict["Uncommon"],dict["Common"]);
    return newuserpokemon;
}

module.exports.help = {
    name: "box",
    description: "Shows a list of your current pokemon",
    usage: `\`\`${prefix}box\`\``,
    aliases: [ "pc", "mypokemon", "mypoke" ]
}