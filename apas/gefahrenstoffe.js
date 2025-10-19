let allQuestions = []; // Originales Array für den Reset
let questions = []; // Arbeits-Array für die aktuelle Spielsitzung
let currentQuestionIndex = 0;
let isShowingAnswer = false;

// Lade die Daten aus der JSON-Datei
fetch('gefahrenstoffe.json')
    .then(response => response.json())
    .then(data => {
        allQuestions = data; // Speichert die vollständige Liste
        questions = [...allQuestions]; // Kopiert die Liste für die aktuelle Spielsitzung
        getNextQuestion(); // Startet mit der ersten Frage
    })
    .catch(error => console.error("Fehler beim Laden der JSON-Datei:", error));

// Funktion zum Umdrehen der Karte
function flipCard() {
    const questionImage = document.getElementById('questionImage');
    const answerImage = document.getElementById('answerImage');
    const answerText = document.getElementById('answerText');
    const flashcard = document.querySelector('.flashcard');

    if (isShowingAnswer) {
        // Zeigt die Frage (Vorderseite)
        questionImage.style.display = "block";
        answerImage.style.display = "none";
        answerText.style.display = "none";
        isShowingAnswer = false;
    } else {
        // Zeigt die Antwort (Rückseite)
        questionImage.style.display = "none";

        // Entscheidet, ob ein Bild oder ein Text als Antwort angezeigt wird
        if (questions[currentQuestionIndex].answerImage) {
            answerImage.src = questions[currentQuestionIndex].answerImage;
            answerImage.style.display = "block";
            answerText.style.display = "none";
        } else {
            answerText.textContent = questions[currentQuestionIndex].answer;
            answerText.style.display = "block";
            answerImage.style.display = "none";
        }

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
    const questionImage = document.getElementById('questionImage');
    const answerImage = document.getElementById('answerImage');
    const answerText = document.getElementById('answerText');

    // Setzt die Frage (Bild) und die Antwort (Bild oder Text)
    questionImage.src = questions[currentQuestionIndex].questionImage;

    if (questions[currentQuestionIndex].answerImage) {
        answerImage.src = questions[currentQuestionIndex].answerImage;
    }
    answerText.textContent = questions[currentQuestionIndex].answer || ""; // Leerer Text, falls keine Antwort vorhanden

    isShowingAnswer = false;

    // Zurücksetzen auf die Vorderseite
    questionImage.style.display = "block";
    answerImage.style.display = "none";
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
