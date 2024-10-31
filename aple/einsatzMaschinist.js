let questions = [];
let currentQuestionIndex = 0;
let isShowingAnswer = false;

fetch('einsatzmaschinistData.json') // Verweis auf die JSON-Datei für Einsatzmaschinist
    .then(response => response.json())
    .then(data => {
        questions = data;
        getNextQuestion(); // Startet mit der ersten Frage
    })
    .catch(error => console.error("Fehler beim Laden der JSON-Datei:", error));

function flipCard() {
    console.log("karte umgedreht");
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
    console.log("nächste Frage");
    if (questions.length === 0) return;

    currentQuestionIndex = Math.floor(Math.random() * questions.length); // Zufällige Frage auswählen
    const cardText = document.getElementById('cardText');
    cardText.textContent = questions[currentQuestionIndex].question;
    isShowingAnswer = false;

    // Zurücksetzen auf die Vorderseite
    document.querySelector('.flashcard').classList.remove('flip');
}
