// app.js

// Get the app container element
const appContainer = document.getElementById('app');

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

async function fetchData() {
    try {
        let response = await fetch('https://opentdb.com/api.php?amount=10');

        console.log("response: +++...", response);
        //Success
        if (response.ok) {
            let data = await response.json();
            let qaArray = data.results.map(qaData => new QuestionAnswer(qaData.type, qaData.difficulty, qaData.category, qaData.question, qaData.correct_answer, qaData.incorrect_answers));
            console.log("data: +++...", qaArray);
        }
    }
    catch(error) {
        //Error
        console.error('Error:', error);
    }
};

// Render the initial app content
async function renderApp() {
    await fetchData();
}

// Initial render
renderApp();