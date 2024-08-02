import { SlashCommandBuilder, type CommandInteraction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits } from "discord.js";
import type { InteractionAPI } from "../structures/command";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription("Sends ticket message"),
    async callback(interaction: CommandInteraction, api: InteractionAPI) {
        const embed = new EmbedBuilder()
            .setTitle("Cracker Services Ticket")
            .setDescription(api.config.message)
            .setColor("#a158ff")
            .setFooter({text: api.config.footerText, iconURL: api.config.footerUrl});

        const supportButton = new ButtonBuilder()
            .setCustomId("supportVerify")
            .setLabel("Support")
            .setEmoji("📩")
            .setStyle(ButtonStyle.Primary);

        const purchaseButton = new ButtonBuilder()
            .setCustomId("onboardingVerify")
            .setLabel("Onboarding")
            .setEmoji("🤝")
            .setStyle(ButtonStyle.Success);
        
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(supportButton, purchaseButton);


        const message = await interaction.channel?.send({
            embeds: [embed],
            components: [row]
        });
        api.database.channel = message?.channelId;
        api.database.message = message?.id
        api.saveData();

        interaction.reply({content: "Success.", ephemeral: true});
    }
};