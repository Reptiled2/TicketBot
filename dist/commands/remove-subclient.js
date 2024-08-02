"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("remove-subclient")
        .setDescription("Removes a member as sub-client to your license.")
        .addUserOption((option) => option
        .setName("user")
        .setDescription("User to remove from sub-clients")
        .setRequired(true)),
    async callback(interaction, api) {
        const user = interaction.options.get("user")?.member;
        if (user.id === interaction.user.id) {
            interaction.reply({ content: "You are not sub-client!", ephemeral: true });
            return;
        }
        ;
        for (const key in api.database.keys) {
            const properties = api.database.keys[key];
            if (properties.owner !== interaction.user.id || properties.status === "disabled")
                continue;
            properties.admins.splice(properties.admins.indexOf(user.id), 1);
            if (properties.usages.length >= 1) {
                for (const ticket of properties.usages) {
                    try {
                        const ticketInfo = api.database.logs.activeTickets[ticket];
                        const channel = interaction.guild?.channels.cache.get(ticketInfo.channel);
                        channel.permissionOverwrites.edit(user.id, {
                            ViewChannel: false, SendMessages: false, EmbedLinks: true, AttachFiles: true
                        });
                        channel.send(`<@${user.id}> has been removed from ticket!`);
                    }
                    catch { }
                    ;
                }
                ;
            }
            ;
            user.roles.remove(api.config.subclientRole, `Removed from ${interaction.user.displayName}'s sub-clients!`);
            interaction.reply({ content: `Successfully removed <@${user.id}> from your sub-clients!`, ephemeral: true });
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle("Cracker Utilities")
                .setDescription(`You've been removed from <@${interaction.user.id}>'s **Sub-Client** list.`)
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
