"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("revoke")
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
        .setDescription("Revokes license key. Choose license or user!")
        .addUserOption((option) => option
        .setName("user")
        .setDescription("User to revoke license key.")
        .setRequired(false))
        .addStringOption((option) => option
        .setName("license")
        .setDescription("License key to revoke.")
        .setRequired(false)),
    async callback(interaction, api) {
        const user = interaction.options.get("user")?.member;
        const key = interaction.options.get("license")?.value;
        if (!user && !key) {
            await interaction.reply({ content: "Either choose a user or license key to revoke!", ephemeral: true });
            return;
        }
        ;
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle("License Revoked")
            .setDescription("Your **Cracker Support License** has been revoked!")
            .setColor(discord_js_1.Colors.DarkRed);
        if (user) {
            if (!(user instanceof discord_js_1.GuildMember))
                return;
            for (const key in api.database.keys) {
                const properties = api.database.keys[key];
                if (properties.owner === user.id && properties.status === "active") {
                    api.database.keys[key].status = "disabled";
                    user.send({ embeds: [embed] }).catch(async () => { return; });
                    await user.roles.remove(api.config.buyerRole, `License has been revoked by ${interaction.user.displayName}`).catch(async () => { return; });
                    await interaction.reply({ content: `Successfully revoked <@${user.id}>'s license!`, ephemeral: true });
                    return;
                }
                ;
            }
            ;
            await interaction.reply({ content: "User doesn't have a license!", ephemeral: true });
        }
        else if (key) {
            const keyInfo = api.database.keys[key];
            if (!keyInfo || keyInfo.status === "disabled") {
                await interaction.reply({ content: "Thats not an active license!", ephemeral: true });
            }
        }
        ;
    }
};
