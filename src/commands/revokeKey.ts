import { SlashCommandBuilder, type CommandInteraction, PermissionFlagsBits, GuildMember, EmbedBuilder, Colors } from "discord.js";
import type { InteractionAPI } from "../structures/command";


module.exports = {
    data: new SlashCommandBuilder()
        .setName("revoke")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription("Revokes license key. Choose license or user!")
        .addUserOption((option) => option
            .setName("user")
            .setDescription("User to revoke license key.")
            .setRequired(false))
        .addStringOption((option) => option
            .setName("license")
            .setDescription("License key to revoke.")
            .setRequired(false)),

    async callback(interaction: CommandInteraction, api: InteractionAPI) {
        const user = interaction.options.get("user")?.member;
        const key = interaction.options.get("license")?.value;
        if (!user && !key) {
            await interaction.reply({content: "Either choose a user or license key to revoke!", ephemeral: true});
            return;
        };
        
        const embed = new EmbedBuilder()
            .setTitle("License Revoked")
            .setDescription("Your **Cracker Support License** has been revoked!")
            .setColor(Colors.DarkRed);

        if (user) {
            if (!(user instanceof GuildMember)) return;

            for (const key in api.database.keys) {
                const properties = api.database.keys[key]
                if (properties.owner === user.id && properties.status === "active") {
                    api.database.keys[key].status = "disabled"
    
                    user.send({embeds: [embed]}).catch(async () => {return;});
                    await user.roles.remove(api.config.buyerRole, `License has been revoked by ${interaction.user.displayName}`).catch(async () => {return;});
                    await interaction.reply({content: `Successfully revoked <@${user.id}>'s license!`, ephemeral: true});
                    return;
                };
            };
    
            await interaction.reply({content: "User doesn't have a license!", ephemeral: true});
        } else if (key) {
            const keyInfo = api.database.keys[key as string]
            if (!keyInfo || keyInfo.status === "disabled") {
                await interaction.reply({content: "Thats not an active license!", ephemeral: true});

                
            }
        };
    }
};