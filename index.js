import 'dotenv/config';
import { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField } from 'discord.js';
import { addReport, findUser, manualRegister, saveUser, getReports } from './db.js';

const required = ['DISCORD_TOKEN'];
for (const key of required) if (!process.env[key]) throw new Error(`Missing ${key} in environment`);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
const color = 0x5865f2;
const isStaff = (interaction) => interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild);
const date = (value) => value ? `<t:${Math.floor(new Date(value).getTime() / 1000)}:F>` : 'Non disponibile';
const field = (name, value, inline = true) => ({ name, value: String(value || 'Non disponibile'), inline });

function profileEmbed(record, title = 'Profilo verificato') {
  const reports = getReports(record.discord_id);
  return new EmbedBuilder().setColor(color).setTitle(`✅ ${title}`).setDescription('Dati registrati nel database').addFields(
    field('Discord', `<@${record.discord_id}>`), field('Discord ID', record.discord_id), field('Discord username', record.discord_username),
    field('Discord nick', record.discord_nick), field('Account creato', date(record.account_created_at)), field('Ingresso nel server', date(record.server_joined_at)),
    field('Roblox Nick', record.roblox_nick), field('Roblox Username', record.roblox_username), field('Roblox ID', record.roblox_id),
    field('Segnalazioni', reports.length ? reports.map(r => `• ${r.note}`).join('\n').slice(0, 1024) : 'Nessuna', false)
  ).setTimestamp();
}

client.once('ready', () => console.log(`Online come ${client.user.tag}`));
client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      if (['database_check', 'database_manual_register', 'database_user_report'].includes(interaction.commandName) && !isStaff(interaction)) {
        return interaction.reply({ content: '❌ Questo comando è riservato allo staff.', ephemeral: true });
      }
      if (interaction.commandName === 'verificazione') {
        const embed = new EmbedBuilder().setColor(color).setTitle('🔐 Verificazione').setDescription('Clicca il pulsante per verificare il tuo profilo Discord e inserire i dati Roblox.').setFooter({ text: 'Sistema di verifica' });
        return interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('start_verification').setLabel('Verifica profilo').setEmoji('✅').setStyle(ButtonStyle.Success))] });
      }
      if (interaction.commandName === 'database_check') {
        const target = interaction.options.getUser('user'); const record = findUser(target.id) || findUser(target.username);
        return interaction.reply({ embeds: [record ? profileEmbed(record, 'Controllo database') : new EmbedBuilder().setColor(0xed4245).setTitle('❌ Utente non trovato').setDescription(`Nessun record per ${target}.`)], ephemeral: true });
      }
      if (interaction.commandName === 'database_manual_register') {
        const record = manualRegister({ discord_id: interaction.options.getString('discord_id'), discord_username: interaction.options.getString('discord_username'), discord_nick: interaction.options.getString('discord_nick'), account_created_at: interaction.options.getString('join_date'), server_joined_at: interaction.options.getString('join_server_date'), roblox_nick: interaction.options.getString('roblox_nick'), roblox_username: interaction.options.getString('roblox_username'), roblox_id: interaction.options.getString('roblox_id') });
        return interaction.reply({ embeds: [profileEmbed(record, 'Registrazione manuale')], ephemeral: true });
      }
      if (interaction.commandName === 'database_user_report') {
        const user = interaction.options.getUser('user'); const note = interaction.options.getString('nota');
        const record = findUser(user.id); if (!record) return interaction.reply({ content: '❌ L’utente non è registrato nel database.', ephemeral: true });
        addReport(record.discord_id, note, interaction.user.id);
        return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xfaa61a).setTitle('📝 Segnalazione aggiunta').setDescription(`Nota aggiunta a ${user}.`).addFields(field('Nota', note, false)).setTimestamp()], ephemeral: true });
      }
    }
    if (interaction.isButton() && interaction.customId === 'start_verification') {
      const modal = new ModalBuilder().setCustomId('verification_modal').setTitle('Verifica profilo');
      const input = (id, label) => new TextInputBuilder().setCustomId(id).setLabel(label).setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(100);
      return interaction.showModal(modal.addComponents(new ActionRowBuilder().addComponents(input('roblox_nick', 'Roblox Nick')), new ActionRowBuilder().addComponents(input('roblox_username', 'Roblox Username')), new ActionRowBuilder().addComponents(input('roblox_id', 'Roblox ID'))));
    }
    if (interaction.isModalSubmit() && interaction.customId === 'verification_modal') {
      const member = interaction.member; const record = { discord_id: interaction.user.id, discord_username: interaction.user.username, discord_nick: member?.nickname || interaction.user.globalName || interaction.user.username, account_created_at: interaction.user.createdAt.toISOString(), server_joined_at: member?.joinedAt?.toISOString() || null, roblox_nick: interaction.fields.getTextInputValue('roblox_nick'), roblox_username: interaction.fields.getTextInputValue('roblox_username'), roblox_id: interaction.fields.getTextInputValue('roblox_id') };
      saveUser(record); return interaction.reply({ embeds: [profileEmbed(record)], ephemeral: true });
    }
  } catch (error) { console.error(error); if (!interaction.replied && !interaction.deferred) await interaction.reply({ content: '❌ Si è verificato un errore inatteso.', ephemeral: true }); }
});
client.login(process.env.DISCORD_TOKEN);
