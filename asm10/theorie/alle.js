// Globale Variablen
let allQuestions = []; // Alle Fragen aus allen JSON-Dateien
let currentGroup = []; // Aktuelle Gruppe von 5 Karten
let remainingQuestions = []; // Übrige Fragen für die nächsten Gruppen
let currentQuestionIndex = 0;
let isShowingAnswer = false;

// Array mit allen JSON-Dateien
const jsonFiles = [
    '../data/fue10_flashcards_detailed.json',
    '../data/re20_flashcards_detailed.json',
    '../data/sd10_flashcards_detailed.json',
    '../data/au11_flashcards_detailed.json',
    '../data/au12_flashcards_detailed.json'
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

    if (!questionText || !answerText || !flashcard) {
        debugLog("Fehler: DOM-Elemente nicht gefunden");
        return;
    }

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
    debugLog(`getNextQuestion aufgerufen. Aktuelle Gruppe: ${currentGroup.length} Karten`);

    if (currentGroup.length === 0) {
        debugLog("Aktuelle Gruppe ist leer, starte neue Gruppe");
        startNewGroup();
        return;
    }

    const questionText = document.getElementById('questionText');
    const answerText = document.getElementById('answerText');

    if (!questionText || !answerText) {
        debugLog("Fehler: Frage- oder Antwort-Element nicht gefunden");
        return;
    }

    questionText.textContent = currentGroup[currentQuestionIndex].question;
    answerText.textContent = currentGroup[currentQuestionIndex].answer;
    isShowingAnswer = false;

    questionText.style.display = "block";
    answerText.style.display = "none";
    document.querySelector('.flashcard').classList.remove('flip');

    debugLog(`Nächste Frage angezeigt. Index: ${currentQuestionIndex}`);
}

// Funktion zum Markieren als "Richtig"
function markCorrect() {
    debugLog("Karte als richtig markiert");

    if (currentGroup.length === 0) {
        debugLog("Keine Karten in der aktuellen Gruppe");
        return;
    }

    // Entferne die aktuelle Karte aus der Gruppe
    currentGroup.splice(currentQuestionIndex, 1);
    debugLog(`Karte entfernt. Verbleibende Karten in Gruppe: ${currentGroup.length}`);

    if (currentGroup.length === 0) {
        debugLog("Gruppe ist leer, starte neue Gruppe");
        startNewGroup();
    } else {
        currentQuestionIndex = Math.min(currentQuestionIndex, currentGroup.length - 1);
        getNextQuestion();
    }
    updateGroupProgress();
}

// Funktion zum Markieren als "Falsch"
function markIncorrect() {
    debugLog("Karte als falsch markiert");

    if (currentGroup.length === 0) {
        debugLog("Keine Karten in der aktuellen Gruppe");
        return;
    }

    // Verschiebe die aktuelle Karte ans Ende der Gruppe
    const currentCard = currentGroup.splice(currentQuestionIndex, 1)[0];
    currentGroup.push(currentCard);

    debugLog(`Karte ans Ende verschoben. Gruppenlänge: ${currentGroup.length}`);

    // Zeige die nächste Karte
    currentQuestionIndex = Math.min(currentQuestionIndex, currentGroup.length - 1);
    getNextQuestion();
    updateGroupProgress();
}

// Funktion zum Zurücksetzen des Spiels
function resetGame() {
    debugLog("Spiel wird zurückgesetzt");
    remainingQuestions = [...allQuestions];
    startNewGroup();
    alert("Das Spiel wurde zurückgesetzt!");
}

// Lade alle JSON-Dateien
function initializeApp() {
    debugLog('Initialisiere App...');
    setupEventListeners();

    Promise.all(jsonFiles.map(file =>
        fetch(file)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error(`Fehler beim Laden von ${file}:`, error);
                return [];
            })
    ))
    .then(results => {
        allQuestions = results.flat();
        debugLog(`Geladene Fragen gesamt: ${allQuestions.length}`);
        remainingQuestions = [...allQuestions];
        startNewGroup();
    })
    .catch(error => {
        console.error("Fehler beim Laden der JSON-Dateien:", error);
        alert("Fehler beim Laden der Fragen. Bitte Seite neu laden.");
    });
}

// Initialisiere die App wenn das Dokument geladen ist
document.addEventListener('DOMContentLoaded', initializeApp); 