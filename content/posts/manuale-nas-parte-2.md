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
# Manuale Operativo: Configurazione NAS, MergerFS, FileBrowser e Automazione

## 1. Configurazione del Pool di Archiviazione (MergerFS) su Proxmox

Per unire i dischi fisici in un unico grande pool logico (`/mnt/pool_nas`) e configurare la gestione dello spazio aggregato:

1. Modifica del file di configurazione dei mount di sistema:

```bash
nano /etc/fstab
```

2. Inserimento della riga per MergerFS (con il parametro `statfs=full` per mostrare lo spazio totale aggregato anziché quello del singolo disco):

```
/mnt/disk* /mnt/pool_nas mergerfs category.create=mfs,defaults,allow_other,use_ino,cache.files=partial,dropcache
```

3. Salvataggio ed esecuzione dello smontaggio forzato (lazy) e rimontaggio automatico:

```bash
umount -l /mnt/pool_nas
mount -a
```

4. Verifica dello spazio aggregato del pool:

```bash
df -h /mnt/pool_nas
```

---

## 2. Risoluzione dei Problemi di Rete e Permessi su Windows 11 (Unità Y:)

Per risolvere i blocchi di accesso e la lettura errata della capacità del disco dovuta alla cache dei File Offline (CSC) di Windows:

1. Disconnessione dell'unità di rete Y: da Questo PC.
2. Pulizia della cache locale di Windows:
   - Apertura del Centro Sincronizzazione premendo `Win + R` e digitando `mobsync`.
   - Accesso a Gestisci file offline, disattivazione dei file offline con pulizia della cache e riavvio del PC Windows 11.
3. Ripristino dei permessi sul server Proxmox:

```bash
chmod -R 777 /mnt/pool_nas
systemctl restart smbd
```

4. Riconnessione dell'unità Y: puntando al percorso di rete SMB del NAS (`\\<IP-SERVER>\NAS-Pool`).

---

## 3. Gestione e Backup dei Volumi Docker (FileBrowser)

Prima di effettuare modifiche o migrazioni ai container, localizzare il database SQLite ed eseguire il backup manuale:

1. Individuazione del volume effettivo di Docker:

```bash
sudo find / -name "filebrowser.db" 2>/dev/null
```

Percorso individuato: `/var/lib/docker/volumes/filebrowser_filebrowser_db/_data/filebrowser.db`

2. Creazione della copia di sicurezza (backup):

```bash
sudo cp /var/lib/docker/volumes/filebrowser_filebrowser_db/_data/filebrowser.db /home/radgio/fb-manual-backup/filebrowser.db
```

---

## 4. Configurazione dei Mount per le Altre Macchine (Client)

### Sulle altre macchine Linux (es. VM Debian) via NFS

1. Installazione del client NFS:

```bash
sudo apt update && sudo apt install -y nfs-common
```

2. Creazione della cartella di destinazione locale:

```bash
sudo mkdir -p /mnt/pool_nas
```

3. Configurazione del mount permanente in `/etc/fstab`:

```
192.168.1.143:/mnt/pool_nas /mnt/pool_nas nfs defaults 0 0
```

### Su Windows 11 via SMB

1. Apri Questo PC -> Connetti unità di rete...
2. Seleziona la lettera `Y:` e inserisci il percorso:

```
\\192.168.1.143\NAS-Pool
```

---

## 5. Storage di Rete Proxmox (Backup-r3dit)

Per la gestione dello storage di backup esterno montato sul nodo Proxmox `r3dit` tramite condivisione SMB/CIFS:

1. **Verifica della configurazione dello storage:**
   I parametri di connessione (IP server, percorso e utente `nasuser`) sono salvati nel file di configurazione di Proxmox:

```bash
cat /etc/pve/storage.cfg | grep -A 8 "Backup-r3dit"
```

2. **Recupero delle credenziali salvate:**
   Le password delle condivisioni SMB configurate in Proxmox vengono memorizzate nei file privati del cluster:

```bash
cat /etc/pve/priv/storage/Backup-r3dit.pw
```

In alternativa, per visualizzare lo stato dello storage:

```bash
pvesm status --storage Backup-r3dit
```

3. **Verifica dei punti di mount di sistema:**

```bash
df -h | grep Backup-r3dit
grep Backup-r3dit /etc/fstab
mount | grep Backup-r3dit
```

4. **Reimpostazione della password dell'utente Samba (se necessario):**

```bash
sudo smbpasswd -a nasuser
```

---

## 6. Accesso da Interfaccia Web Proxmox

Per verificare la configurazione dello storage da GUI:

1. Clicca su **Datacenter** (in alto a sinistra nella gerarchia sopra il nodo `r3dit`).
2. Vai nel menu **Storage**.
3. Trova la riga `Backup-r3dit`: nelle colonne **Type** e **Target / Path** vedrai subito la provenienza e il percorso locale o di rete montato.
