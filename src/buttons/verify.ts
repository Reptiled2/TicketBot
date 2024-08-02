import type { ButtonInteraction, GuildMember } from "discord.js";
import type { InteractionAPI } from "../structures/command";

module.exports = {
    name: "verify",
    callback: async (interaction: ButtonInteraction, api: InteractionAPI) => {
        (interaction.member as GuildMember).roles.add(api.config.verifiedRole, "Auto-verification.");
        interaction.reply({content: ":white_check_mark: Verified successfully!", ephemeral: true});
    }
};