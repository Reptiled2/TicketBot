"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("setup")
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
        .setDescription("Sends ticket message"),
    async callback(interaction, api) {
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle("Cracker Services Ticket")
            .setDescription(api.config.message)
            .setColor("#a158ff")
            .setFooter({ text: api.config.footerText, iconURL: api.config.footerUrl });
        const supportButton = new discord_js_1.ButtonBuilder()
            .setCustomId("supportVerify")
            .setLabel("Support")
            .setEmoji("📩")
            .setStyle(discord_js_1.ButtonStyle.Primary);
        const purchaseButton = new discord_js_1.ButtonBuilder()
            .setCustomId("onboardingVerify")
            .setLabel("Onboarding")
            .setEmoji("🤝")
            .setStyle(discord_js_1.ButtonStyle.Success);
        const row = new discord_js_1.ActionRowBuilder()
            .addComponents(supportButton, purchaseButton);
        const message = await interaction.channel?.send({
            embeds: [embed],
            components: [row]
        });
        api.database.channel = message?.channelId;
        api.database.message = message?.id;
        api.saveData();
        interaction.reply({ content: "Success.", ephemeral: true });
    }
};
