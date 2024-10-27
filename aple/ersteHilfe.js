let questions = [];
let currentQuestionIndex = 0;
let isShowingAnswer = false;

fetch('ersteHilfeData.json') // Lädt die Erste-Hilfe-Fragen und Antworten
    .then(response => response.json())
    .then(data => {
        questions = data;
        getNextQuestion(); // Startet mit der ersten Frage
    });

function flipCard() {
    const cardText = document.getElementById('cardText');
    const flashcard = document.querySelector('.flashcard');
    
    if (isShowingAnswer) {
        // Wenn die Antwort gezeigt wird, kehre zur Frage zurück
        cardText.textContent = questions[currentQuestionIndex].question;
        isShowingAnswer = false;
    } else {
        // Zeige die Antwort
        cardText.textContent = questions[currentQuestionIndex].answer;
        isShowingAnswer = true;
    }
    
    flashcard.classList.toggle('flip');
}

function getNextQuestion() {
    if (questions.length === 0) return;

    currentQuestionIndex = Math.floor(Math.random() * questions.length); // Zufällige Frage auswählen
    const cardText = document.getElementById('cardText');
    cardText.textContent = questions[currentQuestionIndex].question;
    isShowingAnswer = false;

    // Stelle sicher, dass die Karte in die Frage-Position zurückkehrt
    document.querySelector('.flashcard').classList.remove('flip');
}
