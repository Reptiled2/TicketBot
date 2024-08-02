"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("add-subclient")
        .setDescription("Adds a member as sub-client to your license.")
        .addUserOption((option) => option
        .setName("user")
        .setDescription("User to add subclient")
        .setRequired(true)),
    async callback(interaction, api) {
        const user = interaction.options.get("user")?.member;
        if (user.id === interaction.user.id) {
            interaction.reply({ content: "You can't add yourself as a sub-client!", ephemeral: true });
            return;
        }
        ;
        if (user.user.bot || user.roles.cache.has(api.config.supportRole)) {
            interaction.reply({ content: "You can't add this member as a sub-client!", ephemeral: true });
            return;
        }
        for (const key in api.database.keys) {
            const properties = api.database.keys[key];
            if (properties.owner !== interaction.user.id || properties.status === "disabled")
                continue;
            properties.admins.push(user.id);
            if (properties.usages.length >= 1) {
                for (const ticket of properties.usages) {
                    try {
                        const ticketInfo = api.database.logs.activeTickets[ticket];
                        const channel = interaction.guild?.channels.cache.get(ticketInfo.channel);
                        channel.permissionOverwrites.edit(user.id, {
                            ViewChannel: true, SendMessages: true, EmbedLinks: true, AttachFiles: true
                        });
                        channel.send(`<@${user.id}> has been added to ticket as a sub-client!`);
                    }
                    catch { }
                    ;
                }
                ;
            }
            ;
            user.roles.add(api.config.subclientRole, `Added as a sub-client to ${interaction.user.displayName}`);
            interaction.reply({ content: `Successfully added <@${user.id}> as a sub-client!`, ephemeral: true });
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle("Cracker Utilities")
                .setDescription(`You've been added as <@${interaction.user.id}>'s **Sub-Client**.`)
                .setColor("#a158ff")
                .setFooter({ text: api.config.footerText, iconURL: api.config.footerUrl });
            user.send({ embeds: [embed] }).catch(async () => { return; });
            api.saveData();
            return;
        }
        ;
        interaction.reply({ content: "You don't have an active Cracker License!", ephemeral: true });
        return;
    }
};
