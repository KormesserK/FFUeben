let questions = [];
let currentQuestionIndex = 0;
let isShowingAnswer = false;

fetch('gefahrenstoffe.json') // Verweis auf die JSON-Datei mit Bild und Text
    .then(response => response.json())
    .then(data => {
        questions = data;
        getNextQuestion(); // Startet mit der ersten Frage
    })
    .catch(error => console.error("Fehler beim Laden der JSON-Datei:", error));

function flipCard() {
    const questionImage = document.getElementById('questionImage');
    const answerText = document.getElementById('answerText');
    const flashcard = document.querySelector('.flashcard');

    if (isShowingAnswer) {
        // Zeigt die Frage (Bild)
        questionImage.style.display = "block";
        answerText.style.display = "none";
        isShowingAnswer = false;
    } else {
        // Zeigt die Antwort (Text)
        questionImage.style.display = "none";
        answerText.style.display = "block";
        isShowingAnswer = true;
    }
    
    flashcard.classList.toggle('flip');
}

function getNextQuestion() {
    if (questions.length === 0) return;

    currentQuestionIndex = Math.floor(Math.random() * questions.length); // Zufällige Frage auswählen
    const questionImage = document.getElementById('questionImage');
    const answerText = document.getElementById('answerText');

    // Setzt die Frage (Bild) und die Antwort (Text)
    questionImage.src = questions[currentQuestionIndex].questionImage;
    answerText.textContent = questions[currentQuestionIndex].answer;
    isShowingAnswer = false;

    // Zurücksetzen auf die Vorderseite
    questionImage.style.display = "block";
    answerText.style.display = "none";
    document.querySelector('.flashcard').classList.remove('flip');
}
