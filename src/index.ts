import { Client, Collection, GatewayIntentBits, Events, REST, Routes, type RESTPostAPIChatInputApplicationCommandsJSONBody, EmbedBuilder, Colors, MessageType, PresenceUpdateStatus, Activity, ActivityType } from "discord.js";
import * as fs from "node:fs";
import * as config from "../config.json";
import type { ButtonModule, CommandModule, InteractionAPI, ModalModule } from "./structures/command";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildPresences] });
const commands: Collection<string, CommandModule> = new Collection();
const buttons: Collection<string, ButtonModule> = new Collection();
const modals: Collection<string, ModalModule> = new Collection();

const api: InteractionAPI = {
	config: undefined,
	database: undefined,
	saveData: undefined
};

api.database = require("../db.json");
api.config = config

const expiredEmbed = new EmbedBuilder()
	.setTitle("License Expired")
	.setDescription("Your **Cracker Support License** has been expired. You can purchase it again.")
	.setColor(Colors.Red)
	.setFooter({text: api.config.footerText, iconURL: api.config.footerUrl});

async function keyChecker() {
	const guild = client.guilds.cache.get(api.config.guildId);
	for (const key in api.database.keys) {
		const properties = api.database.keys[key];
		if (properties.licenseDuration === "perma") continue;
		if (properties.status === "disabled") continue;

		if ((Math.floor(Date.now()/ 1000) - properties.licenseDuration) >= 0) {
			api.database.keys[key].status = "disabled";
			const user = await client.users.fetch(properties.owner);
			if (user) {
				if (guild) {
					(await guild.members.fetch(user)).roles.remove(api.config.buyerRole, "License expired.")
				};

				user.send({embeds: [expiredEmbed]}).catch();
			}

			saveData();
		};
	};
};

function setupCommands() {
	{
		const dir = fs.readdirSync("./dist/commands");
		for (const file of dir) {
			if (!file.endsWith(".js")) return;
		
			const command: CommandModule = require(`./commands/${file}`);
			commands.set(command.data.name, command);
		};
	}
	
	{
		const dir = fs.readdirSync("./dist/buttons");
		for (const file of dir) {
			if (!file.endsWith(".js")) return;
		
			const button: ButtonModule = require(`./buttons/${file}`);
			buttons.set(button.name, button);
		};
	}

	{
		const dir = fs.readdirSync("./dist/modals");
		for (const file of dir) {
			if (!file.endsWith(".js")) return;
		
			const modal: ModalModule = require(`./modals/${file}`);
			modals.set(modal.name, modal);
		};
	}


	const rest = new REST().setToken(config.botToken);
	(async () => {
		try {
			const rawCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
			for (const command of commands) {
				rawCommands.push(command[1].data.toJSON());
			};

			await rest.put(
				Routes.applicationGuildCommands(config.clientId, config.guildId),
				{ body: rawCommands },
			);
		} catch (error) {
			console.error(error);
		};
	})();
};

client.once("ready", () => {
	setupCommands();
	client.user?.setActivity(api.config.status, {type: ActivityType.Watching});
	console.log("ok hot bot running, made by reptiled");
	api.saveData = saveData;
	setInterval(keyChecker, 600000);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) {
		if (interaction.isButton()) {
			const button = buttons.get(interaction.customId);
			if (!button) return;

			try {
				button.callback(interaction, api);
			} catch (err) {
				console.log("error, %d", err)
			}
		} else if (interaction.isModalSubmit()) {
			const modal = modals.get(interaction.customId);
			if (!modal) return;

			try {
				modal.callback(interaction, api);
			} catch (err) {
				console.log("error, %d", err)
			}
		};
		return;
	};

	const command  = commands.get(interaction.commandName);
	if (!command) {
		interaction.reply("womp womp");
		return;
	} 

	try {
		command.callback(interaction, api);
	} catch (err) {
		console.log("error, %d", err)
	}
})

client.on("messageCreate", async (interaction) => {
	if (interaction.channelId === api.config.generalChannel && interaction.author.id !== client.user?.id) {
		if (Math.round(Math.random() * 33) === 1) {
			interaction.reply(api.config.randomMessages[Math.floor(Math.random()*api.config.randomMessages.length)]);
		}
		return;
	};
	const ticketInfo = api.database.logs.activeTickets[interaction.channelId];
	if (!ticketInfo) return;

	ticketInfo.messages.push(`${interaction.author.displayName}: ${interaction.content} ${interaction.attachments.size !== 0 ? "HAS ATTACHMENT" : ""}`);

	saveData();
})

async function saveData() {
	fs.writeFile("./db.json", JSON.stringify(api.database, null, 4), (err) => {
		if (err) console.log(err);
	})
}


client.login(config.botToken);