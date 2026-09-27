import 'dotenv/config';
import { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID || !process.env.GUILD_ID) throw new Error('Set DISCORD_TOKEN, CLIENT_ID and GUILD_ID');
const staff = (command) => command.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);
const commands = [
  new SlashCommandBuilder().setName('verificazione').setDescription('Pubblica il pannello di verifica'),
  staff(new SlashCommandBuilder().setName('database_check').setDescription('Controlla un utente nel database').addUserOption(o => o.setName('user').setDescription('Utente Discord').setRequired(true))),
  staff(new SlashCommandBuilder().setName('database_manual_register').setDescription('Registra manualmente un utente').addStringOption(o => o.setName('discord_id').setDescription('Discord ID').setRequired(true)).addStringOption(o => o.setName('discord_username').setDescription('Discord username').setRequired(true)).addStringOption(o => o.setName('discord_nick').setDescription('Discord nick').setRequired(true)).addStringOption(o => o.setName('join_date').setDescription('Data creazione account ISO').setRequired(true)).addStringOption(o => o.setName('join_server_date').setDescription('Data ingresso server ISO').setRequired(true)).addStringOption(o => o.setName('roblox_nick').setDescription('Roblox Nick').setRequired(true)).addStringOption(o => o.setName('roblox_username').setDescription('Roblox Username').setRequired(true)).addStringOption(o => o.setName('roblox_id').setDescription('Roblox ID').setRequired(true))),
  staff(new SlashCommandBuilder().setName('database_user_report').setDescription('Aggiunge una nota a un utente').addUserOption(o => o.setName('user').setDescription('Utente Discord').setRequired(true)).addStringOption(o => o.setName('nota').setDescription('Testo della segnalazione').setRequired(true)))
].map(c => c.toJSON());
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
console.log('Comandi registrati nel server.');
