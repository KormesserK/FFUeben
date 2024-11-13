let images = [];
let currentImageIndex = 0;

// Lade die Daten aus der JSON-Datei
fetch('melder.js')
    .then(response => response.json())
    .then(data => {
        images = data.map(item => item.imageUrl); // Extrahiere nur die Bild-URLs
        getNextImage(); // Zeige das erste Bild an
    })
    .catch(error => console.error("Fehler beim Laden der JSON-Datei:", error));

// Funktion zum Anzeigen des nächsten Bildes
function getNextImage() {
    if (images.length === 0) return; // Falls keine Bilder vorhanden sind

    const imageContent = document.getElementById('imageContent');

    // Aktualisiere das Bild basierend auf dem aktuellen Index
    imageContent.src = images[currentImageIndex];

    // Erhöhe den Index für das nächste Bild, zurück auf 0, wenn das Ende erreicht ist
    currentImageIndex = (currentImageIndex + 1) % images.length;
}
