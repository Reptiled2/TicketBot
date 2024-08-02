"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("info")
        .setDescription("Gives information about user.")
        .addUserOption((option) => option
        .setName("user")
        .setDescription("User to get information from")
        .setRequired(false)),
    async callback(interaction, api) {
        let user;
        const admin = interaction.member.permissions.has(discord_js_1.PermissionFlagsBits.Administrator);
        if (admin && interaction.options.get("user")?.member) {
            user = interaction.options.get("user")?.member;
        }
        else {
            user = interaction.member;
        }
        for (const key in api.database.keys) {
            const properties = api.database.keys[key];
            if (properties.owner !== user.id || properties.status === "disabled")
                continue;
            let subClients = "";
            for (const userid of properties.admins) {
                try {
                    subClients += `${interaction.guild?.members.cache.get(userid)?.displayName}\n`;
                }
                catch {
                    continue;
                }
                ;
            }
            ;
            const expiresAt = properties.AssignedAt === "perma" ? "Never" : properties.licenseDuration;
            const embed = new discord_js_1.EmbedBuilder()
                .setColor("Aqua")
                .setTitle(user.displayName)
                .setDescription(`Information about ${user.displayName}`)
                .setFields().addFields({ name: "License Key", value: `||${key}||` }, { name: "Status", value: properties.status === "active" ? "Active" : "Disabled" }, { name: "Total tickets", value: properties.usages.length.toString() }, { name: "Sub-Clients", value: subClients !== "" ? subClients : "None" }, { name: "Expires At", value: `${expiresAt !== "perma" ? `<t:${expiresAt}:d>` : "Never"}` }, { name: "Assigned At", value: `<t:${properties.AssignedAt}:d>` });
            let active = "";
            let expired = "";
            if (properties.usages.length >= 1) {
                for (const ticket of properties.usages) {
                    let ticketInfo = api.database.logs.activeTickets[ticket];
                    if (!ticketInfo) {
                        ticketInfo = api.database.logs.expiredTickets[ticket];
                        if (!ticketInfo)
                            continue;
                        expired += `https://discord.com/channels/${api.config.guildId}/${api.config.logChannel}/${ticketInfo.transcript}\n`;
                        continue;
                    }
                    ;
                    active += `<#${ticketInfo.channel}>\n`;
                }
                ;
            }
            ;
            if (admin) {
                const tEmbed = new discord_js_1.EmbedBuilder()
                    .setColor("Aqua")
                    .setTitle("Transcripts")
                    .setDescription(`**Active Tickets**\n${active}\n**Expired Tickets**\n${expired}`);
                interaction.reply({ embeds: [embed, tEmbed], ephemeral: true });
            }
            else {
                interaction.reply({ embeds: [embed], ephemeral: true });
            }
            ;
            return;
        }
        ;
        interaction.reply({ content: "User doesn't have a license!", ephemeral: true });
    }
};
