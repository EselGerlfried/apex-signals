# 🔥 TEAM VERBRENNER — Website

Website für den Schulwettbewerb zum Thema **"Warum der Verbrennungsmotor die beste Motorform ist"**.
Sie erklärt **Grundaufbau**, **Funktionsweise (4-Takt)** und **Vorteile** des Verbrenners und vergleicht ihn mit **Elektro** und **Wasserstoff**.

## Was drin ist
- 🎬 **Video als Startseite** (Platz für euer eigenes Video)
- ⚙️ **Interaktiver Motor** — Bauteile antippen, sie leuchten auf
- 🎞️ **Animierter 4-Takt-Motor** mit Kolben und Schwungrad
- 🔊 **Echter Motorsound per Knopfdruck** (im Browser erzeugt, keine Datei nötig)
- 📊 **Vergleichstabelle** Verbrenner vs. Elektro vs. Wasserstoff
- 📷 **Galerie** für eure eigenen Fotos
- 📱 **Responsiv** — sieht auf iPad und Handy top aus

## 🎥 Euer Video einbauen (Startseite)
1. Video als Datei `assets/video/start.mp4` speichern (kurz halten, z. B. unter 20 MB).
2. In `index.html` beim `<video id="heroVideo" ... style="display:none">` das `style="display:none"` entfernen — fertig.
   (Das Video wird automatisch angezeigt, sobald die Datei da ist.)

Zweites Erklär-Video: Datei `assets/video/erklaerung.mp4` ablegen und im Galerie-Bereich
beim `<video ... style="display:none">` das `style="display:none"` entfernen.

## 📷 Eure Fotos einbauen
Fotos in den Ordner `assets/fotos/` legen und `foto1.jpg` … `foto6.jpg` nennen.
Dann in `index.html` im Galerie-Bereich die Platzhalter durch z. B.
`<img src="assets/fotos/foto1.jpg" alt="Beschreibung">` ersetzen.

## 🌐 Online stellen (GitHub Pages)
Beim Push läuft automatisch ein Workflow (`.github/workflows/deploy.yml`), der die Seite veröffentlicht.
Die Adresse steht danach unter **Settings → Pages** bzw. im Tab **Actions** beim Deploy-Schritt.
Sie sieht meist so aus: `https://<benutzername>.github.io/apex-signals/`

Falls Pages noch nicht aktiv ist: **Settings → Pages → Source: "GitHub Actions"** auswählen.

## Dateien
- `index.html` — die Website
- `style.css` — Design
- `script.js` — Interaktion, Animationen, Motorsound
- `assets/video/` — Videos
- `assets/fotos/` — Fotos
