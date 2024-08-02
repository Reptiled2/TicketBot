"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    name: "onboardingVerify",
    callback: async (interaction, api) => {
        for (const ticket in api.database.logs.activeTickets) {
            const properties = api.database.logs.activeTickets[ticket];
            if (properties.owner === interaction.user.id && properties.type === "onboarding") {
                if (interaction.guild?.channels.cache.has(ticket)) {
                    interaction.reply({
                        content: "You already have an active ticket!",
                        ephemeral: true
                    });
                    return;
                }
                ;
                api.database.logs.expiredTickets[ticket] = properties;
                delete api.database.logs.activeTickets[ticket];
            }
        }
        ;
        const modal = new discord_js_1.ModalBuilder()
            .setCustomId("onboarding")
            .setTitle("Verification");
        const agree = new discord_js_1.TextInputBuilder()
            .setCustomId("agree")
            .setLabel("Indemnification statement accept. (Yes/No)")
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setValue('YES')
            .setPlaceholder("YES/NO")
            .setRequired(true);
        const row = new discord_js_1.ActionRowBuilder()
            .addComponents(agree);
        modal.addComponents(row);
        await interaction.showModal(modal);
    }
};
