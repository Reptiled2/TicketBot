"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    name: "supportVerify",
    callback: async (interaction, api) => {
        for (const ticket in api.database.logs.activeTickets) {
            const properties = api.database.logs.activeTickets[ticket];
            if (properties.owner === interaction.user.id && properties.type === "support") {
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
            .setCustomId("support")
            .setTitle("Verification");
        const keyInput = new discord_js_1.TextInputBuilder()
            .setCustomId("key")
            .setLabel("What is your CrackerLicense key?")
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setRequired(true);
        const agree = new discord_js_1.TextInputBuilder()
            .setCustomId("agree")
            .setLabel("Indemnification statement accept. (Yes/No)")
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setValue('YES')
            .setPlaceholder("YES/NO")
            .setRequired(true);
        const row = new discord_js_1.ActionRowBuilder()
            .addComponents(keyInput);
        const row2 = new discord_js_1.ActionRowBuilder()
            .addComponents(agree);
        modal.addComponents(row, row2);
        await interaction.showModal(modal);
    }
};
