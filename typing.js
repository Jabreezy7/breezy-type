const words = [
    "Apple", "Banana", "Cat", "Dog", "Elephant", "Flower", "Garden", "House", "Ice", "Jump",
    "Kite", "Lemon", "Monkey", "Night", "Ocean", "Pizza", "Queen", "River", "Sun", "Tree",
    "Umbrella", "Violet", "Water", "Xylophone", "Yellow", "Zebra", "Ball", "Cloud", "Desk",
    "Egg", "Fish", "Grass", "Hat", "Island", "Jacket", "King", "Light", "Mountain", "Nest",
    "Orange", "Pencil", "Quilt", "Rain", "Snow", "Train", "Unicorn", "Volcano", "Window",
    "Yacht", "Zipper"
  ];

function randomWord(){
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex].toLowerCase();
}

function formatWord(word){
    return `<div class = "word">${word}</div>`;
}

  
function newGame(){
    document.getElementById("words").innerHTML = "";
    for (let i = 0; i < 200; i++){
        document.getElementById("words").innerHTML += formatWord(randomWord());
    }
}


newGame();
