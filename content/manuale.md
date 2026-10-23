---
title: Manuale Utente
date: 2026-10-19
draft: false
---
# Manuale Utente e Manutenzione: Hugo + PaperMod + Decap CMS Self-Hosted

Questo documento riassume l'architettura, la configurazione e i flussi di lavoro del tuo sito web statico, completo di pannello di amministrazione (CMS) e deploy automatico.

## 1. Architettura del Sistema

Il sistema è composto da quattro componenti principali che lavorano insieme:

1. **Hugo + Tema PaperMod**: Il generatore di siti statici. Prende i file Markdown e li trasforma in HTML/CSS/JS pronti per il web.
2. **Nginx**: Il web server. Serve i file statici generati da Hugo e fa da "Reverse Proxy" per le chiamate di autenticazione e per i webhook.
3. **Decap CMS + Proxy OAuth (Docker)**: Il pannello di amministrazione web (`/admin/`). Permette di scrivere articoli dal browser. Il container Docker `decap-oauth` gestisce in modo sicuro il login tramite GitHub.
4. **GitHub Webhook + Servizio Locale**: Il sistema di deploy automatico. Quando pubblichi un articolo, GitHub avvisa il tuo server, che scarica le modifiche e rigenera il sito in automatico.

- - -

## 2. Flusso di Lavoro Quotidiano (Come scrivere un articolo)

Dimentica il terminale per la scrittura quotidiana. Tutto si fa dal browser.

1. Vai sul tuo sito: `https://nginx-pa.duckdns.org/admin/`
2. Clicca su **"Login with GitHub"** (se non sei già loggato).
3. Nel menu a sinistra, clicca su **Posts** e poi su **New Posts**.
4. Compila i campi:

   * **Title**: Il titolo dell'articolo.
   * **Publish Date**: La data di pubblicazione.
   * **Draft**: Metti la spunta se è una bozza (non sarà visibile sul sito).
   * **Body**: Scrivi il testo (supporta il Markdown).
   * Per aggiungere immagini, usa il pulsante "Add image" nel menu dell'editor.
5. Clicca su **Publish** in alto a destra.
6. **Attendi 10-20 secondi**. Il Webhook avviserà il server, che eseguirà `git pull` e `hugo` in background. Ricarica la homepage del sito e vedrai il nuovo articolo online.

- - -

## 3. Struttura delle Directory del Server

* `/opt/web/mysite/` -> La cartella principale del progetto Hugo.
* `/opt/web/mysite/content/` -> Qui risiedono i file `.md` dei tuoi articoli.
* `/opt/web/mysite/static/` -> File statici (es. immagini, il pannello `admin/`).
* `/opt/web/mysite/public/` -> La cartella generata da Hugo con il sito pronto. **Nginx serve questa cartella**.
* `/opt/web/mysite/hugo.toml` -> Il file di configurazione del sito (titolo, URL, ecc.).
* `/opt/web/deploy.sh` -> Lo script che esegue `git pull` e `hugo` quando arriva un webhook.
* `/etc/github-webhook.json` -> Configurazione del servizio di webhook.
* `/etc/nginx/sites-available/miosito` -> Configurazione di Nginx per il sito e i proxy.

- - -

## 4. Manutenzione e Comandi Utili

Se qualcosa non funziona, ecco come controllare i "motori" del sistema.

### A. Controllare lo stato dei servizi

Esegui questi comandi per verificare che tutto sia in esecuzione:

```
# Stato di Nginx
systemctl status nginx

# Stato del container per il login OAuth
docker ps

# Stato del servizio per il deploy automatico
systemctl status github-webhook
```

### B. Se il sito non si aggiorna dopo il "Publish"

Se pubblichi un articolo ma il sito non cambia, potrebbe essersi inceppato il sistema di deploy automatico. Puoi forzare l'aggiornamento manuale entrando nel server e digitando:

```
cd /opt/web/mysite
git pull
hugo
```

### C. Se il login su `/admin/` smette di funzionare

Controlla il container Docker:

```
docker logs decap-oauth
```

Se il container è fermo, riavvialo:

```
docker restart decap-oauth
```

### D. Modificare la configurazione di Decap CMS

Se devi cambiare i campi del pannello (es. aggiungere un campo "Autore"), modifica il file:

```
nano /opt/web/mysite/static/admin/config.yml
```

Dopo averlo salvato, esegui `hugo` nella cartella del sito e fai il push su GitHub per applicare le modifiche al pannello.

### E. Modificare il tema o la configurazione di Hugo

Se modifichi `hugo.toml` (es. per cambiare il titolo del sito o i menu), ricordati di rigenerare:

```
cd /opt/web/mysite
hugo
```

- - -

## 5. Sicurezza e Backup

* **Token e Password**: Le tue credenziali (GitHub Client ID, Secret, Token PAT, ecc.) non sono mai salvate nel codice del sito (che è pubblico), ma in file locali del server o nelle variabili del container Docker.
* **Backup dei contenuti**: Tutti i tuoi articoli sono al sicuro su GitHub. Se il server dovesse esplodere, ti basterà clonare di nuovo il repository su un nuovo server, installare Hugo, Nginx e Docker, e ripristinare i file di configurazione per riavere tutto.
* **Aggiornamenti**: Di tanto in tanto, puoi aggiornare il container OAuth con:

  docker pull alukovenko/decapcms-oauth2:latest
  docker stop decap-oauth
  docker rm decap-oauth

  # Rilancia il comando docker run che hai usato per crearlo

## 6. Gestione dei Contenuti e Organizzazione

- - -

Il sito è pensato per essere un archivio personale e un blog. Per mantenere l'ordine, sfruttiamo due strumenti nativi di Hugo: **Categorie** e **Tag**.

### La differenza tra Categorie e Tag

* **Categorie (Macro-argomenti)**: Servono per dividere il sito in "scaffali" principali (es. *Ricette*, *Note Tecniche*, *Appunti Personali*). Un articolo può avere una o più categorie, ma in genere è meglio assegnarne una principale.
* **Tag (Parole chiave)**: Servono per etichettare in modo specifico l'articolo (es. *pasta*, *nginx*, *proxmox*). Più tag usi, più è facile che articoli diversi su argomenti simili si colleghino tra loro.

### Come inserire un nuovo articolo

1. Vai su `/admin/` e clicca su **Posts** -> **New Posts**.
2. Compila i campi:

   * **Title**: Il titolo.
   * **Publish Date**: Data e ora.
   * **Draft**: Lascia la spunta se è una bozza (non sarà visibile online).
   * **Categories**: Digita il nome della categoria (es. `Ricette`) e premi Invio per confermarla.
   * **Tags**: Digita le parole chiave (es. `pasta`, `veloce`) e premi Invio.
   * **Body**: Scrivi il testo. Per inserire un'immagine, usa l'icona dedicata nella barra degli strumenti (verrà caricata in automatico).
3. Clicca su **Publish**. Il webhook farà il resto in pochi secondi.

- - -

## 7. La "Sindrome della Cache" (Risoluzione Problemi)

Durante la configurazione abbiamo scoperto che **il 90% dei problemi "strani" è causato dalla cache del browser**. Se modifichi qualcosa (come un'icona, un menu o la configurazione di Decap CMS) ma non vedi le modifiche, non è un errore del server: è il tuo browser che si rifiuta di scaricare i file nuovi.

### Cosa fare quando le modifiche non appaiono

1. **Hard Refresh della pagina**: 

   * Windows/Linux: `Ctrl + F5`
   * Mac: `Cmd + Shift + R`
2. **Navigazione in incognito**: Apri il sito in una finestra privata. Se lì funziona, il problema è al 100% la cache.
3. **Pulire la cache locale di Decap CMS**: 
   Se hai modificato il file `config.yml` (es. per aggiungere campi) ma il pannello `/admin/` non li mostra:

   * Apri `/admin/` e premi `F12` (Strumenti di sviluppo).
   * Vai nella scheda **Application** (o *Applicazione*).
   * Sotto **Local Storage**, seleziona il tuo dominio.
   * Clicca con il tasto destro e fai **Clear** (Svuota).
   * Ricarica la pagina `/admin/`.

- - -

## 8. Aggiornare la Configurazione del Sito (Manutenzione)

A differenza degli articoli che scrivi dal pannello, i file di configurazione (come `hugo.toml` o `static/admin/config.yml`) **non si aggiornano da soli**. Se devi fare modifiche strutturali (es. aggiungere una nuova voce al menu, cambiare i campi del CMS, modificare il titolo del sito), devi seguire questi passaggi dal terminale del server.

### Procedura Standard di Aggiornamento

1. **Modifica i file**:
   Apri i file che devi modificare con l'editor di testo (es. `nano /opt/web/mysite/hugo.toml` o `nano /opt/web/mysite/static/admin/config.yml`).
2. **Rigenera il sito e invia le modifiche a GitHub**:
   Esegui i seguenti comandi per compilare il sito e salvare le modifiche nel repository:

   ```bash
   cd /opt/web/mysite
   hugo
   git add static/admin/config.yml hugo.toml
   git commit -m "Aggiunte categorie al CMS e al menu"
   git push
   ```

### ⚠️ Attenzione: Conflitti tra Terminale e Pannello CMS

Il tuo sito ha due modi per modificare i file: il **terminale** del server e il **pannello di amministrazione** (`/admin/`). Questi due metodi **non comunicano tra loro in tempo reale**. 

Se modifichi un file (come il `manuale.md` o `config.yml`) direttamente sul server e poi, senza aver fatto il push, provi a fare un `git pull` per scaricare le modifiche fatte dal pannello CMS (o viceversa), Git andrà in errore:

> `error: Your local changes to the following files would be overwritten by merge`

**La regola d'oro:**
Scegli **un solo metodo** per ogni modifica e portala a termine. Se lavori dal pannello CMS, usa sempre quello per i contenuti. Se devi fare modifiche strutturali (come cambiare il `config.yml` o `hugo.toml`), fallo da terminale, ma assicurati di eseguire sempre `git push` prima di tornare a usare il pannello.

**Come risolvere se succede:**
Se Git si blocca per questo motivo e vuoi mantenere le modifiche fatte da GitHub (o dal CMS), puoi scartare le modifiche locali del server con:

```bash
git checkout -- nome_del_file.md
git pull
hugo
```

---

## 9. Upload Automatico di PDF e Pulizia File

Per gestire i PDF mensili (es. il menu) senza usare il CMS, è stato creato un sistema di upload autonomo accessibile da browser.

### Come funziona
1.  Vai su `https://nginx-pa.duckdns.org/carica-pdf`.
2.  Seleziona un file PDF dal tuo computer e clicca su **Carica**.
3.  Il file verrà automaticamente rinominato in **`menu-mese.pdf`** e salvato in `/opt/web/mysite/static/uploads/`.
4.  Lo script eseguirà in automatico:
    *   `git pull` (per allinearsi a GitHub).
    *   `hugo` (per rigenerare il sito).
    *   `git add -A` (per includere tutte le modifiche).
    *   `git commit` e `git push` (per inviare tutto su GitHub).
5.  Il file sarà subito disponibile al link: `https://nginx-pa.duckdns.org/uploads/menu-mese.pdf`.

### Pulizia automatica
Ogni volta che carichi un nuovo PDF, lo script controlla la cartella `static/uploads/` e **cancella i file più vecchi di 90 giorni** (escluso `menu-mese.pdf`), per evitare che il repository diventi troppo pesante.

### Link nel sito
Per aprire il PDF in una nuova finestra, inserisci nel Body del post:
    <a href="/uploads/menu-mese.pdf" target="_blank">Apri il Menu del Mese</a>

*(Ricorda di abilitare `unsafe = true` in `hugo.toml` per permettere l'HTML nel Markdown).*

### Configurazione Nginx (Importante)
Affinché l'upload funzioni, il file `/etc/nginx/sites-available/miosito` deve contenere questa `location`, con lo **slash finale** in `proxy_pass`:

    location ^~ /carica-pdf {
        proxy_pass http://127.0.0.1:5000/;  # Lo slash finale è fondamentale!
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 50M;
    }

---

## 10. Risoluzione dei Conflitti tra Nginx e NPM

Durante la configurazione, abbiamo scoperto che Nginx può essere molto "testardo" con le priorità delle regole e con i duplicati.

### Il warning "conflicting server name"
Se Nginx mostra il messaggio: `[warn] conflicting server name "nginx-pa.duckdns.org" on 0.0.0.0:80, ignored`, significa che ci sono **due blocchi `server`** che provano a gestire lo stesso dominio. 

**Soluzione**: Rimuovi il blocco `server` da `/etc/nginx/nginx.conf` e lascia la configurazione **solo** nel file `/etc/nginx/sites-available/miosito`. Dopo la modifica, riavvia con `systemctl restart nginx` e il warning sparirà.

### NPM: attenzione alle configurazioni custom
Se NPM restituisce errori `400 Bad Request` o `401 Unauthorized`, spesso è colpa di configurazioni duplicate nella sezione "Custom Locations". NPM aggiunge già i suoi header, quindi non reinserirli manualmente. Se hai dubbi, svuota quella sezione e lascia solo i campi base.

---

## 11. Riepilogo dei Servizi Attivi

| Servizio | Comando di stato | Porta |
| :--- | :--- | :--- |
| Nginx | `systemctl status nginx` | 80 |
| Docker (OAuth Decap) | `docker ps` | 9000 |
| GitHub Webhook | `systemctl status github-webhook` | 9999 |
| Uploader PDF | `systemctl status uploader` | 5000 |

---

## 12. Allineamento Manuale e Risoluzione Conflitti Git

A volte, modificando file da terminale o usando l'uploader mentre il CMS è in uso, Git può bloccare le operazioni con errori di "conflitto". Ecco come risolvere.

### Errore: "Your local changes would be overwritten"
Succede quando modifichi un file (es. `manuale.md`) sul server e poi provi a fare `git pull`, ma su GitHub c'è una versione diversa di quel file.
**Soluzione**: Scarta le modifiche locali di quel file e allineati a GitHub:
    git checkout -- content/manuale.md
    git pull
    hugo

### Errore: "non-fast-forward" o "divergent branches"
Succede quando il server ha commit locali non ancora pushati, e GitHub ha altri commit fatti dal CMS.
**Soluzione**: Esegui il pull con la strategia di merge per unire le due storie:
    git config pull.rebase false
    git pull
    # Se si apre l'editor, salva (Ctrl+O, Invio, Ctrl+X)
    git push

### Errore: "nothing to commit" durante l'upload
Se carichi un PDF identico a uno già presente, Git non ha nulla da salvare.
**Soluzione**: È normale. Il sistema mostra il messaggio "File caricato, ma nessuna modifica da salvare". Il file è già aggiornato.

### Riallineamento totale (La procedura di emergenza)
Se il repository locale è completamente incasinato e vuoi riportare il server esattamente a com'è su GitHub, esegui:
    git fetch origin
    git reset --hard origin/main
    hugo
*(Attenzione: questo cancella tutte le modifiche locali non pushate).*
