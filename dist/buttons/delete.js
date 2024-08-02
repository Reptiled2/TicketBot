"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    name: "delete",
    callback: async (interaction, api) => {
        await interaction.channel?.delete();
    }
};
