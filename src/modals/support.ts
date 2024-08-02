import { ButtonStyle, Colors, ButtonBuilder, EmbedBuilder, ActionRowBuilder, ChannelType, type ModalSubmitInteraction, ReadonlyCollection, type OverwriteResolvable } from "discord.js";
import type { InteractionAPI } from "../structures/command";

module.exports = {
    name: "support",
    callback: async (interaction: ModalSubmitInteraction, api: InteractionAPI) => {
        const key = interaction.fields.getTextInputValue("key");
        const agree = interaction.fields.getTextInputValue("agree");
        if (agree.toLocaleLowerCase() !== "yes") {
            await interaction.reply({content: "Indemnification statement refused.", ephemeral: true});
            return;
        };

        const keyInfo = api.database.keys[key];
        if (!keyInfo || keyInfo.status !== "active") {
            await interaction.reply({content: "Invalid key.", ephemeral: true});
            return;
        };

        if (keyInfo.owner !== interaction.user.id && keyInfo.admins.has(interaction.user.id)) {
            await interaction.reply({content: "You are not the owner of this key!", ephemeral: true});
            return;
        };

        if (!interaction.guild) return;
        
        const perms: OverwriteResolvable[] = [
        {
            id: interaction.user.id,
            allow: ["AddReactions", "ViewChannel", "SendMessages", "UseExternalEmojis", "AttachFiles", "EmbedLinks"]
        },
        {
            id: api.config.supportRole,
            allow: ["AddReactions", "ViewChannel", "SendMessages", "UseExternalEmojis", "AttachFiles", "EmbedLinks"]
        },
        {
            id: interaction.guild.roles.everyone,
            deny: ["ViewChannel", "SendMessages"]
        }]
        for (const userid of keyInfo.admins) {
            perms.push({
                id: userid,
                allow: ["AddReactions", "ViewChannel", "SendMessages", "UseExternalEmojis", "AttachFiles", "EmbedLinks"]
            });
        };

        const owner = interaction.guild.members.cache.get(keyInfo.owner);
        const channel = await interaction.guild?.channels.create({
            name: `${interaction.customId}-${owner?.user.displayName}`,
            type: ChannelType.GuildText,
            parent: api.config.categoryId,
            permissionOverwrites: perms
        })

        interaction.reply({content: `Your ticket has been created! <#${channel?.id}>`, ephemeral: true});

        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle("Support Ticket")
            .setDescription("Support will be with you shortly.\nTo close this ticket react with 🔒")
            .setFooter({text: api.config.footerText, iconURL: api.config.footerUrl});

        const button = new ButtonBuilder()
            .setLabel("Close")
            .setCustomId("closeticket")
            .setEmoji("🔒")
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(button);

        channel.send({
            content: `<@${interaction.user.id}>`,
            embeds: [embed],
            components: [row]
        });

        api.database.keys[key].usages.push(channel.id);
        api.database.logs.activeTickets[channel.id] = {
            "owner": owner?.user.id,
            "channel": channel.id,
            "type": interaction.customId,
            "creationDate": Math.floor(Date.now() / 1000),
            "messages": []
        };

        api.saveData();
    } 
}