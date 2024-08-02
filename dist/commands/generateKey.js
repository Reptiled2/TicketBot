"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_crypto_1 = require("node:crypto");
const discord_js_1 = require("discord.js");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("generatekey")
        .setDescription("Generates a new license key for a licensed member.")
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
        .addUserOption((option) => option
        .setName("user")
        .setDescription("User to get information from")
        .setRequired(true)),
    async callback(interaction, api) {
        const user = interaction.options.get("user")?.member;
        for (const key in api.database.keys) {
            const properties = api.database.keys[key];
            if (properties.owner !== user.id || properties.status === "disabled")
                continue;
            let newKey;
            while (true) {
                newKey = `CrackerLicense-${(0, node_crypto_1.randomBytes)(16).toString("hex")}`;
                if (!api.database.keys[newKey])
                    break;
            }
            ;
            properties.key = newKey;
            api.database.keys[newKey] = properties;
            delete api.database.keys[key];
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle("Cracker Utilities License")
                .setDescription("You've been assigned a new license key!\n**ONLY SHARE WITH SUB-CLIENTS!**")
                .setFields({
                name: "New key",
                value: `||${newKey}||`
            })
                .setColor("#a158ff")
                .setFooter({ text: api.config.footerText, iconURL: api.config.footerUrl });
            await interaction.reply({ content: `Successfully assigned key to <@${user.id}>`, ephemeral: true });
            user.send({ embeds: [embed] })
                .catch(async (err) => {
                console.log(err);
                await interaction.followUp({ content: `User doesn't allow direct messages!\nAssigned key: ||${newKey}||`, ephemeral: true });
                return;
            });
            return;
        }
        ;
        interaction.reply({ content: "User doesn't have a license!", ephemeral: true });
    }
};
