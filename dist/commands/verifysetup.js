"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("verifysetup")
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
        .setDescription("Sends verification message"),
    async callback(interaction, api) {
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle("Cracker Services Verification")
            .setDescription("To access **Cracker Services**, you need to verify!\nClick on **Verify** button to get access to the server.")
            .setColor("#a158ff")
            .setFooter({ text: api.config.footerText, iconURL: api.config.footerUrl });
        const supportButton = new discord_js_1.ButtonBuilder()
            .setCustomId("verify")
            .setLabel("Verify")
            .setEmoji("✅")
            .setStyle(discord_js_1.ButtonStyle.Success);
        const row = new discord_js_1.ActionRowBuilder()
            .addComponents(supportButton);
        interaction.channel?.send({
            embeds: [embed],
            components: [row]
        });
        interaction.reply({ content: "Success.", ephemeral: true });
    }
};
