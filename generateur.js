
const alphabet = ["A", "B","C","D","E","F","G","H","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

const frequencies = {
    'A': 808,
    'B': 167,
    'C': 318,
    'D': 399,
    'E': 1256,
    'F': 217,
    'G': 180,
    'H': 527,
    'I': 724,
    'J': 14,
    'K': 63,
    'L': 404,
    'M': 260,
    'N': 738,
    'O': 747,
    'P': 191,
    'Q': 9,
    'R': 642,
    'S': 659,
    'T': 915,
    'U': 279,
    'V': 100,
    'W': 189,
    'X': 21,
    'Y': 165,
    'Z': 7
};

const aleatoire = [];

const letters = [];
let mot = "";
let total = 0;

for (letter of alphabet){
    for(let i = 0; i < frequencies[letter]; i++){
        letters.push(letter);
    }
    console.log(letter + " : " + frequencies[letter]);
    total += frequencies[letter]
}
console.log("total : " + total);
console.log("longueur liste lettre : " + letters.length);

for (let index = 0; index <= 100; index++) {
    aleatoire.push(Math.floor(Math.random() * 9275));
    
}
for (place of aleatoire){
    mot += (letters[place]);
}
console.log(mot);
