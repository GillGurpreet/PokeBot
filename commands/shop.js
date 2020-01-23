require('dotenv').config();
const Discord = require("discord.js");
const Users = require("../models/users.js"); // Database "users"
const prefix = process.env.PREFIX;

const itemList = {1: ["pokeballs", 200, pokeEmoji], 2: ["greatballs", 500, greatEmoji], 3: ["ultraballs", 1500, ultraEmoji], 4: ["masterballs", 250000, masterEmoji]};
var coinsNeeded = 0;

module.exports.run = async (bot, msg, args) => {
    const res = await Users.findOne({id: msg.author.id});
    if (!res) {
        msg.reply("No id found, catch some pokemon first!");
        return;
    }
    // shop
    if (args.length == 0) {
        await showShop(msg, msg.author.id);   
    } else if (args.length == 1) {
      // wrong command  
    } else if (args.length >= 2) {
        // shop buy {id}
        if (args[0] === "buy") {
            if (args.length >= 3) {
                amounts = args[2];
            }
            // let user buy it
            await userBuyItem(res, msg, buyId, amounts).then(success => {
                if (success) {
                   
                    // show success message
                    msg.reply("you bought **" + amounts + "x** " + emojiText + ` for <:PokeCoin:${pokecoinEmoji}> **${boughtAmount}** and have <:PokeCoin:${pokecoinEmoji}> **${haveLeft}** remaining.`);
                } else {
                    // show fail message
                    // msg.reply("SOMETHING WRONG LOL");
                }
            });
        }
    }
}

const showShop = async (msg, userID) => {
    let user = await Users.findOne({id: userID});

    let page = 1;
    let totalpage = 1;
    let desc = getShopDesc(page, user);
    let embedMsg = new Discord.RichEmbed()
        .setColor("#0099ff")
        .setFooter("GopiBot | Shop page " + page + "/" + totalpage)
        .setAuthor(`PokeMeow Shop`, `${msg.author.displayAvatarURL}`)
        .setTitle("Buy some items for your adventure!\n")
        .setDescription(desc);
    msg.channel.send(embedMsg);
}
const userBuyItem = async (user, msg, itemId, amounts) => {
    // check amounts is valid or not
    if (!isNumeric(amounts) || amounts <= 0) {
        msg.reply("please enter a valid amount.").then(m => m.delete(timeout));
        return false;
    }
    
    // total currency needed
    let amountneed = itemCost * amounts;
    // check if user has enough currency)
    if (user.currency < amountneed) {
        var userCurr = (amountneed).toLocaleString(undefined, {maximumFractionDigits:0});
        msg.reply(`you need <:PokeCoin:${pokecoinEmoji}> **${userCurr} PokeCoins** to buy those items!`).then(m => m.delete(timeout));;
        return false;
    }
    // if all true, add item to user items
    let obj = {};
    
    if (itemId <= 4) {
        if (itemName in user.items.balls) {
            // increment balls
            await Users.findOneAndUpdate({id: user.id},
                { $inc: obj },
                { useFindAndModify: false });
        }
    }
    return true;
}

function getShopDesc(page, user) {
    var userCurr = (user.currency).toLocaleString(undefined, {maximumFractionDigits:0});

    let topDesc = `**${user.username}'s PokeCoins**: <:PokeCoin:${pokecoinEmoji}> ${userCurr}\n\`\`Each ball has a different catch rate\n-> ${prefix}shop buy {id} {amount} to buy items\`\`\n═════════════════════\n`;
    let mainDesc = "";
    if (page == 1) {
        // pokeball, greatball, ultraball, masterball
        mainDesc = `\`\`1\`\` <:pokeball:${pokeEmoji}> \`\`Pokeball----------- 200\`\` <:PokeCoin:${pokecoinEmoji}>\n\`\`2\`\` <:greatball:${greatEmoji}> \`\`Greatball---------- 500\`\` <:PokeCoin:${pokecoinEmoji}>\n\`\`3\`\` <:ultraball:${ultraEmoji}> \`\`Ultraball-------- 1,500\`\` <:PokeCoin:${pokecoinEmoji}>\n\`\`4\`\` <:masterball:${masterEmoji}> \`\`Masterball----- 250,000\`\` <:PokeCoin:${pokecoinEmoji}>\n`;
    }
    let bottomDesc = `═════════════════════\n`;
    return topDesc + mainDesc + bottomDesc;
}

function isNumeric(num) {
    return !isNaN(num);
}

module.exports.help = {
    name: "shop",
    description: "Shop that lets you buy Pokeballs and other items",
    usage: `\`\`${prefix}shop {buy} {id} {amount}\`\``,
    aliases: [ "s", "shops", "pokemart", "mart" ]
}