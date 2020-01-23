require('dotenv').config();
const Discord = require("discord.js");
const prefix = process.env.PREFIX;
const colors = require("../json/colors.json");
const Users = require("../models/users.js"); 
const items = require("../json/items.json");
const rarityList = require("../json/rarityList.json");

const pokeArray = require("../json/pokeNames.json");

let gameTotalPokemon = 151;

module.exports.run = async (bot, msg, args) => {
    const user = await Users.findOne({id: msg.author.id});

    if (!user) {
        msg.reply(`catch a pokemon first using ${prefix}pokemon`);
        return;
    }

    // User just wants to see their pokedex
    if (args.length == 0) {
        var totalPokemon = 0;
        var allPokemonKeys = Object.keys(user.pokemon);
        // Get total pokemon based off user.pokemon object
        allPokemonKeys.forEach(nextPokeKey => {
            if (user.pokemon[nextPokeKey]) {
                totalPokemon += user.pokemon[nextPokeKey].count;
            }
        });
        
        let page = 1;
        let limit = 10;
        let totalpage = Math.ceil((gameTotalPokemon) / limit);
        let is_reverse = false;
    
        let totalUniquePokemon = Object.keys(user.pokemon).length;
    
        var dexTitle = "Complete your Pokedex!";
    
        if (totalUniquePokemon == gameTotalPokemon) {
            dexTitle = "You completed your Pokedex!";
        }
    
        // Create embed to display user's pokedex
        let embedMsg = new Discord.RichEmbed()
            .setColor("#0099ff")
            .setTitle(`${dexTitle}`)
            .setFooter(`Total Pokemon: ${totalPokemon}\nUnique Pokemon: ${totalUniquePokemon}/${gameTotalPokemon}`)
            .setAuthor(`${msg.author.username}'s Pokedex`, `${msg.author.displayAvatarURL}`);
    
        embedMsg = await paginateData(user, page, limit, embedMsg);
    
        msg.channel.send(embedMsg).then(m => {
            m.react('⬅️').then(r => {
                m.react('➡️').then(r => {
                    m.react('🔁').then(r => {
                        const leftFilter = (reaction, user) => reaction.emoji.name === '⬅️' && user.id === msg.author.id;
                        const rightFilter = (reaction, user) => reaction.emoji.name === '➡️' && user.id === msg.author.id;
                        const revFilter = (reaction, user) => reaction.emoji.name === '🔁'&& user.id === msg.author.id;
                        // below are the time that the user can react to the list
                        const backwards = m.createReactionCollector(leftFilter, { time: 60000 });
                        const forwards = m.createReactionCollector(rightFilter, { time: 60000 });
                        const reverse = m.createReactionCollector(revFilter, { time: 60000 });
                        backwards.on('collect', async r => {
                            if (!is_reverse) {
                                if (page === 1) return;
                            }
                            let tmppage = page - 1;
                            if (is_reverse) {
                                tmppage = page + 1;
                                if (tmppage == totalpage + 1) {
                                    return;
                                }
                            }
                            newEmbedMsg = await paginateData(user, tmppage, limit, embedMsg, is_reverse);
                            if (newEmbedMsg !== ``) {
                                m.edit(newEmbedMsg);
                                page = tmppage;
                            }
                        });
                    });
                });
            });
        });
    } else if (args.length <= 2) {
        var argNum;
        var longestPokemonLength = 20;

        if (args[0].length >= longestPokemonLength) {
            msg.reply(`please enter a valid Pokemon name or id!`);
            return;
        }
        try {
            var stringComp = String(args[0]).toLowerCase();
            argNum = Number(args[0]);
            stringComp = stringComp[0].toUpperCase() + stringComp.slice(1);
            var stringBool = pokeArray.includes(stringComp);
            // We have an integer
            if ((Number.isInteger(argNum) && argNum > 0) || stringBool) {
                // User entered pokemon name
                if (stringBool) {
                    if (isShiny) {
                        argNum = pokeArray.indexOf(stringComp) + 1000;
                    } else {
                        argNum = pokeArray.indexOf(stringComp);
                    }
                }
                if (argNum >= 1000) isShiny = true;


                if (argNum >= 1000) {
                    // Shiny not in game
                    if (!rarityList.shinyArray.includes(argNum)) {
                        if (pokeArray[argNum]) {
                            // Shiny check arg num
                            msg.reply(`**${isShiny ? "Shiny " + pokeArray[argNum] : pokeArray[argNum]}** is not in the game yet!`);
                            return;
                        } else {
                            msg.reply(`that Pokemon is not in the game yet!`);
                            return;
                        }

                    }
                }

                // Check if the name exists and if it's within the bounds of our game
                if ((pokeArray[argNum] !== "" && argNum <= gameTotalPokemon) || (rarityList.shinyArray.includes(argNum))) {
                    var rarity = "";
                    var rarityEmoji = "";
                    var pokeName = pokeArray[argNum];
                    if (rarityList.commonArray.includes(argNum)) {
                        rarity = "Common";
                        rarityEmoji = items.common;
                    } 
                    // Set information we already know from user
                    var splitName = pokeName.split(" ");
                    if (splitName.length > 1) {
                        pokeName = splitName[1];
                    }

                    var pokeNumber = argNum;
                    var lowerName = String(pokeName).toLowerCase();
                    var pokeGif = "https://play.pokemonshowdown.com/sprites/xyani/" + lowerName + ".gif";
                    var owned = 0;
                    var encountered = 0;
                    var shiniesOwned = 0;
                    // Check if encountered or not
                    if (user.pokedex[argNum]) {
                        owned = user.pokedex[argNum].caught;
                        encountered = user.pokedex[argNum].encountered;
                        if (user.pokedex[argNum].shinyCaught) {
                            shiniesOwned = user.pokedex[argNum].shinyCaught;
                        }
                    }
                    
                    var description = "";

                    var groupText = 'pokedex.' + pokeNumber + '.caught';
                    var sumText = '$pokedex.' + pokeNumber + '.caught';

                    var obj = { };
                    obj["$sum"] = sumText;

                    var totalInGame = 0;

                    // Get the total of that pokemon in the game, as well as user's total
                    // Query returns result of all user's who have the pokemon.
                    const s = await Users.aggregate([
                        { $match: { [groupText] : {$gt: 0} }},
                        {$group: { _id: "$username", "total" : obj }}
                    ], (err, res) => {
                        if (err) {
                            throw err;
                        }
                        res.forEach(x => {
                            totalInGame += x.total;
                        })

                        // res shows username and total of that pokemon.

                        // Create embed to display catch screen
                        const embedMsg = new Discord.RichEmbed()
                        .setImage(`${pokeGif}`)
                        .addField("Name", `**${pokeName}**`,true)
                        .addField("Dex #", `${items.pokedex} ${pokeNumber}`,true)
                        .addField("Rarity", `${rarityEmoji}`, true)
                        .addField("Ingame", `:earth_americas: ${totalInGame}`, true);

                        msg.channel.send(embedMsg);
                    });
                }
            } else {
                msg.reply(`could not find **${isShiny ? "Shiny" : ""} ${stringComp}** in the Pokedex!`);
                return;
            }
        } catch (e) {
            console.log(e);
            return e;
        }
    }
}

const paginateData = async (user, page, limit, embedMsg, reverse) => {
    let pokeDesc = ``;
    //pokeDesc += `${items.dexcaught} = Captured\n${items.dexuncaught} = Seen\n${items.empty} = Not seen\n`;

    let start = ((page-1) * limit) + 1;
    let end = (page * limit) + 1;
    for (var i = (reverse? end : start); (reverse? i > start : i < end); (reverse? i-- : i++)) {
        // Number spacing
        var space = 1;
        var shinyCaught = 0;
        var pokeName = pokeArray[i];
        if (user.pokedex[i].shinyCaught) {
            shinyCaught = user.pokedex[i].shinyCaught;
        }

        // Pokemon name changes
        if (pokeName == "Nidoranf") {
            pokeName = "Nidoran (F)";
        } else if (pokeName = "Nidoranm") {
            pokeName = "Nidoran (M)";
        }
        
        // Out of range
        if (!user.pokedex[i]) {
            break;
        }
        var dexEmojiCond = user.pokedex[i].encountered >= 1 ? items.dexuncaught : items.empty;
        if (user.pokedex[i].caught >= 1) {
            dexEmojiCond = items.dexcaught;
        }

        //var pkmnName = String(pokeArray[i]).toLowerCase();
        //var pokemonIcon = "https://raw.githubusercontent.com/msikma/pokesprite/master/icons/pokemon/regular/" + pkmnName + ".png";

        pokeDesc += `\`\`${newnumber}\`\` ${dexEmojiCond} ${pokeArray[i]} ${shinyCaught >= 1 ? `${items.sparkles}` : "" }\n`;
    }

    if (pokeDesc == ``) {
        return;
    }

    embedMsg.setDescription(pokeDesc);
    return embedMsg;
}

module.exports.help = {
    name: "pokedex",
    description: "Tracks which pokemon you've caught!",
    usage: `\`\`${prefix}pokedex\`\` or \`\`${prefix}pokedex {id}\`\` or \`\`${prefix}pokedex {pokemonname}\`\``,
    aliases: [ "dex", "pdex" ]
}