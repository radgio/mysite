---
title: Manuale NAS
date: 2026-11-02T07:30:00.000+01:00
cover:
  hiddenInList: false
draft: false
categories:
  - manuali
tags:
  - nas
---
# Manuale Operativo: Configurazione NAS, MergerFS, FileBrowser e Automazione

## 1. Configurazione del Pool di Archiviazione (MergerFS) su Proxmox
Per unire i dischi fisici in un unico grande pool logico (`/mnt/pool_nas`) e configurare la gestione dello spazio aggregato:

1. Modifica del file di configurazione dei mount di sistema:
   nano /etc/fstab

2. Inserimento della riga per MergerFS (con il parametro `statfs=full` per mostrare lo spazio totale aggregato anziché quello del singolo disco):
   /mnt/disk* /mnt/pool_nas mergerfs category.create=mfs,defaults,allow_other,use_ino,cache.files=partial,dropcacheonclose=true,nonempty,statfs=full,minfreespace=20G 0 0

3. Salvataggio ed esecuzione dello smontaggio forzato (lazy) e rimontaggio automatico:
   umount -l /mnt/pool_nas
   mount -a

4. Verifica dello spazio aggregato del pool:
   df -h /mnt/pool_nas

---

## 2. Risoluzione dei Problemi di Rete e Permessi su Windows 11 (Unità Y:)
Per risolvere i blocchi di accesso e la lettura errata della capacità del disco dovuta alla cache dei File Offline (CSC) di Windows:

1. Disconnessione dell'unità di rete Y: da Questo PC.
2. Pulizia della cache locale di Windows:
   - Apertura del Centro Sincronizzazione premendo Win + R e digitando mobsync.
   - Accesso a Gestisci file offline, disattivazione dei file offline con pulizia della cache e riavvio del PC Windows 11.
3. Ripristino dei permessi sul server Proxmox:
   chmod -R 777 /mnt/pool_nas
   systemctl restart smbd
4. Riconnessione dell'unità Y: puntando al percorso di rete SMB del NAS (\\<IP-SERVER>\NAS-Pool).

---

## 3. Gestione e Backup dei Volumi Docker (FileBrowser)
Prima di effettuare modifiche o migrazioni ai container, abbiamo localizzato il database SQLite ed eseguito il backup manuale:

1. Individuazione del volume effettivo di Docker:
   sudo find / -name "filebrowser.db" 2>/dev/null
   (Percorso individuato: /var/lib/docker/volumes/filebrowser_filebrowser_db/_data/filebrowser.db)

2. Creazione della copia di sicurezza (backup):
   sudo cp /var/lib/docker/volumes/filebrowser_filebrowser_db/_data/filebrowser.db /home/radgio/fb-manual-backup/filebrowser.db.bak

---

## 4. Installazione e Avvio di FileBrowser Quantum / FileBrowser360
Per passare alla versione moderna e aggiornata utilizzando l'immagine corretta e ripristinando il vecchio database:

1. Creazione ed entrata nella cartella di lavoro sulla VM Debian:
   mkdir -p ~/filebrowser-quantum && cd ~/filebrowser-quantum
   nano docker-compose.yml

2. Configurazione del file docker-compose.yml:
services:
  filebrowser:
    image: gtstef/filebrowser:latest
    container_name: filebrowser
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      - /mnt/pool_nas:/srv
      - /var/lib/docker/volumes/filebrowser_filebrowser_db/_data:/home/filebrowser/data
    environment:
      - PUID=1000
      - PGID=1000

3. Avvio del container in background:
   sudo docker compose up -d

4. Verifica dello stato dei log e del funzionamento:
   sudo docker logs -f filebrowser

---

## 5. Script di Backup Automatico Giornaliero del Database
Per automatizzare il salvataggio giornaliero del database SQLite di FileBrowser:

1. Creazione dello script di backup:
   nano ~/backup-filebrowser.sh

   Incolla il seguente codice:
   #!/bin/bash
   DB_PATH="/var/lib/docker/volumes/filebrowser_filebrowser_db/_data/filebrowser.db"
   BACKUP_DIR="/home/radgio/fb-manual-backup"
   BACKUP_NAME="filebrowser_$(date +%Y-%m-%d).db.bak"

   mkdir -p "$BACKUP_DIR"

   if [ -f "$DB_PATH" ]; then
       cp "$DB_PATH" "$BACKUP_DIR/$BACKUP_NAME"
       echo "Backup completato: $BACKUP_NAME"
       find "$BACKUP_DIR" -name "filebrowser_*.db.bak" -mtime +7 -delete
   else
       echo "Errore: Database non trovato in $DB_PATH"
       exit 1
   fi

2. Assegnazione dei permessi di esecuzione:
   chmod +x ~/backup-filebrowser.sh

3. Pianificazione giornaliera con Crontab:
   Apri l'editor dei cron job:
   crontab -e

   Aggiungi la riga per eseguirlo ogni giorno alle 03:00:
   0 3 * * * /bin/bash /home/radgio/backup-filebrowser.sh >/dev/null 2>&1

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
