import type { ButtonInteraction } from "discord.js";
import type { InteractionAPI } from "../structures/command";

module.exports = {
    name: "delete",
    callback: async (interaction: ButtonInteraction, api: InteractionAPI) => {
        await interaction.channel?.delete();
    }
};