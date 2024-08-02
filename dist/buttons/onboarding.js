"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    name: "onboarding",
    callback: async function (interaction, api) {
        for (let ticket in api.database.logs["activeTickets"]) {
            const properties = api.database.logs["activeTickets"][ticket];
            if (properties["owner"] === interaction.user.id && properties["type"] === interaction.customId) {
                if (interaction.guild?.channels.cache.has(ticket)) {
                    interaction.reply({
                        content: "You already have an active ticket!",
                        ephemeral: true
                    });
                    return;
                }
                ;
                api.database.logs["expiredTickets"][ticket] = properties;
                delete api.database.logs["activeTickets"][ticket];
            }
        }
        ;
        let channel = await interaction.guild?.channels.create({
            name: `${interaction.customId}-${interaction.user.displayName}`,
            type: discord_js_1.ChannelType.GuildText,
            parent: api.config.categoryId,
            permissionOverwrites: [
                {
                    id: interaction.user.id,
                    allow: ["AddReactions", "ViewChannel", "SendMessages", "UseExternalEmojis", "AttachFiles", "EmbedLinks"]
                },
                {
                    id: api.config.supportRole,
                    allow: ["AddReactions", "ViewChannel", "SendMessages", "UseExternalEmojis", "AttachFiles", "EmbedLinks"]
                },
                {
                    id: interaction.guild.roles.everyone,
                    deny: ["ViewChannel", "SendMessages"]
                }
            ]
        });
        if (!channel)
            return;
        interaction.reply({ content: `Your ticket has been created! <#${channel.id}>`, ephemeral: true });
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(discord_js_1.Colors.Green)
            .setTitle("Onboarding Ticket")
            .setDescription("Support will be with you shortly.\nTo close this ticket react with 🔒")
            .setFooter({ text: api.config.footerText, iconURL: api.config.footerUrl });
        const button = new discord_js_1.ButtonBuilder()
            .setLabel("Close")
            .setCustomId("closeticket")
            .setEmoji("🔒")
            .setStyle(discord_js_1.ButtonStyle.Danger);
        const row = new discord_js_1.ActionRowBuilder()
            .addComponents(button);
        channel.send({
            content: `<@${interaction.user.id}>`,
            embeds: [embed],
            components: [row]
        });
        api.database.logs["activeTickets"][channel.id] = {
            "owner": interaction.user.id,
            "channel": channel.id,
            "type": interaction.customId,
            "creationDate": Math.floor(Date.now() / 1000),
            "messages": []
        };
        api.saveData();
    }
};
