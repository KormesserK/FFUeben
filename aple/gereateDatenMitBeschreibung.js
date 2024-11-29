let allDevices = []; // Originales Array für den Reset
let devices = []; // Arbeits-Array für die aktuelle Spielsitzung
let currentDeviceIndex = 0;
let isShowingAnswer = false;

// Lade die Daten aus der JSON-Datei
fetch('geraeteDataMitBeschreibung.json')
    .then(response => response.json())
    .then(data => {
        allDevices = data; // Speichert die vollständige Liste der Geräte
        devices = [...allDevices]; // Kopiert die Liste für die aktuelle Spielsitzung
        getNextQuestion(); // Starte mit dem ersten Gerät
    })
    .catch(error => console.error("Fehler beim Laden der JSON-Datei:", error));

// Funktion zum Umdrehen der Karte
function flipCard() {
    const nameText = document.getElementById('nameText');
    const descriptionText = document.getElementById('descriptionText');
    const roomText = document.getElementById('roomText');
    const flashcard = document.querySelector('.flashcard');

    if (isShowingAnswer) {
        // Zeigt den Gerätenamen (Vorderseite)
        nameText.style.display = "block";
        descriptionText.style.display = "none";
        roomText.style.display = "none";
        isShowingAnswer = false;
    } else {
        // Zeigt die Beschreibung und den Raum (Rückseite)
        nameText.style.display = "none";
        descriptionText.style.display = "block";
        roomText.style.display = "block";
        isShowingAnswer = true;
    }
    
    flashcard.classList.toggle('flip');
}

// Funktion zum Abrufen des nächsten Geräts
function getNextQuestion() {
    if (devices.length === 0) {
        alert("Alle Geräte wurden durchgearbeitet!");
        return;
    }

    currentDeviceIndex = Math.floor(Math.random() * devices.length); // Zufälliges Gerät auswählen
    const nameText = document.getElementById('nameText');
    const descriptionText = document.getElementById('descriptionText');
    const roomText = document.getElementById('roomText');

    // Setzt den Gerätenamen, die Beschreibung und den Raum
    nameText.textContent = devices[currentDeviceIndex].name;
    descriptionText.textContent = "Beschreibung: " + devices[currentDeviceIndex].description;
    roomText.textContent = "Raum: " + devices[currentDeviceIndex].Raum;
    isShowingAnswer = false;

    // Zurücksetzen auf die Vorderseite
    nameText.style.display = "block";
    descriptionText.style.display = "none";
    roomText.style.display = "none";
    document.querySelector('.flashcard').classList.remove('flip');
}

// Funktion zum Markieren als "Richtig"
function markCorrect() {
    if (devices.length === 0) return;
    devices.splice(currentDeviceIndex, 1); // Entfernt die aktuelle Karte aus dem Pool
    getNextQuestion(); // Zeigt die nächste Karte
}

// Funktion zum Markieren als "Falsch"
function markIncorrect() {
    // Karte bleibt im Pool, keine Aktion notwendig
    getNextQuestion(); // Zeigt die nächste Karte
}

// Funktion zum Zurücksetzen des Spiels
function resetGame() {
    devices = [...allDevices]; // Kopiert die originale Liste erneut
    getNextQuestion(); // Startet das Spiel von vorne
    alert("Das Spiel wurde zurückgesetzt!");
}
