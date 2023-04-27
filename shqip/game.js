const question = document.getElementById('question');
const choices = Array.from(document.getElementsByClassName('choice-text'));
const progressText = document.getElementById('progressText');
const scoreText = document.getElementById('score');
const progressBarFull = document.getElementById('progressBarFull');
const loader = document.getElementById('loader');
const game = document.getElementById('game');
let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuesions = [];

let questions = [];

async function translate(text){
    var sourceText = text;
    var sourceLang = 'en';
    var targetLang = 'sq';
    var res = null;
    // console.log(sourceText);
    
    var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl="+ sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(sourceText);
    // console.log(url);

    try {
        const response = await fetch(url);
        const data_1 = await response.json();
        return data_1[0][0][0];
    } catch (error) {
        return console.error(error);
    }
}

fetch(
    'https://the-trivia-api.com/api/questions?limit=20&difficulty=easy'
)
    .then((res ) => {
        return res.json();
    })
    .then(async (loadedQuestions) => {
        questions = loadedQuestions.map(async (loadedQuestion) => {
            const formattedQuestion = {
                question: await translate(loadedQuestion.question),
            };
            let test = [];
            await Promise.all(loadedQuestion.incorrectAnswers.map(async x => {
                let val = await translate(x);
                test.push(val);
            }));
            const answerChoices = [...test];
            formattedQuestion.answer = Math.floor(Math.random() * 4) + 1;
            answerChoices.splice(
                formattedQuestion.answer - 1,
                0,
                await translate(loadedQuestion.correctAnswer)
            );

            answerChoices.forEach((choice, index) => {
                formattedQuestion['choice' + (index + 1)] = choice;
            });

            return formattedQuestion;
        });

        questions = await Promise.all(questions);

        startGame();
    })
    .catch((err) => {
        console.error(err);
    });

//CONSTANTS
const CORRECT_BONUS = 10;
const MAX_QUESTIONS = 20;

startGame = () => {
    questionCounter = 0;
    score = 0;
    availableQuesions = [...questions];
    getNewQuestion();
    game.classList.remove('hidden');
    loader.classList.add('hidden');
};

getNewQuestion = () => {
    if (availableQuesions.length === 0 || questionCounter >= MAX_QUESTIONS) {
        localStorage.setItem('mostRecentScore', score);
        //go to the end page
        return window.location.assign('/shqip/end.html');
    }
    questionCounter++;
    progressText.innerText = `Pyetje ${questionCounter}/${MAX_QUESTIONS}`;
    //Update the progress bar
    progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

    const questionIndex = Math.floor(Math.random() * availableQuesions.length);
    currentQuestion = availableQuesions[questionIndex];
    question.innerText = currentQuestion.question;

    choices.forEach((choice) => {
        const number = choice.dataset['number'];
        choice.innerText = currentQuestion['choice' + number];
    });

    availableQuesions.splice(questionIndex, 1);
    acceptingAnswers = true;
};

choices.forEach((choice) => {
    choice.addEventListener('click', (e) => {
        if (!acceptingAnswers) return;

        acceptingAnswers = false;
        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset['number'];

        const classToApply =
            selectedAnswer == currentQuestion.answer ? 'correct' : 'incorrect';

        if (classToApply === 'correct') {
            incrementScore(CORRECT_BONUS);
        }

        selectedChoice.parentElement.classList.add(classToApply);

        setTimeout(() => {
            selectedChoice.parentElement.classList.remove(classToApply);
            getNewQuestion();
        }, 1000);
    });
});

incrementScore = (num) => {
    score += num;
    scoreText.innerText = score;
};

// async function translate(text){
  
//     var sourceText = text;
//     var sourceLang = 'en';
//     var targetLang = 'sq';
//     var res = null;
//     console.log(sourceText);
    
//     var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl="+ sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(sourceText);
//     console.log(url);

//     try {
//         const response = await fetch(url);
//         const data_1 = await response.json();
//         return data_1[0][0][0];
//     } catch (error) {
//         return console.error(error);
//     }
// }