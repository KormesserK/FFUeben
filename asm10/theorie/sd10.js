let allQuestions = []; // Originales Array für den Reset
let questions = []; // Arbeits-Array für die aktuelle Spielsitzung
let currentQuestionIndex = 0;
let isShowingAnswer = false;

// Lade die Daten aus der JSON-Datei
fetch('../data/sd10_flashcards_detailed.json')
    .then(response => response.json())
    .then(data => {
        allQuestions = data; // Speichert die vollständige Liste der Fragen
        questions = [...allQuestions]; // Kopiert die Liste für die aktuelle Spielsitzung
        getNextQuestion(); // Starte mit der ersten Frage
    })
    .catch(error => console.error("Fehler beim Laden der JSON-Datei:", error));

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