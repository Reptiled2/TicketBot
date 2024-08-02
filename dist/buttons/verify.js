"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    name: "verify",
    callback: async (interaction, api) => {
        interaction.member.roles.add(api.config.verifiedRole, "Auto-verification.");
        interaction.reply({ content: ":white_check_mark: Verified successfully!", ephemeral: true });
    }
};
