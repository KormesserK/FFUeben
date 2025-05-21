let allQuestions = []; // Originales Array für den Reset
let questions = []; // Arbeits-Array für die aktuelle Spielsitzung
let currentQuestionIndex = 0;
let isShowingAnswer = false;
let currentGroup = []; // Aktuelle Gruppe von 5 Karten
let remainingQuestions = []; // Übrige Fragen für die nächsten Gruppen

// Array mit allen JSON-Dateien
const jsonFiles = [
    '../data/fue10_flashcards_detailed.json',
    '../data/re20_flashcards_detailed.json',
    '../data/sd10_flashcards_detailed.json',
    '../data/au11_flashcards_detailed.json',
    '../data/au12_flashcards_detailed.json'
];

// Lade alle JSON-Dateien
Promise.all(jsonFiles.map(file => 
    fetch(file)
        .then(response => response.json())
        .catch(error => {
            console.error(`Fehler beim Laden von ${file}:`, error);
            return []; // Leeres Array bei Fehler
        })
))
.then(results => {
    // Alle Fragen zusammenführen
    allQuestions = results.flat();
    remainingQuestions = [...allQuestions]; // Kopiert die Liste für die nächsten Gruppen
    startNewGroup(); // Starte mit der ersten Gruppe
})
.catch(error => console.error("Fehler beim Laden der JSON-Dateien:", error));

// Funktion zum Starten einer neuen Gruppe
function startNewGroup() {
    if (remainingQuestions.length === 0) {
        alert("Glückwunsch! Sie haben alle Fragen erfolgreich gelernt!");
        return;
    }

    // Wähle die nächsten 5 Karten (oder weniger, wenn nicht genug übrig sind)
    currentGroup = remainingQuestions.splice(0, Math.min(5, remainingQuestions.length));
    currentQuestionIndex = 0;
    getNextQuestion();
    updateGroupProgress();
}

// Funktion zum Aktualisieren des Gruppenfortschritts
function updateGroupProgress() {
    const progressText = document.getElementById('groupProgress');
    if (progressText) {
        progressText.textContent = `Gruppe: ${currentGroup.length} Karten übrig`;
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
    if (currentGroup.length === 0) {
        startNewGroup();
        return;
    }

    const questionText = document.getElementById('questionText');
    const answerText = document.getElementById('answerText');

    questionText.textContent = currentGroup[currentQuestionIndex].question;
    answerText.textContent = currentGroup[currentQuestionIndex].answer;
    isShowingAnswer = false;

    questionText.style.display = "block";
    answerText.style.display = "none";
    document.querySelector('.flashcard').classList.remove('flip');
}

// Funktion zum Markieren als "Richtig"
function markCorrect() {
    if (currentGroup.length === 0) return;
    
    // Entferne die aktuelle Karte aus der Gruppe
    currentGroup.splice(currentQuestionIndex, 1);
    
    if (currentGroup.length === 0) {
        // Wenn die Gruppe leer ist, starte eine neue
        startNewGroup();
    } else {
        // Sonst zeige die nächste Karte der aktuellen Gruppe
        currentQuestionIndex = Math.min(currentQuestionIndex, currentGroup.length - 1);
        getNextQuestion();
    }
    updateGroupProgress();
}

// Funktion zum Markieren als "Falsch"
function markIncorrect() {
    // Verschiebe die aktuelle Karte ans Ende der Gruppe
    const currentCard = currentGroup.splice(currentQuestionIndex, 1)[0];
    currentGroup.push(currentCard);
    
    // Zeige die nächste Karte
    currentQuestionIndex = Math.min(currentQuestionIndex, currentGroup.length - 1);
    getNextQuestion();
    updateGroupProgress();
}

// Funktion zum Zurücksetzen des Spiels
function resetGame() {
    remainingQuestions = [...allQuestions];
    startNewGroup();
    alert("Das Spiel wurde zurückgesetzt!");
} 