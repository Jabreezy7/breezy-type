window.addEventListener("load", function() {
    main();
});

class TypingGame {
    constructor() {
        this.words = [];
        this.gameTime = 30 * 1000;
        this.timer = null;
        this.cursor = document.getElementById("cursor");
        this.setupListeners();
        this.loadWords();
        //this.newGame();
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

    // Method to calculate WPM
    getWPM() {
        const words = [...document.querySelectorAll(".word")];
        const lastTypedWord = document.querySelector(".word.current");
        const lastTypedWordIndex = words.indexOf(lastTypedWord);
        const typedWords = words.slice(0, lastTypedWordIndex);
        const correctWords = typedWords.filter(word => {
            const letters = [...word.children];
            const incorrectLetters = letters.filter(letter => letter.classList.contains('incorrect'));
            const correctLetters = letters.filter(letter => letter.classList.contains('correct'));
            return incorrectLetters.length === 0 && correctLetters.length === letters.length;
        });
        return (correctWords.length / (this.gameTime / 1000)) * 60;
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

    // Method to end the game and display WPM
    gameOver() {
        clearInterval(this.timer);
        this.addClass(document.getElementById("game"), "over");
        document.getElementById("info").innerHTML = `WPM: ${this.getWPM()}`;
        this.removeClass(document.querySelector(".word"), "current");
        this.removeClass(document.querySelector(".letter"), "current");
        const cursor = document.getElementById("cursor");
        cursor.style.animation = "none";
    }

    // Method to handle user typing input
    handleKeydown(ev) {
        const key = ev.key;
        const currentLetter = document.querySelector(".letter.current");
        const currentWord = document.querySelector(".word.current");
        const expected = currentLetter?.innerHTML || " ";
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

        if (isLetter) {
            if (currentLetter) {
                this.addClass(currentLetter, key === expected ? "correct" : "incorrect");
                this.removeClass(currentLetter, "current");
                if (currentLetter.nextSibling) {
                    this.addClass(currentLetter.nextSibling, "current");
                }
            } else {
                const incorrectLetter = document.createElement("span");
                incorrectLetter.innerHTML = key;
                incorrectLetter.className = "letter incorrect extra";
                currentWord.appendChild(incorrectLetter);
            }
        }

        if (isSpace) {
            if(isFirstLetter)
                {
                    return;
                }
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

        if (isBackSpace) {
            if(isFirstLetter){
                return;
            }
            else if (currentLetter && isFirstLetter) {
                this.removeClass(currentWord, "current");
                this.addClass(currentWord.previousSibling, "current");
                this.removeClass(currentLetter, "current");
                this.addClass(currentWord.previousSibling.lastChild, "current");
                this.removeClass(currentWord.previousSibling.lastChild, "incorrect");
                this.removeClass(currentWord.previousSibling.lastChild, "correct");
            } else if (currentLetter && !isFirstLetter) {
                this.removeClass(currentLetter, "current");
                this.addClass(currentLetter.previousSibling, "current");
                this.removeClass(currentLetter.previousSibling, "incorrect");
                this.removeClass(currentLetter.previousSibling, "correct");
            }else {
                this.addClass(currentWord.lastChild, "current");
                this.removeClass(currentWord.lastChild, "incorrect");
                this.removeClass(currentWord.lastChild, "correct");
                if(currentWord.lastChild.classList.contains("extra"))
                    {
                        currentWord.lastChild.remove();
                    }
            }
        }

        if (currentWord.getBoundingClientRect().top > 250) {
            const words = document.getElementById("words");
            const margin = parseInt(words.style.marginTop || "0px");
            words.style.marginTop = (margin - 35) + "px";
        }

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
function main(){
    const game = new TypingGame();
}
