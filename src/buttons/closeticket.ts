import { ButtonStyle, Colors, ButtonBuilder, EmbedBuilder, ActionRowBuilder, ChannelType, type ButtonInteraction, AttachmentBuilder, type Message } from "discord.js";
import type { InteractionAPI } from "../structures/command";

module.exports = {
    name: "closeticket",
    callback: async (interaction: ButtonInteraction, api: InteractionAPI) => {
        if (interaction.channel?.type !== ChannelType.GuildText) return;
			const ticketInfo = api.database.logs.activeTickets[interaction.channelId];
			if (!ticketInfo) {
				interaction.reply({content: "Ticket is already closed!", ephemeral:true});
				return;
			};

			interaction.channel?.permissionOverwrites.set([
				{
					id: ticketInfo.owner,
					deny: ["ViewChannel", "SendMessages"]
				},
				{
					id: interaction.guild?.roles.everyone,
					deny: ["ViewChannel", "SendMessages"]
				},
				{
					id: api.config.supportRole,
					allow: ["ViewChannel", "SendMessages"]
				},
			]);
				
			const embed = new EmbedBuilder()
				.setTitle("Ticket closed")
				.setDescription(`Ticket closed by <@${interaction.user.id}>\nSaved transcript.`)

			let transcript = ""
			for (const message of ticketInfo.messages) {
				transcript+= `${message}\n`;
			}

			const file = new AttachmentBuilder(Buffer.from(transcript), { name: 'transcript.txt' })
			
			const ticketOwner = interaction.client.users.cache.get(ticketInfo.owner);
			let logEmbed: EmbedBuilder; 
			
			if (ticketInfo.type === "support") {
				logEmbed = new EmbedBuilder()
					.setTitle("Support Ticket")	
					.setDescription(`A ticket created by <@${ticketInfo.owner}>`)
					.addFields({name: "Creation Date", value: `<t:${ticketInfo.creationDate}:d>`})
					.setColor(Colors.Blue)	
					.setFooter({text: api.config.footerText, iconURL: api.config.footerUrl});		
			} else {
				logEmbed = new EmbedBuilder()
					.setTitle("Onboarding Ticket")
					.setDescription(`A ticket created by <@${ticketInfo.owner}>`)
					.addFields({name: "Creation Date", value: `<t:${ticketInfo.creationDate}:d>`})
					.setColor(Colors.Green)
					.setFooter({text: api.config.footerText, iconURL: api.config.footerUrl});
			}														
				
			const logChannel = interaction.client.channels.cache.get(api.config.logChannel);
			let logMessage: Message | undefined;
			if (logChannel?.isTextBased()) {
				logMessage = await logChannel.send({embeds: [logEmbed]});
				logChannel.send({files: [file]});
			}

			const deleteButton = new ButtonBuilder()
				.setCustomId("delete")
				.setLabel("Delete Ticket")
				.setEmoji("⛔")
				.setStyle(ButtonStyle.Secondary);

			const row = new ActionRowBuilder<ButtonBuilder>()
				.addComponents(deleteButton);

			interaction.reply({embeds: [embed], components: [row]});

			ticketInfo.transcript = logMessage !== undefined ? logMessage.id : "None";
			interaction.channel.setName(`closed-${ticketOwner?.displayName}`);
			api.database.logs.expiredTickets[interaction.channelId] = ticketInfo;
			delete api.database.logs.activeTickets[interaction.channelId];

			api.saveData();
        }
};