// Globale Variablen
let allQuestions = []; // Originales Array für den Reset
let questions = []; // Arbeits-Array für die aktuelle Spielsitzung
let currentGroup = []; // Aktuelle Gruppe von 5 Karten
let remainingQuestions = []; // Übrige Fragen für die nächsten Gruppen
let currentQuestionIndex = 0;
let isShowingAnswer = false;
let groupModeEnabled = true;
let groupSize = 5;

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
    const groupModeCheckbox = document.getElementById('groupModeCheckbox');

    if (correctBtn) correctBtn.addEventListener('click', markCorrect);
    if (incorrectBtn) incorrectBtn.addEventListener('click', markIncorrect);
    if (nextBtn) nextBtn.addEventListener('click', getNextQuestion);
    if (resetBtn) resetBtn.addEventListener('click', resetGame);
    if (groupModeCheckbox) {
        groupModeEnabled = groupModeCheckbox.checked;
        groupModeCheckbox.addEventListener('change', () => {
            groupModeEnabled = groupModeCheckbox.checked;
            resetGame();
        });
    }
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
    currentGroup = remainingQuestions.splice(0, Math.min(groupSize, remainingQuestions.length));
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
        if (groupModeEnabled) {
            progressText.textContent = `Gruppe: ${currentGroup.length} Karten übrig`;
        } else {
            progressText.textContent = `Karten übrig: ${questions.length}`;
        }
        debugLog(`Fortschritt aktualisiert`);
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
    if (groupModeEnabled) {
        if (currentGroup.length === 0) {
            startNewGroup();
            return;
        }
        currentQuestionIndex = Math.floor(Math.random() * currentGroup.length);
        const questionText = document.getElementById('questionText');
        const answerText = document.getElementById('answerText');
        questionText.textContent = currentGroup[currentQuestionIndex].question;
        answerText.textContent = currentGroup[currentQuestionIndex].answer;
        isShowingAnswer = false;
        questionText.style.display = "block";
        answerText.style.display = "none";
        document.querySelector('.flashcard').classList.remove('flip');
    } else {
        if (questions.length === 0) {
            alert("Alle Fragen wurden durchgearbeitet!");
            return;
        }
        currentQuestionIndex = Math.floor(Math.random() * questions.length);
        const questionText = document.getElementById('questionText');
        const answerText = document.getElementById('answerText');
        questionText.textContent = questions[currentQuestionIndex].question;
        answerText.textContent = questions[currentQuestionIndex].answer;
        isShowingAnswer = false;
        questionText.style.display = "block";
        answerText.style.display = "none";
        document.querySelector('.flashcard').classList.remove('flip');
    }
    updateGroupProgress();
}

// Funktion zum Markieren als "Richtig"
function markCorrect() {
    if (groupModeEnabled) {
        if (currentGroup.length === 0) return;
        currentGroup.splice(currentQuestionIndex, 1);
        getNextQuestion();
    } else {
        if (questions.length === 0) return;
        questions.splice(currentQuestionIndex, 1);
        getNextQuestion();
    }
}

// Funktion zum Markieren als "Falsch"
function markIncorrect() {
    if (groupModeEnabled) {
        getNextQuestion();
    } else {
        getNextQuestion();
    }
}

// Funktion zum Zurücksetzen des Spiels
function resetGame() {
    questions = [...allQuestions];
    remainingQuestions = [...allQuestions];
    if (groupModeEnabled) {
        startNewGroup();
    } else {
        getNextQuestion();
    }
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
            if (groupModeEnabled) {
                startNewGroup();
            } else {
                getNextQuestion();
            }
        })
        .catch(error => {
            console.error("Fehler beim Laden der JSON-Dateien:", error);
            alert("Fehler beim Laden der Fragen: " + error.message);
        });
}

// Initialisiere die App wenn das Dokument geladen ist
document.addEventListener('DOMContentLoaded', initializeApp); 