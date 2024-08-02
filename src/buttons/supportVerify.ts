import { ActionRowBuilder, type ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import type { InteractionAPI } from "../structures/command";

module.exports = {
    name: "supportVerify",
    callback: async (interaction: ButtonInteraction, api: InteractionAPI) => {
        for (const ticket in api.database.logs.activeTickets) {
            const properties = api.database.logs.activeTickets[ticket]
            if (properties.owner === interaction.user.id && properties.type === "support") {
                if (interaction.guild?.channels.cache.has(ticket)) {
                    interaction.reply({
                        content: "You already have an active ticket!",
                        ephemeral: true
                    });
                    return;
                };

                api.database.logs.expiredTickets[ticket] = properties;
                delete api.database.logs.activeTickets[ticket];
            }
        };

        const modal = new ModalBuilder()
            .setCustomId("support")
            .setTitle("Verification");

        const keyInput = new TextInputBuilder()
            .setCustomId("key")
            .setLabel("What is your CrackerLicense key?")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const agree = new TextInputBuilder()
            .setCustomId("agree")
            .setLabel("Indemnification statement accept. (Yes/No)")
            .setStyle(TextInputStyle.Short)
            .setValue('YES')
            .setPlaceholder("YES/NO")
            .setRequired(true);

        const row = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(keyInput);

        const row2 = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(agree);
        
        modal.addComponents(row, row2);
        await interaction.showModal(modal);
    }
}