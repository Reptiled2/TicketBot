"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("remove")
        .setDescription("Removes a member to current ticket.")
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
        .addUserOption((option) => option
        .setName("user")
        .setDescription("User to add to ticket")
        .setRequired(true)),
    async callback(interaction, api) {
        const user = interaction.options.get("user")?.member;
        if (user.id === interaction.user.id) {
            interaction.reply({ content: "You can't add yourself as a sub-client!", ephemeral: true });
            return;
        }
        ;
        interaction.channel.permissionOverwrites.set([
            { id: user.id, deny: ["ViewChannel", "SendMessages", "AttachFiles", "EmbedLinks"] }
        ]);
        interaction.reply(`<@${user.id}> is removed from the ticket!`);
    }
};
