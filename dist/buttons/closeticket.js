"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    name: "closeticket",
    callback: async (interaction, api) => {
        if (interaction.channel?.type !== discord_js_1.ChannelType.GuildText)
            return;
        const ticketInfo = api.database.logs.activeTickets[interaction.channelId];
        if (!ticketInfo) {
            interaction.reply({ content: "Ticket is already closed!", ephemeral: true });
            return;
        }
        ;
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
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle("Ticket closed")
            .setDescription(`Ticket closed by <@${interaction.user.id}>\nSaved transcript.`);
        let transcript = "";
        for (const message of ticketInfo.messages) {
            transcript += `${message}\n`;
        }
        const file = new discord_js_1.AttachmentBuilder(Buffer.from(transcript), { name: 'transcript.txt' });
        const ticketOwner = interaction.client.users.cache.get(ticketInfo.owner);
        let logEmbed;
        if (ticketInfo.type === "support") {
            logEmbed = new discord_js_1.EmbedBuilder()
                .setTitle("Support Ticket")
                .setDescription(`A ticket created by <@${ticketInfo.owner}>`)
                .addFields({ name: "Creation Date", value: `<t:${ticketInfo.creationDate}:d>` })
                .setColor(discord_js_1.Colors.Blue)
                .setFooter({ text: api.config.footerText, iconURL: api.config.footerUrl });
        }
        else {
            logEmbed = new discord_js_1.EmbedBuilder()
                .setTitle("Onboarding Ticket")
                .setDescription(`A ticket created by <@${ticketInfo.owner}>`)
                .addFields({ name: "Creation Date", value: `<t:${ticketInfo.creationDate}:d>` })
                .setColor(discord_js_1.Colors.Green)
                .setFooter({ text: api.config.footerText, iconURL: api.config.footerUrl });
        }
        const logChannel = interaction.client.channels.cache.get(api.config.logChannel);
        let logMessage;
        if (logChannel?.isTextBased()) {
            logMessage = await logChannel.send({ embeds: [logEmbed] });
            logChannel.send({ files: [file] });
        }
        const deleteButton = new discord_js_1.ButtonBuilder()
            .setCustomId("delete")
            .setLabel("Delete Ticket")
            .setEmoji("⛔")
            .setStyle(discord_js_1.ButtonStyle.Secondary);
        const row = new discord_js_1.ActionRowBuilder()
            .addComponents(deleteButton);
        interaction.reply({ embeds: [embed], components: [row] });
        ticketInfo.transcript = logMessage !== undefined ? logMessage.id : "None";
        interaction.channel.setName(`closed-${ticketOwner?.displayName}`);
        api.database.logs.expiredTickets[interaction.channelId] = ticketInfo;
        delete api.database.logs.activeTickets[interaction.channelId];
        api.saveData();
    }
};
