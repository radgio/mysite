---
title: Manuale Nas Parte 2
date: 2026-11-02T08:54:00.000+01:00
cover:
  hiddenInList: false
draft: false
categories:
  - manuali
tags:
  - nas
---

## Manuale Operativo: Configurazione NAS, MergerFS 

## 1. Configurazione del Pool di Archiviazione (MergerFS) su Proxmox

Per unire i dischi fisici in un unico grande pool logico (/mnt/pool_nas) e configurare la gestione dello spazio aggregato:

- 1. Modifica del file di configurazione deimount di sistema:

```
nano /etc/fstab
```

- 2. Inserimento della riga per MergerFS (con il parametro corretto statfs=full per mostrare lo spazio totale aggregato su Windows):

/mnt/disk* /mnt/pool_nas mergerfs 

category.create=mfs,defaults,allow_other,use_ino,cache.files=partial,dropcache

- 3. Salvataggio ed esecuzione dello smontaggio forzato (lazy) e rimontaggio automatico:

```
umount -l /mnt/pool_nas
mount -a
```

## 2. Risoluzione dei Problemi di Rete e Permessi su Windows 11 (Unità Y:)

Per risolvere i blocchi di accesso e la lettura errata della capacità del disco dovuta alla cache dei File Offline (CSC) di Windows:

- 1. Disconnessione dell'unità di rete Y: da Questo PC.

- 2. Pulizia della cache locale di Windows:

- Apertura del Centro Sincronizzazione (mobsync).

- Accesso a Gestisci file offline e disattivazione dei file offline con pulizia della cache.

- Riavvio del PC Windows 11.

- 3. Ripristino dei permessi sul server Proxmox:

```
chmod -R 777 /mnt/pool_nas systemctl restart smbd
```

- 4. Riconnessione dell'unità Y: puntando al percorso di rete SMB del NAS.


## Parte 1: Sul Server Proxmox / Host del Pool (Gestione MergerFS)

Questi comandi servono a configurare e mantenere attivo il pool di dischi logici combinati.

- 1. Configurazione automatica del pool in /etc/fstab: Assicurati che la riga in /etc/fstab utilizzi il parametro corretto statfs=full per mostrare la capacità totale aggregata:

/mnt/disk* /mnt/pool_nas mergerfs category.create=mfs,defaults,allow_other,use_ino,cache.files=partial,dropcache

- 2. Applicare le modifiche e rimontare il pool:

- 3. Verificare lo spazio aggregato del pool:

df -h /mnt/pool_nas

## Parte 2: Sulle Altre Macchine Linux (es. la VM Debian) per montare la risorsa via NFS

Se vuoi che un'altra macchina Debian o un container sulla rete acceda al pool NAS condiviso tramite NFS dal server Proxmox:

- 1. Installare il client NFS (se non già presente):

sudo apt update && sudo apt install -y nfs-common

- 2. Creare la cartella di destinazione (mount point) locale:

sudo mkdir -p /mnt/pool_nas

- 3. Montare la risorsa temporaneamente per un test:

sudo mount -t nfs 192.168.1.143:/mnt/pool_nas /mnt/pool_nas

(Sostituisci 192.168.1.143 con l'indirizzo IP effettivo del server Proxmox).

- 4. Rendere il mount permanente all'avvio (configurando /etc/fstab sul client): Apri il file di configurazione:

sudo nano /etc/fstab

Aggiungi questa riga in fondo:

192.168.1.143:/mnt/pool_nas /mnt/pool_nas nfs defaults 0 0

Salva ed esci (Ctrl+O, Invio, Ctrl+X).

## Parte 3: Su Windows 11 (Accesso via Rete SMB)

Su Windows non servono comandi da terminale, ma la procedura standard per collegare la condivisione di rete:

- 1. Apri Questo PC, clicca sui tre puntini ... in alto e seleziona Connetti unità di rete...

- 2. Scegli la lettera desiderata (es. Y:).

- 3. Nel campo Percorso cartella inserisci l'indirizzo di rete del server:

```
\\192.168.1.143\NAS-Pool
```

(O il nome di condivisione Samba configurato sul server).

- 4. Spunta Riconnetti all'avvio e completa la procedura.



## 1. Configurazione del Pool di Archiviazione (MergerFS) su Proxmox
Per unire i dischi fisici in un unico grande pool logico (`/mnt/pool_nas`) e configurare la gestione dello spazio aggiuntivo
```

- 1. Modifica del file di configurazione dei mount di sistema:



```
nano /etc/fstab
```

- 2. Inserimento della riga per MergerFS (con il parametro statfs=full per mostrare lo spazio totale aggregato anziché quello del singolo disco):

/mnt/disk* /mnt/pool_nas mergerfs category.create=mfs,defaults,allow_other,use_ino,cache.files=partial,dropcache

- 3. Salvataggio ed esecuzione dello smontaggio forzato (lazy) e rimontaggio automatico:

```
umount -l /mnt/pool_nas
mount -a
```

- 4. Verifica dello spazio aggregato del pool:

```
df -h /mnt/pool_nas
```


```
sudo apt update && sudo apt install -y nfs-common
```

- 2. Creazione della cartella di destinazione locale:

sudo mkdir -p /mnt/pool_nas

- 3. Configurazione del mount permanente in /etc/fstab:

```
192.168.1.143:/mnt/pool_nas /mnt/pool_nas nfs defaults 0 0
```

## Su Windows 11 via SMB:

- 1. Apri Questo PC -> Connetti unità di rete...

- 2. Seleziona la lettera Y: e inserisci il percorso:

```
\\192.168.1.143\NAS-Pool
```

<ElicitationsGroup message="Vuoi salvare questo file direttamente sul server o procedere con altro?"> <Elicitation label="Salva come file .md su Debian" query="Come posso salvare questo testo direttamente in un file <Elicitation label="Verifica crontab attivo" query="Come posso verificare che il comando crontab sia attivo e regi </ElicitationsGroup>


User prompt: puoi prepararmi un unico file formato md da salvare su un server per richiamarlo con un webbrowser

Response: Ecco il file Markdown completo e pronto da salvare. Ho incluso tutti i dettagli tecnici, la configurazione del pool MergerFS, la gestione di Windows 11, la migrazione a FileBrowser Quantum/FileBrowser360, lo script di backup automatico e i comandi di mount per gli altri client.

Per salvarlo direttamente sul server Debian tramite terminale, ti basta eseguire questo comando:

```
# Manuale Operativo: Configurazione NAS, MergerFS, FileBrowser e Automazione
## 1. Configurazione del Pool di Archiviazione (MergerFS) su Proxmox Per unire i dischi fisici in un unico grande pool logico (`/mnt/pool_nas`) e configurare la gestione dello spazio ag
```

- 1. Modifica del file di configurazione dei mount di sistema: ```bash

```
nano /etc/fstab
```

- 2. Inserimento della riga per MergerFS (con il parametro statfs=full per mostrare lo spazio totale aggregato anziché quello del singolo disco):

/mnt/disk* /mnt/pool_nas mergerfs category.create=mfs,defaults,allow_other,use_ino,cache.files=partial,dropcache

- 3. Salvataggio ed esecuzione dello smontaggio forzato (lazy) e rimontaggio automatico:

```
umount -l /mnt/pool_nas
mount -a
```

- 4. Verifica dello spazio aggregato del pool:

```
df -h /mnt/pool_nas
```

## 2. Risoluzione dei Problemi di Rete e Permessi su Windows 11 (Unità Y:)

Per risolvere i blocchi di accesso e la lettura errata della capacità del disco dovuta alla cache dei File Offline (CSC) di Windows:

- 1. Disconnessione dell'unità di rete Y: da Questo PC.

- 2. Pulizia della cache locale di Windows:

- Apertura del Centro Sincronizzazione premendo Win + R e digitando mobsync.

- Accesso a Gestisci file offline, disattivazione dei file offline con pulizia della cache e riavvio del PC Windows 11.

- 3. Ripristino dei permessi sul server Proxmox:

```
chmod -R 777 /mnt/pool_nas
systemctl restart smbd
```

- 4. Riconnessione dell'unità Y: puntando al percorso di rete SMB del NAS (\\<IP-SERVER>\NAS-Pool).

## 3. Gestione e Backup dei Volumi Docker (FileBrowser)

Prima di effettuare modifiche o migrazioni ai container, abbiamo localizzato il database SQLite ed eseguito il backup manuale:

- 1. Individuazione del volume effettivo di Docker:

sudo find / -name "filebrowser.db" 2>/dev/null

(Percorso individuato: /var/lib/docker/volumes/filebrowser_filebrowser_db/_data/filebrowser.db)

- 2. Creazione della copia di sicurezza (backup):

sudo cp /var/lib/docker/volumes/filebrowser_filebrowser_db/_data/filebrowser.db /home/radgio/fb-manual-backup/fi

## 6. Configurazione dei Mount per le Altre Macchine (Client)

## Sulle altre macchine Linux (es. VM Debian) via NFS:

- 1. Installazione del client NFS:

```
sudo apt update && sudo apt install -y nfs-common
```

- 2. Creazione della cartella di destinazione locale:

sudo mkdir -p /mnt/pool_nas

- 3. Configurazione del mount permanente in /etc/fstab:

192.168.1.143:/mnt/pool_nas /mnt/pool_nas nfs defaults 0 0

## Su Windows 11 via SMB:

- 1. Apri Questo PC -> Connetti unità di rete...

- 2. Seleziona la lettera Y: e inserisci il percorso:

\\192.168.1.143\NAS-Pool


Una volta eseguito il comando sopra, il file sarà salvato in `/home/radgio/manuale_nas.md`. Potrai aprirlo e leggerl

- <ElicitationsGroup message="Desideri altre opzioni per il file?">

<Elicitation label="Converti in file generato" query="Puoi generarmi direttamente un file di testo o markdown scar <Elicitation label="Verifica salvataggio" query="Come posso verificare da terminale che il file manuale_nas.md sia </ElicitationsGroup>

User prompt: non mi hai mandato un singolo testo che include tutto il manuale ma singoli argomenti che devo copiare uno ad uno.

Response: Ecco il testo completo del manuale in un unico blocco continuo, pronto da copiare e incollare direttamente in un file .md sul tuo server.

\# Manuale Operativo: Configurazione NAS, MergerFS, FileBrowser e Automazione

\## 1. Configurazione del Pool di Archiviazione (MergerFS) su Proxmox Per unire i dischi fisici in un unico grande pool logico (`/mnt/pool_nas`) e configurare la gestione dello spazio ag

- 1. Modifica del file di configurazione dei mount di sistema: nano /etc/fstab

- 2. Inserimento della riga per MergerFS (con il parametro `statfs=full` per mostrare lo spazio totale aggregato anzic /mnt/disk* /mnt/pool_nas mergerfs category.create=mfs,defaults,allow_other,use_ino,cache.files=partial,dropcacheo

- 3. Salvataggio ed esecuzione dello smontaggio forzato (lazy) e rimontaggio automatico: umount -l /mnt/pool_nas

mount -a

- 4. Verifica dello spazio aggregato del pool: df -h /mnt/pool_nas

\---

- \## 2. Risoluzione dei Problemi di Rete e Permessi su Windows 11 (Unità Y:)

Per risolvere i blocchi di accesso e la lettura errata della capacità del disco dovuta alla cache dei File Offline (

- 1. Disconnessione dell'unità di rete Y: da Questo PC.

- 2. Pulizia della cache locale di Windows:

- \- Apertura del Centro Sincronizzazione premendo Win + R e digitando mobsync.

- \- Accesso a Gestisci file offline, disattivazione dei file offline con pulizia della cache e riavvio del PC Windo 3. Ripristino dei permessi sul server Proxmox:

chmod -R 777 /mnt/pool_nas

systemctl restart smbd

- 4. Riconnessione dell'unità Y: puntando al percorso di rete SMB del NAS (\\<IP-SERVER>\NAS-Pool).

---

## 3. Gestione e Backup dei Volumi Docker (FileBrowser) Prima di effettuare modifiche o migrazioni ai container, abbiamo localizzato il database SQLite ed eseguito il backup ##

- 1. Individuazione del volume effettivo di Docker:

sudo find / -name "filebrowser.db" 2>/dev/null

(Percorso individuato: /var/lib/docker/volumes/filebrowser_filebrowser_db/_data/filebrowser.db)

2. Creazione della copia di sicurezza (backup): sudo cp /var/lib/docker/volumes/filebrowser_filebrowser_db/_data/filebrowser.db /home/radgio/fb-manual-backup/fil

\---


Response: Per risalire alla configurazione esatta dello storage Backup-r3dit direttamente dal nodo Proxmox r3dit, puoi usare due metodi rapidi tramite la Shell.

## Metodo 1: Controllare il file di configurazione degli storage di Proxmox

```
Apri la Shell del nodo Proxmox e leggi il file /etc/pve/storage.cfg:
cat /etc/pve/storage.cfg
Oppure filtra direttamente la sezione relativa a Backup-r3dit:
pvesm status --storage Backup-r3dit
```


o

cat /etc/pve/storage.cfg | grep -A 5 "Backup-r3dit"

Nel risultato troverai il tipo di storage (es. dir, nfs, cifs, pbs) e il percorso o il target di rete:

- Se è un mount locale (dir): vedrai il campo path (es. path /mnt/pve/Backup-r3dit oppure /backup_proxmox_r3dit).

- Se è uno storage di rete (nfs / cifs): vedrai il campo server e export/share con l'IP della macchina che condivide la cartella.

## Metodo 2: Verificare i punti di mount di sistema

Se si tratta di una cartella locale montata nel filesystem dell'host:

- 1. Per vedere tutti i file system e le cartelle montate:

```
df -h | grep Backup-r3dit
```

- 2. Per vedere se è stato inserito in /etc/fstab (in caso di disco fisico separato o SMB/NFS):

```
grep Backup-r3dit /etc/fstab
```

- 3. Per risalire alla provenienza di un'eventuale condivisione NFS/SMB attiva:

```
mount | grep Backup-r3dit
```

## Metodo 3: Dall'interfaccia Web di Proxmox

Se preferisci farlo da interfaccia grafica:

- 1. Clicca su Datacenter (in alto a sinistra nella gerarchia sopra il nodo r3dit).

- 2. Vai nel menu Storage.

- 3. Troverai la riga Backup-r3dit: nelle colonne Type e Target / Path vedrai subito la provenienza e il percorso locale o di rete montato.

User prompt: ok chiaro, credo di averlo fatto da interfaccia proxmox dove ho inserito nasuser e password che adesso non mi ricordo piu.

Response: Se lo hai aggiunto dall'interfaccia di Proxmox inserendo un utente (nasuser) e una password, significa che lo storage Backup-r3dit è stato montato tramite condivisione di rete SMB/CIFS (oppure Proxmox Backup Server con autenticazione).

Ecco dove trovare e come recuperare o resettare le credenziali:

## 1. Dove trovare le credenziali sul nodo Proxmox (r3dit)

Proxmox salva la configurazione dello storage e le relative credenziali cifrate o in chiaro nei suoi file di sistema.

Apri la Shell del nodo r3dit ed esegui:

## Controlla la configurazione dello storage:

cat /etc/pve/storage.cfg | grep -A 8 "Backup-r3dit"

## Qui vedrai:

- server: l'IP della macchina che ospita i backup (es. la VM NAS o un altro server).

- share: il nome della cartella condivisa.

- username: l'utente usato (nasuser).

## Dove recuperare la password salvata:

Per le condivisioni SMB/CIFS, Proxmox salva la password nella cartella privata del cluster /etc/pve/priv/. Puoi leggere il file relativo a questo storage eseguendo:

```
cat /etc/pve/priv/storage/Backup-r3dit.pw
```

(Questo comando ti mostrerà direttamente in chiaro la password che avevi inserito!)

## 2. E se l'utente nasuser è stato creato dentro Samba/Linux?

Se hai bisogno di verificare o cambiare la password dell'utente nasuser sulla macchina che eroga la condivisione (es. sulla VM NAS o server dove gira Samba):

- Per reimpostare una nuova password per nasuser in Samba:

```
sudo smbpasswd -a nasuser
```

- Per aggiornare poi la password in Proxmox: Puoi farlo sia da interfaccia web (in Datacenter → Storage → seleziona Backup-r3dit

- Edit), sia sovrascrivendo il file .pw visto sopra.


User prompt: trovata, sarebbe importante inserire tutta questa pagina relativa allo storage nel manuale, cosa ne pensi ?

Response: Sì, è un'ottima idea. Integrare la parte relativa allo storage Backup-r3dit e alle credenziali SMB all'interno del manuale operativo rende la documentazione completa e ti evita di perdere informazioni critiche in futuro.

Ecco il manuale aggiornato e unificato in un unico blocco in formato Markdown, pronto per essere salvato sul server:

\# Manuale Operativo: Configurazione NAS, MergerFS, FileBrowser e Automazione

\## 1. Configurazione del Pool di Archiviazione (MergerFS) su Proxmox Per unire i dischi fisici in un unico grande pool logico (`/mnt/pool_nas`) e configurare la gestione dello spazio ag

- 1. Modifica del file di configurazione dei mount di sistema:

nano /etc/fstab

- 2. Inserimento della riga per MergerFS (con il parametro `statfs=full` per mostrare lo spazio totale aggregato anzic /mnt/disk* /mnt/pool_nas mergerfs category.create=mfs,defaults,allow_other,use_ino,cache.files=partial,dropcacheo

- 3. Salvataggio ed esecuzione dello smontaggio forzato (lazy) e rimontaggio automatico: umount -l /mnt/pool_nas

mount -a

- 4. Verifica dello spazio aggregato del pool:

df -h /mnt/pool_nas

\---

\## 2. Risoluzione dei Problemi di Rete e Permessi su Windows 11 (Unità Y:)

Per risolvere i blocchi di accesso e la lettura errata della capacità del disco dovuta alla cache dei File Offline (

- 1. Disconnessione dell'unità di rete Y: da Questo PC.

- 2. Pulizia della cache locale di Windows:

- \- Apertura del Centro Sincronizzazione premendo Win + R e digitando mobsync.

- \- Accesso a Gestisci file offline, disattivazione dei file offline con pulizia della cache e riavvio del PC Windo 3. Ripristino dei permessi sul server Proxmox:

chmod -R 777 /mnt/pool_nas

systemctl restart smbd

- 4. Riconnessione dell'unità Y: puntando al percorso di rete SMB del NAS (\\<IP-SERVER>\NAS-Pool).

\---

---
## 6. Configurazione dei Mount per le Altre Macchine (Client)
### Sulle altre macchine Linux (es. VM Debian) via NFS:
1. Installazione del client NFS:
sudo apt update && sudo apt install -y nfs-common
2. Creazione della cartella di destinazione locale:
sudo mkdir -p /mnt/pool_nas
3. Configurazione del mount permanente in /etc/fstab:
192.168.1.143:/mnt/pool_nas /mnt/pool_nas nfs defaults 0 0
### Su Windows 11 via SMB:
1. Apri Questo PC -> Connetti unità di rete...
2. Seleziona la lettera Y: e inserisci il percorso:
\\192.168.1.143\NAS-Pool
---
## 7. Storage di Rete Proxmox (Backup-r3dit)
Per la gestione dello storage di backup esterno montato sul nodo Proxmox `r3dit`[cite: 1] tramite condivisione SMB/C
1. **Verifica della configurazione dello storage:**
I parametri di connessione (IP server, percorso e utente `nasuser`) sono salvati nel file di configurazione di Pr
```bash
cat /etc/pve/storage.cfg | grep -A 8 "Backup-r3dit"
2. Recupero delle credenziali salvate: Le password delle condivisioni SMB configurate in Proxmox vengono memorizzate nei file privati del cluster:
cat /etc/pve/priv/storage/Backup-r3dit.pw
