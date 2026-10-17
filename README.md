# ⚔️ PHOTO BATTLE — Elo Photo Arena

> Applicazione web in stile retro RPG / arcade per confrontare coppie di foto e ordinarle in classifica tramite l'algoritmo di punteggio Elo. **100% client-side, sicura e privata.**

---

## 📖 Cos'è Photo Battle e Come Funziona

Photo Battle risolve un problema comune: **scegliere le migliori foto tra decine o centinaia di scatti senza stress**. Invece di dover valutare tutte le foto insieme, l'applicazione propone semplici **duelli 1 vs 1**:

1. **Scelta a coppie (A/B testing)**: Scegli la foto migliore tra le due mostrate (o dichiara un pareggio).
2. **Algoritmo Elo Dinamico**:
   - Ogni immagine parte da un punteggio base di **1200 Elo**.
   - Il fattore di calibrazione ($K$-factor) è dinamico: più alto nelle prime sfide per calibrare velocemente i punteggi, più stabile man mano che il numero di partite aumenta.
   - Il matchmaking privilegia coppie con punteggio simile o elementi con meno partite per garantire una classifica equilibrata nel minor numero di voti possibile.
3. **Classifica RPG in Tempo Reale**:
   - Visualizzazione con Tier (Leggendario, Maestro, Veterano, Combattente, Recluta).
   - Statistiche dettagliate: percentuale di vittoria, record vittorie/sconfitte/pareggi, picco massimo di Elo raggiunto.
   - Filtri e ricerca per nome file, oltre all'ingrandimento in alta risoluzione con visualizzatore dettagliato.
4. **Salvataggio & Esportazione**:
   - Salvataggio automatico continuo in memoria locale (`localStorage`).
   - Tasto **SALVA**: esporta un file compatto `.json` contenente tutti i punteggi, statistiche e storico.
   - Tasto **LOAD**: importa un file `.json` e permette di ricollegare la cartella delle foto originali indicando l'esatto percorso su disco (es. `D:\IMMAGINI\ARTISTI VARI`).
   - Tasto **RESET ALL**: azzera la sessione e pulisce completamente la memoria locale del browser in caso di necessità.

---

## 🛡️ Sicurezza & Privacy Totale (Perché è al 100% Sicuro)

Photo Battle è progettata seguendo il principio di **riservatezza assoluta**:

- **Nessun invio di immagini su Internet**: I file selezionati dal tuo computer **non vengono mai caricati su nessun server remoto, né su cloud o API terze**.
- **Elaborazione unicamente nel browser**: Il browser legge i file in locale tramite le Web API native (`URL.createObjectURL` e `File API`).
- **Nessun tracciamento o telemetria**: Nessun cookie tracciante, nessun analytics, nessun log remoto.
- **Funziona anche offline**: Una volta avviata l'app o compilata, può funzionare completamente staccata da Internet.

---

## 🚀 Come Scaricare ed Eseguire il Progetto sul Tuo Computer

### 1. Prerequisiti
Assicurati di avere installato sul tuo computer:
- **[Node.js](https://nodejs.org/)** (versione 18 o superiore consigliata). Include anche `npm`.
- **Git** (opzionale, se vuoi clonare da riga di comando).

---

### 2. Scaricare il Progetto da GitHub

Puoi scegliere uno dei due metodi:

#### Metodo A: Con Git (Consigliato per chi usa GitHub)
Apri il terminale (o Prompt dei comandi / PowerShell su Windows) ed esegui:
```bash
git clone https://github.com/TUO-USERNAME/NOME-REPO.git
cd NOME-REPO
```

#### Metodo B: Scaricamento diretto ZIP
1. Vai sulla pagina principale del tuo repository su GitHub.
2. Clicca sul pulsante verde **Code** in alto a destra.
3. Seleziona **Download ZIP**.
4. Estrai la cartella ZIP sul tuo computer (ad esempio sul Desktop o su `D:\Progetti`).
5. Apri il terminale dentro la cartella estratta.

---

### 3. Installazione delle Dipendenze

All'interno della cartella del progetto, esegui il comando:
```bash
npm install
```
*Questo comando scaricherà in locale i pacchetti necessari (React, Vite, Tailwind CSS, icone Lucide).*

---

### 4. Avvio dell'Applicazione

Esegui il comando di sviluppo:
```bash
npm run dev
```

Nel terminale vedrai un messaggio simile a:
```text
  VITE v8.3.1  ready in 200 ms

  ➜  Local:   http://localhost:3000/
```

Apri il tuo browser preferito (Chrome, Edge, Firefox, Brave, ecc.) e vai all'indirizzo:
👉 **`http://localhost:3000`**

L'applicazione sarà attiva e funzionante in locale sul tuo computer in un ambiente completamente isolato e sicuro!

---

### 5. (Opzionale) Compilazione Statica per Produzione

Se vuoi compilare una versione ottimizzata e autonoma:
```bash
npm run build
```
Verrà generata una cartella `dist/` contenente solo file HTML/CSS/JS statici e leggeri. Puoi visualizzarla in anteprima con:
```bash
npm run preview
```

---

## 🎮 Comandi da Tastiera (Stile Arcade)

Durante i duelli fotografici puoi votare rapidamente con la tastiera:

| Tasto | Azione |
| :--- | :--- |
| **Freccia Sinistra** oppure **Tasto A** | Vota la Foto a Sinistra (Foto A) |
| **Freccia Destra** oppure **Tasto D** | Vota la Foto a Destra (Foto B) |
| **Barra Spazio** oppure **Freccia Giù** | Pareggio (Draw) |
| **Ctrl + Z** (o **Cmd + Z**) | Annulla l'ultimo duello (Undo) |
| **Tasto M** | Attiva/Disattiva effetti sonori 8-bit |

---

## 📁 Tecnologie Utilizzate

- **React 19 & TypeScript**: UI moderna, reattiva e tipizzata.
- **Vite**: Build tool ultra-rapido.
- **Tailwind CSS**: Design custom retro pixel-art con estetica anni '90.
- **Web Audio API**: Sintetizzatore procedurale per effetti sonori 8-bit senza file audio esterni.
- **Icone Lucide**: Iconografia pixel & moderna.
