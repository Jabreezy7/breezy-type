const words = [
    "Apple", "Banana", "Cat", "Dog", "Elephant", "Flower", "Garden", "House", "Ice", "Jump",
    "Kite", "Lemon", "Monkey", "Night", "Ocean", "Pizza", "Queen", "River", "Sun", "Tree",
    "Umbrella", "Violet", "Water", "Xylophone", "Yellow", "Zebra", "Ball", "Cloud", "Desk",
    "Egg", "Fish", "Grass", "Hat", "Island", "Jacket", "King", "Light", "Mountain", "Nest",
    "Orange", "Pencil", "Quilt", "Rain", "Snow", "Train", "Unicorn", "Volcano", "Window",
    "Yacht", "Zipper"
];

// 30 Seconds
const gameTime = 30;
window.timer = null;
window.gameStart = null;


function addClass(el, name) {
    el.className += ' ' + name;
}

function removeClass(el, name) {
    el.className = el.className.replace(name, "");
}

function randomWord() {
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex].toLowerCase();
}

function formatWord(word) {
    return `<div class = "word"><span class="letter">${word.split('').join('</span><span class="letter">')}</span></div>`;
}


function newGame() {
    document.getElementById("words").innerHTML = "";
    for (let i = 0; i < 200; i++) {
        document.getElementById("words").innerHTML += formatWord(randomWord());
    }
    addClass(document.querySelector(".word"), "current");
    addClass(document.querySelector(".letter"), "current");
    window.timer = null;
}

function gameOver(){
    clearInterval(window.timer);
}


document.getElementById("game").addEventListener("keydown", ev => {
    const key = ev.key;
    const currentLetter = document.querySelector(".letter.current");
    const currentWord = document.querySelector(".word.current");
    // If there is no current letter then we know that we are on a space
    const expected = currentLetter?.innerHTML || " ";

    // Checking if key is a letter and not backspace or space key
    const isLetter = key.length === 1 && key !== " ";

    const isSpace = key === " ";
    const isBackSpace = key === "Backspace";
    const isFirstLetter = currentLetter === currentWord.firstChild;

    console.log({key, expected});

    if(!window.timer && isLetter){
        window.timer = setInterval( ()=> {
            if(!window.gameStart){
                window.gameStart = (new Date()).getTime();
            }
            const currentTime = (new Date()).getTime();
            const secPassed = Math.round((currentTime - window.gameStart)/1000);
            const secLeft = gameTime - secPassed;
            if(secLeft <= 0){
                gameOver();
            }

            document.getElementById("info").innerHTML = secLeft;
            
        }, 1000);
        
    }

    
    if(isLetter){
        if(currentLetter){
            addClass(currentLetter, key === expected ? "correct": "incorrect");
            removeClass(currentLetter, "current");

            // Move current letter if we are not at the end of the word and not at a space
            if(currentLetter.nextSibling){
                addClass(currentLetter.nextSibling, "current");
            }
        }

        else{
            const incorrectLetter = document.createElement("span");
            incorrectLetter.innerHTML = key;
            incorrectLetter.className = "letter incorrect extra";
            currentWord.appendChild(incorrectLetter);
        }
    }

    if(isSpace){
        if(expected !== " "){
            const lettersToInvalidate = [...document.querySelectorAll(".word.current .letter:not(.correct)")];
            lettersToInvalidate.forEach(letter =>{
                addClass(letter, "incorrect");
            });
        }
        removeClass(currentWord, "current");
        addClass(currentWord.nextSibling, "current");
        if(currentLetter){
            removeClass(currentLetter, "current");
        }

        addClass(currentWord.nextSibling.firstChild, "current");
    }

    if(isBackSpace){
        if(currentLetter && isFirstLetter){
            // Make prev word current, last letter current
            removeClass(currentWord, "current");
            addClass(currentWord.previousSibling, "current");
            removeClass(currentLetter, "current");
            addClass(currentWord.previousSibling.lastChild, "current");
            removeClass(currentWord.previousSibling.lastChild, "incorrect");
            removeClass(currentWord.previousSibling.lastChild, "correct");
        }

        if(currentLetter && !isFirstLetter){
            removeClass(currentLetter, "current");
            addClass(currentLetter.previousSibling, "current");
            removeClass(currentLetter.previousSibling, "incorrect");
            removeClass(currentLetter.previousSibling, "correct");
        }

        if(!currentLetter){
            addClass(currentWord.lastChild, "current");
            removeClass(currentWord.lastChild, "incorrect");
            removeClass(currentWord.lastChild, "correct");
        }
    }

    // Move Lines and Words
    if(currentWord.getBoundingClientRect().top > 250){
        const words = document.getElementById("words");
        const margin = parseInt(words.style.marginTop || "0px");
        words.style.marginTop = (margin - 35) + "px";
    }

    // Move Cursor
    const nextLetter = document.querySelector(".letter.current");
    const nextWord = document.querySelector(".word.current");
    const cursor = document.getElementById("cursor");
    cursor.style.top = (nextLetter || nextWord).getBoundingClientRect().top + 'px';
    cursor.style.left = (nextLetter || nextWord).getBoundingClientRect()[nextLetter ? 'left': 'right'] + 'px';

})

newGame();
