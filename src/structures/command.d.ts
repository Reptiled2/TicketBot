import type { SlashCommandBuilder } from "discord.js";

export interface CommandModule {
    data: SlashCommandBuilder,
    callback: function
}

export interface ButtonModule {
    name: string,
    callback: function
}

export interface ModalModule {
    name: string,
    callback: function
}

export interface InteractionAPI {
    config: Array,
    database: Array,
    saveData: function
}