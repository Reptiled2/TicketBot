import { randomBytes } from "node:crypto";
import { SlashCommandBuilder, type CommandInteraction, PermissionFlagsBits, type GuildMember, EmbedBuilder, Colors, PermissionsBitField } from "discord.js";
import type { InteractionAPI } from "../structures/command";


module.exports = {
    data: new SlashCommandBuilder()
        .setName("generatekey")
        .setDescription("Generates a new license key for a licensed member.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption((option) => option
            .setName("user")
            .setDescription("User to get information from")
            .setRequired(true)),

    async callback(interaction: CommandInteraction, api: InteractionAPI) {
        const user = interaction.options.get("user")?.member as GuildMember;

        for (const key in api.database.keys) {
            const properties = api.database.keys[key]
            if (properties.owner !== user.id || properties.status === "disabled") continue;
            
            let newKey: string | undefined;
            while (true) {
                newKey = `CrackerLicense-${randomBytes(16).toString("hex")}`;
                if (!api.database.keys[newKey]) break;
            };
            
            properties.key = newKey;
            api.database.keys[newKey] = properties;
            delete api.database.keys[key];

            const embed = new EmbedBuilder()
                .setTitle("Cracker Utilities License")
                .setDescription("You've been assigned a new license key!\n**ONLY SHARE WITH SUB-CLIENTS!**")
                .setFields( 
                    {
                        name: "New key",
                        value: `||${newKey}||`
                    })
                .setColor("#a158ff")
                .setFooter({text: api.config.footerText, iconURL: api.config.footerUrl});

            await interaction.reply({content: `Successfully assigned key to <@${user.id}>`, ephemeral: true});
            user.send({embeds: [embed]})
            .catch(async (err) => {
                console.log(err);
                await interaction.followUp({content: `User doesn't allow direct messages!\nAssigned key: ||${newKey}||`, ephemeral: true});
                return;
            });

            return;
        };
    
        interaction.reply({content: "User doesn't have a license!", ephemeral: true});
    }
};