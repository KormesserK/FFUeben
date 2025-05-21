// Globale Variablen
let allQuestions = []; // Originales Array für den Reset
let questions = []; // Arbeits-Array für die aktuelle Spielsitzung
let currentGroup = []; // Aktuelle Gruppe von 5 Karten
let remainingQuestions = []; // Übrige Fragen für die nächsten Gruppen
let currentQuestionIndex = 0;
let isShowingAnswer = false;

// Liste aller JSON-Dateien (absolute Pfade für GitHub Pages!)
const jsonFiles = [
    '/FFUeben/asm10/data/fue10_flashcards_detailed.json',
    '/FFUeben/asm10/data/re20_flashcards_detailed.json',
    '/FFUeben/asm10/data/sd10_flashcards_detailed.json',
    '/FFUeben/asm10/data/au11_flashcards_detailed.json',
    '/FFUeben/asm10/data/au12_flashcards_detailed.json'
];

// Debug-Funktion
function debugLog(message) {
    console.log(message);
}

// Event-Listener einrichten
function setupEventListeners() {
    const correctBtn = document.getElementById('correctBtn');
    const incorrectBtn = document.getElementById('incorrectBtn');
    const nextBtn = document.getElementById('nextBtn');
    const resetBtn = document.getElementById('resetBtn');

    if (correctBtn) correctBtn.addEventListener('click', markCorrect);
    if (incorrectBtn) incorrectBtn.addEventListener('click', markIncorrect);
    if (nextBtn) nextBtn.addEventListener('click', getNextQuestion);
    if (resetBtn) resetBtn.addEventListener('click', resetGame);

    debugLog('Event-Listener eingerichtet');
}

// Funktion zum Starten einer neuen Gruppe
function startNewGroup() {
    debugLog('Starte neue Gruppe');
    debugLog(`Verbleibende Fragen: ${remainingQuestions.length}`);

    if (remainingQuestions.length === 0) {
        alert("Glückwunsch! Sie haben alle Fragen erfolgreich gelernt!");
        return;
    }

    // Wähle die nächsten 5 Karten (oder weniger, wenn nicht genug übrig sind)
    currentGroup = remainingQuestions.splice(0, Math.min(5, remainingQuestions.length));
    currentQuestionIndex = 0;

    debugLog(`Neue Gruppe erstellt mit ${currentGroup.length} Karten`);
    debugLog(`Verbleibende Fragen nach Gruppenbildung: ${remainingQuestions.length}`);

    // Mische die Karten in der aktuellen Gruppe
    currentGroup = shuffleArray(currentGroup);
    
    getNextQuestion();
    updateGroupProgress();
}

// Funktion zum Mischen eines Arrays
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Funktion zum Aktualisieren des Gruppenfortschritts
function updateGroupProgress() {
    const progressText = document.getElementById('groupProgress');
    if (progressText) {
        progressText.textContent = `Gruppe: ${currentGroup.length} Karten übrig`;
        debugLog(`Fortschritt aktualisiert: ${currentGroup.length} Karten übrig`);
    } else {
        debugLog("Fehler: progressText Element nicht gefunden");
    }
}

// Funktion zum Umdrehen der Karte
function flipCard() {
    const questionText = document.getElementById('questionText');
    const answerText = document.getElementById('answerText');
    const flashcard = document.querySelector('.flashcard');

    if (isShowingAnswer) {
        questionText.style.display = "block";
        answerText.style.display = "none";
        isShowingAnswer = false;
    } else {
        questionText.style.display = "none";
        answerText.style.display = "block";
        isShowingAnswer = true;
    }
    flashcard.classList.toggle('flip');
}

// Funktion zum Abrufen der nächsten Frage
function getNextQuestion() {
    if (questions.length === 0) {
        alert("Alle Fragen wurden durchgearbeitet!");
        return;
    }

    currentQuestionIndex = Math.floor(Math.random() * questions.length); // Zufällige Frage auswählen
    const questionText = document.getElementById('questionText');
    const answerText = document.getElementById('answerText');

    questionText.textContent = questions[currentQuestionIndex].question;
    answerText.textContent = questions[currentQuestionIndex].answer;
    isShowingAnswer = false;

    questionText.style.display = "block";
    answerText.style.display = "none";
    document.querySelector('.flashcard').classList.remove('flip');
}

// Funktion zum Markieren als "Richtig"
function markCorrect() {
    if (questions.length === 0) return;
    questions.splice(currentQuestionIndex, 1); // Entfernt die aktuelle Karte aus dem Pool
    getNextQuestion();
}

// Funktion zum Markieren als "Falsch"
function markIncorrect() {
    getNextQuestion(); // Karte bleibt im Pool
}

// Funktion zum Zurücksetzen des Spiels
function resetGame() {
    questions = [...allQuestions];
    getNextQuestion();
    alert("Das Spiel wurde zurückgesetzt!");
}

// Lade alle JSON-Dateien
function initializeApp() {
    debugLog('Initialisiere App...');
    setupEventListeners();

    debugLog('Versuche JSON-Dateien zu laden...');
    jsonFiles.forEach(file => debugLog(`Lade Datei: ${file}`));

    // Alle Dateien laden und zusammenfügen
    Promise.all(jsonFiles.map(file => fetch(file).then(r => r.json())))
        .then(results => {
            allQuestions = results.flat(); // Alle Fragen in ein Array
            questions = [...allQuestions];
            remainingQuestions = [...allQuestions];
            startNewGroup();
        })
        .catch(error => {
            console.error("Fehler beim Laden der JSON-Dateien:", error);
            alert("Fehler beim Laden der Fragen: " + error.message);
        });
}

// Initialisiere die App wenn das Dokument geladen ist
document.addEventListener('DOMContentLoaded', initializeApp); 