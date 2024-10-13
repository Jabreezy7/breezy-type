window.addEventListener("load", function () {
    main();
});

class TypingGame {
    constructor() {
        this.words = [];
        this.gameTime = 10 * 1000;
        this.timer = null;
        this.cursor = document.getElementById("cursor");
        this.setupListeners();
        this.loadWords();
    }

    // Load words from the JSON file
    async loadWords() {
        try {
            const response = await fetch('common.json');
            if (!response.ok) {
                throw new Error('Failed to load words.');
            }
            const data = await response.json();
            this.words = data.commonWords;
            this.newGame();
        } catch (error) {
            console.error(error);
        }
    }

    // Set up event listeners for user key input and start new game request
    setupListeners() {
        // Listen for new game request 
        document.getElementById("newGameButton").addEventListener("click", () => {
            this.gameOver();
            this.newGame();
        });

        // Listen for keydown events to handle typing
        document.getElementById("game").addEventListener("keydown", (ev) => this.handleKeydown(ev));
    }

    // Method to add a class to an element
    addClass(el, name) {
        el.classList.add(name);
    }

    // Method to remove a class from an element
    removeClass(el, name) {
        el.classList.remove(name);
    }

    // Method to select a random word from the words list
    randomWord() {
        const randomIndex = Math.floor(Math.random() * this.words.length);
        return this.words[randomIndex].toLowerCase();
    }

    // Method to format a word into HTML, wrapping each letter in its own span for key validation
    formatWord(word) {
        return `<div class="word"><span class="letter">${word.split('').join('</span><span class="letter">')}</span></div>`;
    }


    // Method to calculate WPM and accuracy
    getWPMandAccuracy() {
        const words = [...document.querySelectorAll(".word")];
        const lastTypedWord = document.querySelector(".word.current");
        const lastTypedWordIndex = words.indexOf(lastTypedWord);
        const typedWords = words.slice(0, lastTypedWordIndex);

        let totalCorrectLetters = 0;
        let totalTypedLetters = 0;
        let correctWords = 0;

        typedWords.forEach(word => {
            const letters = [...word.children];
            const correctLetters = letters.filter(letter => letter.classList.contains('correct'));
            const incorrectLetters = letters.filter(letter => letter.classList.contains('incorrect'));
            totalCorrectLetters += correctLetters.length;
            totalTypedLetters += letters.length;

            // A word is correct if all letters are correct
            if (incorrectLetters.length === 0 && correctLetters.length === letters.length) {
                correctWords++;
            }
        });

        // Calculate WPM
        const wpm = (correctWords / (this.gameTime / 1000)) * 60;

        // Calculate Accuracy
        const accuracy = totalTypedLetters > 0 ? (totalCorrectLetters / totalTypedLetters) * 100 : 0;

        // Returning accuracy as a percentage with two decimal places
        return { wpm, accuracy: accuracy.toFixed(1) };
    }


    // Method to generate and display words for the typing game
    generateWords() {
        let wordsHTML = '';
        for (let i = 0; i < 200; i++) {
            wordsHTML += this.formatWord(this.randomWord());
        }
        document.getElementById("words").innerHTML = wordsHTML;
    }

    // Method to start the cursor position update
    startCursorUpdate() {
        this.cursorUpdateInterval = setInterval(() => {
            this.updateCursor(); // Call the updateCursor function
        }, 100); // Update every 100 milliseconds
    }

    // Method to reset the UI and state for a new game
    resetGameUI() {
        
        // Once game ends we want to make sure that we restore any margins
        // we imposed due to scrolling through the words
        const wordsContainer = document.getElementById("words");
        wordsContainer.style.marginTop = "0px";

        document.getElementById("info").innerHTML = this.gameTime / 1000;
        this.removeClass(document.getElementById("game"), "over");
        this.generateWords();

        // Set the first word as the current word and the first letter as the current letter
        this.addClass(document.querySelector(".word"), "current");
        this.addClass(document.querySelector(".letter"), "current");

        // Reset the cursor position to the first word
        const firstLetter = document.querySelector(".letter.current");
        if (firstLetter) {
            this.cursor.style.top = `${firstLetter.getBoundingClientRect().top}px`;
            this.cursor.style.left = `${firstLetter.getBoundingClientRect().left}px`;
        }

        // Reset the timer
        this.timer = null;
        this.startCursorUpdate();
        document.getElementById("game").focus();
    }

    // Method to start a new game
    newGame() {
        this.resetGameUI();
    }

    // Method to start the game timer
    startTimer() {

        // Record start time
        this.gameStart = Date.now();

        this.timer = setInterval(() => {
            const elapsedTime = Date.now() - this.gameStart;
            const remainingTime = Math.max((this.gameTime - elapsedTime) / 1000, 0);
            document.getElementById("info").innerHTML = Math.ceil(remainingTime);

            // End the game when time runs out
            if (remainingTime <= 0) {
                this.gameOver();
                return;
            }
        }, 1000);
    }

    // Method to end the game and display game info
    gameOver() {
        clearInterval(this.timer);
        this.addClass(document.getElementById("game"), "over");
        const stats = this.getWPMandAccuracy();
        document.getElementById("info").innerHTML = `WPM: ${stats.wpm} &nbsp&nbsp&nbsp Accuracy: ${stats.accuracy}%`;
        this.removeClass(document.querySelector(".word"), "current");
        this.removeClass(document.querySelector(".letter"), "current");
        const cursor = document.getElementById("cursor");
        cursor.style.animation = "none";
    }

    // Method to handle user keyboard input
    handleKeydown(ev) {
        const key = ev.key;
        const currentLetter = document.querySelector(".letter.current");
        const currentWord = document.querySelector(".word.current");

        // If currentLetter does not exist that means we know we are on a space
        const expected = currentLetter?.innerHTML || " "; 

        // If the length of the key is 1 and the key is not a space then we know the user inputted a letter
        const isLetter = key.length === 1 && key !== " ";

        const isSpace = key === " ";
        const isBackSpace = key === "Backspace";
        const isFirstLetter = currentLetter === currentWord.firstChild;

        // Prevent typing if the game is over
        if (document.querySelector("#game.over")) {
            return;
        }

        // Start the timer if it hasn't started yet
        if (!this.timer && isLetter) {
            this.startTimer();
        }

        // Case where user input is a letter
        if (isLetter) {

            // If current letter exists then we know user is trying to match the expected letter
            if (currentLetter) {
                // If the user typed the correct letter then mark that letter as correct, otherwise mark it incorrect
                // Also Remove current class from the letter
                this.addClass(currentLetter, key === expected ? "correct" : "incorrect");
                this.removeClass(currentLetter, "current");

                // If the currentLetter is not the last one in a word then mark the next letter as the current letter
                if (currentLetter.nextSibling) {
                    this.addClass(currentLetter.nextSibling, "current");
                }

            // If we do not have a current letter, then we know that the user is typing extra letters beyond the word
            } else {

                // In this case we will tack those letters on to the end of the current word
                const incorrectLetter = document.createElement("span");
                incorrectLetter.innerHTML = key;
                incorrectLetter.className = "letter incorrect extra";
                currentWord.appendChild(incorrectLetter);
            }
        }

        // Case where user input is a space
        if (isSpace) {
            
            // Do not let user input a space if at the first letter
            if (isFirstLetter) {
                return;
            }

            // If the expected letter is not a space and the user enters a space then invalidate the entire word
            // and move the current word to the next word and the current letter to the beginning of the next word
            if (expected !== " ") {
                [...document.querySelectorAll(".word.current .letter:not(.correct)")].forEach(letter => {
                    this.addClass(letter, "incorrect");
                });
            }
            this.removeClass(currentWord, "current");
            this.addClass(currentWord.nextSibling, "current");
            if (currentLetter) {
                this.removeClass(currentLetter, "current");
            }
            this.addClass(currentWord.nextSibling.firstChild, "current");
        }

        // Case where user input is a backspace
        if (isBackSpace) {

            // Do not let user input a backspace if at the first letter
            if (isFirstLetter) {
                return;
            }
            
            // This is the common case
            // If we are not expecting a space and we are not the first letter
            // then we want to unmark the last letter as being incorrect and 
            // move the current letter to the previous letter
            else if (currentLetter && !isFirstLetter) {
                this.removeClass(currentLetter, "current");
                this.addClass(currentLetter.previousSibling, "current");
                this.removeClass(currentLetter.previousSibling, "incorrect");
                this.removeClass(currentLetter.previousSibling, "correct");
            } 
            
            // This is the case in which the user is trying to remove extra letters 
            // that they tacked on manually. In this case we want to remove these letters.
            else {
                this.addClass(currentWord.lastChild, "current");
                this.removeClass(currentWord.lastChild, "incorrect");
                this.removeClass(currentWord.lastChild, "correct");
                if (currentWord.lastChild.classList.contains("extra")) {
                    currentWord.lastChild.remove();
                }
            }
        }

        // Adjust words in view 
        if (currentWord.getBoundingClientRect().top > 250) {
            const words = document.getElementById("words");
            const margin = parseInt(words.style.marginTop || "0px");
            words.style.marginTop = (margin - 35) + "px";
        }

        // Update cursor to follow current letter
        this.updateCursor();
    }

    // Method to update the cursor position to follow current letter or word
    updateCursor() {
        const nextLetter = document.querySelector(".letter.current");
        const nextWord = document.querySelector(".word.current");
        this.cursor.style.top = `${(nextLetter || nextWord).getBoundingClientRect().top}px`;
        this.cursor.style.left = `${(nextLetter || nextWord).getBoundingClientRect()[nextLetter ? 'left' : 'right']}px`;
    }
}

// Instantiate the typing game class to start the game
function main() {
    const game = new TypingGame();
}
