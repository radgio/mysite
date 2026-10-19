---
title: "Manuale Utente"
date: 2026-10-19
draft: false
---

# Manuale Utente e Manutenzione: Hugo + PaperMod + Decap CMS Self-Hosted
...

# Manuale Utente e Manutenzione: Hugo + PaperMod + Decap CMS Self-Hosted

Questo documento riassume l'architettura, la configurazione e i flussi di lavoro del tuo sito web statico, completo di pannello di amministrazione (CMS) e deploy automatico.

## 1. Architettura del Sistema

Il sistema è composto da quattro componenti principali che lavorano insieme:

1.  **Hugo + Tema PaperMod**: Il generatore di siti statici. Prende i file Markdown e li trasforma in HTML/CSS/JS pronti per il web.
2.  **Nginx**: Il web server. Serve i file statici generati da Hugo e fa da "Reverse Proxy" per le chiamate di autenticazione e per i webhook.
3.  **Decap CMS + Proxy OAuth (Docker)**: Il pannello di amministrazione web (`/admin/`). Permette di scrivere articoli dal browser. Il container Docker `decap-oauth` gestisce in modo sicuro il login tramite GitHub.
4.  **GitHub Webhook + Servizio Locale**: Il sistema di deploy automatico. Quando pubblichi un articolo, GitHub avvisa il tuo server, che scarica le modifiche e rigenera il sito in automatico.

---

## 2. Flusso di Lavoro Quotidiano (Come scrivere un articolo)

Dimentica il terminale per la scrittura quotidiana. Tutto si fa dal browser.

1.  Vai sul tuo sito: `https://nginx-pa.duckdns.org/admin/`
2.  Clicca su **"Login with GitHub"** (se non sei già loggato).
3.  Nel menu a sinistra, clicca su **Posts** e poi su **New Posts**.
4.  Compila i campi:
    *   **Title**: Il titolo dell'articolo.
    *   **Publish Date**: La data di pubblicazione.
    *   **Draft**: Metti la spunta se è una bozza (non sarà visibile sul sito).
    *   **Body**: Scrivi il testo (supporta il Markdown).
    *   Per aggiungere immagini, usa il pulsante "Add image" nel menu dell'editor.
5.  Clicca su **Publish** in alto a destra.
6.  **Attendi 10-20 secondi**. Il Webhook avviserà il server, che eseguirà `git pull` e `hugo` in background. Ricarica la homepage del sito e vedrai il nuovo articolo online.

---

## 3. Struttura delle Directory del Server

*   `/opt/web/mysite/` -> La cartella principale del progetto Hugo.
*   `/opt/web/mysite/content/` -> Qui risiedono i file `.md` dei tuoi articoli.
*   `/opt/web/mysite/static/` -> File statici (es. immagini, il pannello `admin/`).
*   `/opt/web/mysite/public/` -> La cartella generata da Hugo con il sito pronto. **Nginx serve questa cartella**.
*   `/opt/web/mysite/hugo.toml` -> Il file di configurazione del sito (titolo, URL, ecc.).
*   `/opt/web/deploy.sh` -> Lo script che esegue `git pull` e `hugo` quando arriva un webhook.
*   `/etc/github-webhook.json` -> Configurazione del servizio di webhook.
*   `/etc/nginx/sites-available/miosito` -> Configurazione di Nginx per il sito e i proxy.

---

## 4. Manutenzione e Comandi Utili

Se qualcosa non funziona, ecco come controllare i "motori" del sistema.

### A. Controllare lo stato dei servizi
Esegui questi comandi per verificare che tutto sia in esecuzione:

    # Stato di Nginx
    systemctl status nginx

    # Stato del container per il login OAuth
    docker ps

    # Stato del servizio per il deploy automatico
    systemctl status github-webhook

### B. Se il sito non si aggiorna dopo il "Publish"
Se pubblichi un articolo ma il sito non cambia, potrebbe essersi inceppato il sistema di deploy automatico. Puoi forzare l'aggiornamento manuale entrando nel server e digitando:

    cd /opt/web/mysite
    git pull
    hugo

### C. Se il login su `/admin/` smette di funzionare
Controlla il container Docker:

    docker logs decap-oauth

Se il container è fermo, riavvialo:

    docker restart decap-oauth

### D. Modificare la configurazione di Decap CMS
Se devi cambiare i campi del pannello (es. aggiungere un campo "Autore"), modifica il file:

    nano /opt/web/mysite/static/admin/config.yml

Dopo averlo salvato, esegui `hugo` nella cartella del sito e fai il push su GitHub per applicare le modifiche al pannello.

### E. Modificare il tema o la configurazione di Hugo
Se modifichi `hugo.toml` (es. per cambiare il titolo del sito o i menu), ricordati di rigenerare:

    cd /opt/web/mysite
    hugo

---

## 5. Sicurezza e Backup

*   **Token e Password**: Le tue credenziali (GitHub Client ID, Secret, Token PAT, ecc.) non sono mai salvate nel codice del sito (che è pubblico), ma in file locali del server o nelle variabili del container Docker.
*   **Backup dei contenuti**: Tutti i tuoi articoli sono al sicuro su GitHub. Se il server dovesse esplodere, ti basterà clonare di nuovo il repository su un nuovo server, installare Hugo, Nginx e Docker, e ripristinare i file di configurazione per riavere tutto.
*   **Aggiornamenti**: Di tanto in tanto, puoi aggiornare il container OAuth con:

    docker pull alukovenko/decapcms-oauth2:latest
    docker stop decap-oauth
    docker rm decap-oauth
    # Rilancia il comando docker run che hai usato per crearlo
