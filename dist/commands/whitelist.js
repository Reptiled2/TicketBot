"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const node_crypto_1 = require("node:crypto");
function dateSerializer(date) {
    switch (date) {
        case "1d":
            return 86400;
        case "7d":
            return 604800;
        case "14d":
            return 1209600;
        case "1m":
            return 2592000;
        case "3m":
            return 7776000;
        case "6m":
            return 15552000;
        case "1y":
            return 31536000;
        default:
            return 0;
    }
}
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("whitelist")
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
        .setDescription("Whitelists someone.")
        .addUserOption((option) => option
        .setName("user")
        .setDescription("User to assign license to.")
        .setRequired(true))
        .addStringOption((option) => option
        .setName("duration")
        .setDescription("Set expiry date.")
        .setRequired(false)
        .addChoices({ name: "1 Day", value: "1d" }, { name: "7 Days", value: "7d" }, { name: "14 Days", value: "14d" }, { name: "1 Month", value: "1m" }, { name: "3 Months", value: "3m" }, { name: "6 Months", value: "6m" }, { name: "1 Year", value: "1y" }))
        .addBooleanOption((option) => option
        .setName("force")
        .setDescription("Set this to true if you want to set license duration instead of extending it")
        .setRequired(false)),
    async callback(interaction, api) {
        const user = interaction.options.get("user")?.member;
        let key;
        const duration = interaction.options.get("duration");
        for (const keys in api.database.keys) {
            if (api.database.keys[keys].owner === user.id) {
                key = keys;
                break;
            }
            ;
        }
        ;
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle("Cracker Utilities License")
            .setColor("#a158ff")
            .setFooter({ text: api.config.footerText, iconURL: api.config.footerUrl });
        if (key === undefined) {
            while (true) {
                key = `CrackerLicense-${(0, node_crypto_1.randomBytes)(16).toString("hex")}`;
                if (!api.database.keys[key])
                    break;
            }
            ;
            api.database.keys[key] = {
                "owner": user.id,
                "status": "active",
                "key": key,
                "admins": [],
                "usages": [],
                "licenseDuration": duration !== null ? Math.floor(Date.now() / 1000) + dateSerializer(duration.value) : "perma",
                "assignedAt": Math.floor(Date.now() / 1000)
            };
            embed
                .setDescription("You've been assigned a license key to use Cracker Services!\n **ONLY SHARE WITH SUB-CLIENTS!**")
                .setFields({
                name: "Expiration Date",
                value: duration !== null ? `<t:${api.database.keys[key].licenseDuration}:d>` : "Never"
            }, {
                name: "Your key",
                value: `||${key}||`
            });
            await interaction.reply({ content: `Successfully assigned key to <@${user.id}>`, ephemeral: true });
        }
        else {
            const properties = api.database.keys[key];
            if (properties.status === "active") {
                const force = interaction.options.get("force")?.value;
                if (force !== undefined && force) {
                    properties.licenseDuration = duration !== null ? Math.floor(Date.now() / 1000) + dateSerializer(duration.value) : "perma";
                }
                else {
                    if (properties.licenseDuration === "perma") {
                        interaction.reply({ content: "This user already has a permanent license!", ephemeral: true });
                        return;
                    }
                    properties.licenseDuration = duration !== null ? properties.licenseDuration + dateSerializer(duration.value) : "perma";
                }
                ;
            }
            else {
                properties.status = "active";
                properties.admins = [];
                properties.licenseDuration = duration !== null ? Math.floor(Date.now() / 1000) + dateSerializer(duration.value) : "perma";
            }
            ;
            if (properties.licenseDuration === "perma") {
                embed.setDescription("Your license has been extended!\nNow you have a **permanent** license!");
            }
            else {
                embed.setDescription(`Your license has been extended!\nExpires at <t:${properties.licenseDuration}:d>`);
            }
            await interaction.reply({ content: `Successfully extended <@${user.id}>'s license!`, ephemeral: true });
        }
        user.send({ embeds: [embed] })
            .catch(async (err) => {
            console.log(err);
            await interaction.followUp({ content: `User doesn't allow direct messages!\nAssigned key: ||${key}||`, ephemeral: true });
            return;
        });
        await user.roles.add(api.config.buyerRole, `Assigned a license by ${interaction.user.displayName}`).catch(async (err) => {
            console.log(err);
            return;
        });
        api.saveData();
    }
};
