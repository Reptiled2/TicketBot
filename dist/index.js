"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const fs = __importStar(require("node:fs"));
const config = __importStar(require("../config.json"));
const client = new discord_js_1.Client({ intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.DirectMessages, discord_js_1.GatewayIntentBits.MessageContent, discord_js_1.GatewayIntentBits.GuildMessages, discord_js_1.GatewayIntentBits.GuildPresences] });
const commands = new discord_js_1.Collection();
const buttons = new discord_js_1.Collection();
const modals = new discord_js_1.Collection();
const api = {
    config: undefined,
    database: undefined,
    saveData: undefined
};
api.database = require("../db.json");
api.config = config;
const expiredEmbed = new discord_js_1.EmbedBuilder()
    .setTitle("License Expired")
    .setDescription("Your **Cracker Support License** has been expired. You can purchase it again.")
    .setColor(discord_js_1.Colors.Red)
    .setFooter({ text: api.config.footerText, iconURL: api.config.footerUrl });
async function keyChecker() {
    const guild = client.guilds.cache.get(api.config.guildId);
    for (const key in api.database.keys) {
        const properties = api.database.keys[key];
        if (properties.licenseDuration === "perma")
            continue;
        if (properties.status === "disabled")
            continue;
        if ((Math.floor(Date.now() / 1000) - properties.licenseDuration) >= 0) {
            api.database.keys[key].status = "disabled";
            const user = await client.users.fetch(properties.owner);
            if (user) {
                if (guild) {
                    (await guild.members.fetch(user)).roles.remove(api.config.buyerRole, "License expired.");
                }
                ;
                user.send({ embeds: [expiredEmbed] }).catch();
            }
            saveData();
        }
        ;
    }
    ;
}
;
function setupCommands() {
    {
        const dir = fs.readdirSync("./dist/commands");
        for (const file of dir) {
            if (!file.endsWith(".js"))
                return;
            const command = require(`./commands/${file}`);
            commands.set(command.data.name, command);
        }
        ;
    }
    {
        const dir = fs.readdirSync("./dist/buttons");
        for (const file of dir) {
            if (!file.endsWith(".js"))
                return;
            const button = require(`./buttons/${file}`);
            buttons.set(button.name, button);
        }
        ;
    }
    {
        const dir = fs.readdirSync("./dist/modals");
        for (const file of dir) {
            if (!file.endsWith(".js"))
                return;
            const modal = require(`./modals/${file}`);
            modals.set(modal.name, modal);
        }
        ;
    }
    const rest = new discord_js_1.REST().setToken(config.botToken);
    (async () => {
        try {
            const rawCommands = [];
            for (const command of commands) {
                rawCommands.push(command[1].data.toJSON());
            }
            ;
            await rest.put(discord_js_1.Routes.applicationGuildCommands(config.clientId, config.guildId), { body: rawCommands });
        }
        catch (error) {
            console.error(error);
        }
        ;
    })();
}
;
client.once("ready", () => {
    setupCommands();
    client.user?.setActivity(api.config.status, { type: discord_js_1.ActivityType.Watching });
    console.log("ok hot bot running, made by reptiled");
    api.saveData = saveData;
    setInterval(keyChecker, 600000);
});
client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) {
        if (interaction.isButton()) {
            const button = buttons.get(interaction.customId);
            if (!button)
                return;
            try {
                button.callback(interaction, api);
            }
            catch (err) {
                console.log("error, %d", err);
            }
        }
        else if (interaction.isModalSubmit()) {
            const modal = modals.get(interaction.customId);
            if (!modal)
                return;
            try {
                modal.callback(interaction, api);
            }
            catch (err) {
                console.log("error, %d", err);
            }
        }
        ;
        return;
    }
    ;
    const command = commands.get(interaction.commandName);
    if (!command) {
        interaction.reply("womp womp");
        return;
    }
    try {
        command.callback(interaction, api);
    }
    catch (err) {
        console.log("error, %d", err);
    }
});
client.on("messageCreate", async (interaction) => {
    if (interaction.channelId === api.config.generalChannel && interaction.author.id !== client.user?.id) {
        if (Math.round(Math.random() * 33) === 1) {
            interaction.reply(api.config.randomMessages[Math.floor(Math.random() * api.config.randomMessages.length)]);
        }
        return;
    }
    ;
    const ticketInfo = api.database.logs.activeTickets[interaction.channelId];
    if (!ticketInfo)
        return;
    ticketInfo.messages.push(`${interaction.author.displayName}: ${interaction.content} ${interaction.attachments.size !== 0 ? "HAS ATTACHMENT" : ""}`);
    saveData();
});
async function saveData() {
    fs.writeFile("./db.json", JSON.stringify(api.database, null, 4), (err) => {
        if (err)
            console.log(err);
    });
}
client.login(config.botToken);
