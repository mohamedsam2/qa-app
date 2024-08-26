// app.js

// Get the app container element
const appContainer = document.getElementById('app');

let difficulty;
let questionsData;
let currentQuestion = 0;
let maxQuestions = 5;
let selectedAnswer;
let correctAnswer;
let correctAnswersCount = 0;
let timeOut;

// Define app's classes and functions
class QuestionAnswer {
    constructor(type, difficulty, category, question, correct_answer, incorrect_answers) {
        this.type = type;
        this.difficulty = difficulty;
        this.category = category;
        this.question = question;
        this.correct_answer = correct_answer;
        this.incorrect_answers = incorrect_answers;
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [decodeURIComponent(array[j]), decodeURIComponent(array[i])];
    }
}

async function fetchData() {
    try {
        let response = await fetch(`https://opentdb.com/api.php?amount=5&type=multiple&difficulty${difficulty}&encode=url3986`);

        //Success
        if (response.ok) {
            let data = await response.json();
            let qaArray = data.results.map(qaData => new QuestionAnswer(qaData.type, qaData.difficulty, qaData.category, qaData.question, qaData.correct_answer, qaData.incorrect_answers));
            return qaArray;
        }
    }
    catch(error) {
        //Error
        console.error('Error:', error);
    }
};

async function bindDataToLayout(currentQuestion) {
    try {
        let checkAnimationContainer = document.getElementById('checkAnimation');
        let errorAnimationContainer = document.getElementById('errorAnimation');
        checkAnimationContainer.classList.add('hidden');
        errorAnimationContainer.classList.add('hidden');

        //Setting current question number
        let questionCounterContainer = document.getElementById('question-counter');
        questionCounterContainer.innerText = `${currentQuestion + 1}/${questionsData.length}`;

        //Setting question value
        let questionContainer = document.getElementById('question-container');
        questionContainer.innerText = decodeURIComponent(questionsData[currentQuestion].question);

        //Fetching questions list layout and bind data
        let responsesHtmlLayout = await fetch('views/responses-list.html').then(response => response.text());

        let answers = questionsData[currentQuestion].incorrect_answers;
        correctAnswer = decodeURIComponent(questionsData[currentQuestion].correct_answer);
        answers.push(correctAnswer);
        shuffleArray(answers);

        let bindedLayout = responsesHtmlLayout.replace('{{ choice1 }}', answers[0])
                                    .replace('{{ choice2 }}', answers[1])
                                    .replace('{{ choice3 }}', answers[2])
                                    .replace('{{ choice4 }}', answers[3])
                                    .replace('{{ value1 }}', answers[0])
                                    .replace('{{ value2 }}', answers[1])
                                    .replace('{{ value3 }}', answers[2])
                                    .replace('{{ value4 }}', answers[3]);

        let responsesContainer = document.getElementById('responses-container');
        responsesContainer.innerHTML = bindedLayout;
        bindOnChoiceCheck();
        
        let countDownAnimation = document.getElementById('countDownAnimation');
        countDownAnimation.classList.remove('hidden');
        countDownAnimation.currentTime = 0;
        countDownAnimation.play();

        //Wait 10s before going to the next question
        timeOut = setTimeout(() => {
            let answerButton = document.getElementById('answer-button');
            answerButton.disabled = true;
            disableReponseChoices();
        }, 10000);
    }
    catch(error) {
        //Error
        console.error('Error:', error);
    }
}

async function goToNextQuestion() {
    currentQuestion++;
    clearTimeout(timeOut);

    if(selectedAnswer === correctAnswer) {
        correctAnswersCount++;
    }
    
    if(currentQuestion === maxQuestions){
        
        //Fetching questions list layout and bind data
        let resultHtmlLayout = await fetch('views/result.html').then(response => response.text());
        let bindedLayout = resultHtmlLayout.replace('{{ count }}', correctAnswersCount)
                                            .replace('{{ total }}', maxQuestions);

        let mainContainer = document.getElementById('main-container');
        let secondContainer = document.getElementById('second-container');
        secondContainer.innerHTML = bindedLayout;
        secondContainer.classList.remove('hidden');
        mainContainer.classList.add('hidden');

        bindOnResetButtonClick();
        return;
    }

    await bindDataToLayout(currentQuestion);

    let answerButton = document.getElementById('answer-button');
    answerButton.disabled = false;
}

function disableReponseChoices() {
    //Disable response radio buttons
    let responseElementsWithClass = document.querySelectorAll('input[name="response"]');
    responseElementsWithClass.forEach(radioInput => {
        radioInput.disabled = true;
    });
}

//Events
function bindOnDifficultyCheck() {
    let radioButtons = document.querySelectorAll('input[name="difficulty"]');

    radioButtons.forEach(radioButton => {
        radioButton.addEventListener('click', () => {
            difficulty = radioButton.value;

            let difficultyElementsWithClass = document.querySelectorAll('.difficulty');
            difficultyElementsWithClass.forEach(element => {
                element.classList.remove('checked');
            });
            radioButton.parentElement.classList.add('checked');
        });
    });
}
function bindOnChoiceCheck() {
    let radioButtons = document.querySelectorAll('input[name="response"]');

    radioButtons.forEach(radioButton => {
        radioButton.addEventListener('click', () => {
            selectedAnswer = radioButton.value;

            let responseElementsWithClass = document.querySelectorAll('.response');
            responseElementsWithClass.forEach(element => {
                element.classList.remove('checked');
            });
            radioButton.parentElement.classList.add('checked');

            let answerButton = document.getElementById('answer-button');
            answerButton.disabled = false;
        });
    });
}

function onAnswerButtonClick() {
    let checkAnimationContainer = document.getElementById('checkAnimation');
    let errorAnimationContainer = document.getElementById('errorAnimation');
    let countDownAnimation = document.getElementById('countDownAnimation');
    let checkedResponseElementContainer = document.getElementsByClassName('checked');
    let answerButton = document.getElementById('answer-button');
    answerButton.disabled = true;
    countDownAnimation.classList.add('hidden');

    if(selectedAnswer === correctAnswer) {
        checkAnimationContainer.classList.remove('hidden');
        errorAnimationContainer.classList.add('hidden');
        checkedResponseElementContainer[0].classList.add('correct');
    }
    else {
        checkAnimationContainer.classList.add('hidden');
        errorAnimationContainer.classList.remove('hidden');
        errorAnimationContainer.currentTime = 0;
        errorAnimationContainer.play();
        checkedResponseElementContainer[0].classList.add('wrong');
    }

    //Disable response radio buttons after aswering
    disableReponseChoices();
}

function bindOnResetButtonClick() {
    let resetButton = document.getElementById('reset-button');
    resetButton.addEventListener('click', async () => {
        await initializeDifficulty();
        let mainContainer = document.getElementById('main-container');
        let secondContainer = document.getElementById('second-container');
        mainContainer.classList.add('hidden');
        secondContainer.classList.remove('hidden');
        correctAnswersCount = 0;
    });
}

function bindOnStartButtonClick() {
    let startButton = document.getElementById('start-button');
    startButton.addEventListener('click', async (event) => {
        event.preventDefault();
        
        await initializeQA();
        let mainContainer = document.getElementById('main-container');
        let secondContainer = document.getElementById('second-container');
        mainContainer.classList.remove('hidden');
        secondContainer.classList.add('hidden');
    });
}

async function initializeQA() {
    currentQuestion = 0;
    //Fetching data to bind the layout
    questionsData = await fetchData();

    await bindDataToLayout(currentQuestion);
}

async function initializeDifficulty() {
    //Fetching difficulty list layout
    let difficultyHtmlLayout = await fetch('views/choose-difficulty.html').then(response => response.text());
    let mainContainer = document.getElementById('main-container');
    let secondContainer = document.getElementById('second-container');
    secondContainer.innerHTML = difficultyHtmlLayout;
    secondContainer.classList.remove('hidden');
    mainContainer.classList.add('hidden');
    bindOnDifficultyCheck();
    bindOnStartButtonClick();
}

// Render the initial app content
async function renderApp() {
    await initializeDifficulty();
}

// Initial render
renderApp();