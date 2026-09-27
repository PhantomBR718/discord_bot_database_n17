# Discord Database Bot

Bot Discord in Node.js con `discord.js` e SQLite.

## Configurazione

1. Installa Node.js 20+.
2. Esegui `npm install`.
3. Copia `.env.example` in `.env` e inserisci token, Client ID e Guild ID.
4. Esegui `npm run register` per registrare i comandi nel server.
5. Esegui `npm start`.

## Funzioni

- `/verificazione`: pubblica un embed con pulsante.
- Pulsante **Verifica profilo**: apre un modal per Roblox Nick, Roblox Username e Roblox ID; i dati Discord e le date vengono raccolti automaticamente.
- `/database_check user:@utente`: cerca un profilo.
- `/database_manual_register`: inserimento staff con dati Discord e Roblox.
- `/database_user_report user:@utente nota:...`: aggiunge una nota.

I tre comandi del database richiedono il permesso Discord **Gestisci server**. Non committare mai `.env`, token o database SQLite.
