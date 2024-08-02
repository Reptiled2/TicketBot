import { SlashCommandBuilder, type CommandInteraction, type GuildMember, PermissionFlagsBits, type TextChannel } from "discord.js";
import type { InteractionAPI } from "../structures/command";


module.exports = {
    data: new SlashCommandBuilder()
        .setName("remove")
        .setDescription("Removes a member to current ticket.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption((option) => option
            .setName("user")
            .setDescription("User to add to ticket")
            .setRequired(true)),

    async callback(interaction: CommandInteraction, api: InteractionAPI) {
        const user = interaction.options.get("user")?.member as GuildMember;

        if (user.id === interaction.user.id) {
            interaction.reply({content: "You can't add yourself as a sub-client!", ephemeral: true});
            return;
        };

        (interaction.channel as TextChannel).permissionOverwrites.set([
            {id: user.id, deny: ["ViewChannel", "SendMessages", "AttachFiles", "EmbedLinks"]}
        ]);

        interaction.reply(`<@${user.id}> is removed from the ticket!`);
    }
};