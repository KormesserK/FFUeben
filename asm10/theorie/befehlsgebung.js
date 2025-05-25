let allQuestions = []; // Originales Array für den Reset
let questions = []; // Arbeits-Array für die aktuelle Spielsitzung
let currentQuestionIndex = 0;
let isShowingAnswer = false;

// Lade die Daten aus der JSON-Datei
fetch('../data/befehlsgebung_flashcards.json')
    .then(response => response.json())
    .then(data => {
        allQuestions = data;
        questions = [...allQuestions];
        getNextQuestion();
    })
    .catch(error => console.error("Fehler beim Laden der JSON-Datei:", error));

// Funktion zum Umdrehen der Karte
function flipCard() {
    const questionContent = document.getElementById('cardQuestion');
    const answerContent = document.getElementById('cardAnswer');
    const flashcard = document.querySelector('.flashcard');

    if (isShowingAnswer) {
        questionContent.style.display = "block";
        answerContent.style.display = "none";
        isShowingAnswer = false;
    } else {
        questionContent.style.display = "none";
        answerContent.style.display = "block";
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

    currentQuestionIndex = Math.floor(Math.random() * questions.length);
    const currentQuestion = questions[currentQuestionIndex];

    // Setze das Bild und die Situation
    document.getElementById('situationImage').src = `../befehlsgebung/${currentQuestion.bild}`;
    document.getElementById('situationText').textContent = currentQuestion.situation;

    // Setze die Befehlsdetails für den Trupp
    document.getElementById('truppLage').textContent = currentQuestion.befehl_trupp.lage;
    document.getElementById('truppEntschluss').textContent = currentQuestion.befehl_trupp.entschluss;
    document.getElementById('truppZiel').textContent = currentQuestion.befehl_trupp.durchfuehrung.ziel;
    document.getElementById('truppWeg').textContent = currentQuestion.befehl_trupp.durchfuehrung.weg;
    document.getElementById('truppMittel').textContent = currentQuestion.befehl_trupp.durchfuehrung.mittel;

    // Setze die Befehlsdetails für die Führungskraft
    document.getElementById('fuehrungLage').textContent = currentQuestion.befehl_fuehrungskraft.lage;
    document.getElementById('fuehrungEntschluss').textContent = currentQuestion.befehl_fuehrungskraft.entschluss;
    document.getElementById('fuehrungZiel').textContent = currentQuestion.befehl_fuehrungskraft.durchfuehrung.ziel;
    document.getElementById('fuehrungWeg').textContent = currentQuestion.befehl_fuehrungskraft.durchfuehrung.weg;
    document.getElementById('fuehrungMittel').textContent = currentQuestion.befehl_fuehrungskraft.durchfuehrung.mittel;
    document.getElementById('fuehrungVerbindung').textContent = currentQuestion.befehl_fuehrungskraft.verbindung;
    document.getElementById('fuehrungVersorgung').textContent = currentQuestion.befehl_fuehrungskraft.versorgung;

    // Zurücksetzen auf die Vorderseite
    isShowingAnswer = false;
    document.getElementById('cardQuestion').style.display = "block";
    document.getElementById('cardAnswer').style.display = "none";
    document.querySelector('.flashcard').classList.remove('flip');
}

// Funktion zum Markieren als "Richtig"
function markCorrect() {
    if (questions.length === 0) return;
    questions.splice(currentQuestionIndex, 1);
    getNextQuestion();
}

// Funktion zum Markieren als "Falsch"
function markIncorrect() {
    getNextQuestion();
}

// Funktion zum Zurücksetzen des Spiels
function resetGame() {
    questions = [...allQuestions];
    getNextQuestion();
    alert("Das Spiel wurde zurückgesetzt!");
} 