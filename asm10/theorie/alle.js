let allQuestions = []; // Originales Array für den Reset
let questions = []; // Arbeits-Array für die aktuelle Spielsitzung
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
    questions = [...allQuestions]; // Kopiert die Liste für die aktuelle Spielsitzung
    getNextQuestion(); // Starte mit der ersten Frage
})
.catch(error => console.error("Fehler beim Laden der JSON-Dateien:", error));

// Funktion zum Umdrehen der Karte
function flipCard() {
    const questionText = document.getElementById('questionText');
    const answerText = document.getElementById('answerText');
    const flashcard = document.querySelector('.flashcard');

    if (isShowingAnswer) {
        // Zeigt die Frage (Vorderseite)
        questionText.style.display = "block";
        answerText.style.display = "none";
        isShowingAnswer = false;
    } else {
        // Zeigt die Antwort (Rückseite)
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

    // Setzt die Frage und Antwort
    questionText.textContent = questions[currentQuestionIndex].question;
    answerText.textContent = questions[currentQuestionIndex].answer;
    isShowingAnswer = false;

    // Zurücksetzen auf die Vorderseite
    questionText.style.display = "block";
    answerText.style.display = "none";
    document.querySelector('.flashcard').classList.remove('flip');
}

// Funktion zum Markieren als "Richtig"
function markCorrect() {
    if (questions.length === 0) return;
    questions.splice(currentQuestionIndex, 1); // Entfernt die aktuelle Karte aus dem Pool
    getNextQuestion(); // Zeigt die nächste Karte
}

// Funktion zum Markieren als "Falsch"
function markIncorrect() {
    // Karte bleibt im Pool, keine Aktion notwendig
    getNextQuestion(); // Zeigt die nächste Karte
}

// Funktion zum Zurücksetzen des Spiels
function resetGame() {
    questions = [...allQuestions]; // Kopiert die originale Liste erneut
    getNextQuestion(); // Startet das Spiel von vorne
    alert("Das Spiel wurde zurückgesetzt!");
} 