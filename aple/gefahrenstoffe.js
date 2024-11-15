let questions = [];
let currentQuestionIndex = 0;
let isShowingAnswer = false;

// Lade die Daten aus der JSON-Datei
fetch('gefahrenstoffe.json')
    .then(response => response.json())
    .then(data => {
        questions = data;
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
    if (questions.length === 0) return;

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
