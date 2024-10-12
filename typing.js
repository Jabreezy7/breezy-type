const words = [
    "Apple", "Banana", "Cat", "Dog", "Elephant", "Flower", "Garden", "House", "Ice", "Jump",
    "Kite", "Lemon", "Monkey", "Night", "Ocean", "Pizza", "Queen", "River", "Sun", "Tree",
    "Umbrella", "Violet", "Water", "Xylophone", "Yellow", "Zebra", "Ball", "Cloud", "Desk",
    "Egg", "Fish", "Grass", "Hat", "Island", "Jacket", "King", "Light", "Mountain", "Nest",
    "Orange", "Pencil", "Quilt", "Rain", "Snow", "Train", "Unicorn", "Volcano", "Window",
    "Yacht", "Zipper"
];

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

    console.log({key, expected});

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

    //Move cursor
    const nextLetter = document.querySelector(".letter.current");
    const nextWord = document.querySelector(".word.current");
    const cursor = document.getElementById("cursor");
    cursor.style.top = (nextLetter || nextWord).getBoundingClientRect().top + 'px';
    cursor.style.left = (nextLetter || nextWord).getBoundingClientRect()[nextLetter ? 'left': 'right'] + 'px';

})

newGame();
