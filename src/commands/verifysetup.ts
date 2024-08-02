import { SlashCommandBuilder, type CommandInteraction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits } from "discord.js";
import type { InteractionAPI } from "../structures/command";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("verifysetup")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription("Sends verification message"),
    async callback(interaction: CommandInteraction, api: InteractionAPI) {
        const embed = new EmbedBuilder()
            .setTitle("Cracker Services Verification")
            .setDescription("To access **Cracker Services**, you need to verify!\nClick on **Verify** button to get access to the server.")
            .setColor("#a158ff")
            .setFooter({text: api.config.footerText, iconURL: api.config.footerUrl});

        const supportButton = new ButtonBuilder()
            .setCustomId("verify")
            .setLabel("Verify")
            .setEmoji("✅")
            .setStyle(ButtonStyle.Success);
        
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(supportButton);

        interaction.channel?.send({
            embeds: [embed],
            components: [row]
        });

        interaction.reply({content: "Success.", ephemeral: true});
    }
};