const cards = [ 
    { score: 2, name: 'two', suit: 'diamonds' }, 
    { score: 2, name: 'two', suit: 'hearts' }, 
    { score: 2, name: 'two', suit: 'clubs' }, 
    { score: 2, name: 'two', suit: 'spades' }, 
    { score: 3, name: 'three', suit: 'diamonds' }, 
    { score: 3, name: 'three', suit: 'hearts' }, 
    { score: 3, name: 'three', suit: 'clubs' }, 
    { score: 3, name: 'three', suit: 'spades' }, 
    { score: 4, name: 'four', suit: 'diamonds' }, 
    { score: 4, name: 'four', suit: 'hearts' }, 
    { score: 4, name: 'four', suit: 'clubs' }, 
    { score: 4, name: 'four', suit: 'spades' }, 
    { score: 5, name: 'five', suit: 'diamonds' }, 
    { score: 5, name: 'five', suit: 'hearts' }, 
    { score: 5, name: 'five', suit: 'clubs' }, 
    { score: 5, name: 'five', suit: 'spades' }, 
    { score: 6, name: 'six', suit: 'diamonds' }, 
    { score: 6, name: 'six', suit: 'hearts' }, 
    { score: 6, name: 'six', suit: 'clubs' }, 
    { score: 6, name: 'six', suit: 'spades' }, 
    { score: 7, name: 'seven', suit: 'diamonds' }, 
    { score: 7, name: 'seven', suit: 'hearts' }, 
    { score: 7, name: 'seven', suit: 'clubs' }, 
    { score: 7, name: 'seven', suit: 'spades' }, 
    { score: 8, name: 'eight', suit: 'diamonds' }, 
    { score: 8, name: 'eight', suit: 'hearts' }, 
    { score: 8, name: 'eight', suit: 'clubs' }, 
    { score: 8, name: 'eight', suit: 'spades' }, 
    { score: 9, name: 'nine', suit: 'diamonds' }, 
    { score: 9, name: 'nine', suit: 'hearts' }, 
    { score: 9, name: 'nine', suit: 'clubs' }, 
    { score: 9, name: 'nine', suit: 'spades' }, 
    { score: 10, name: 'ten', suit: 'diamonds' }, 
    { score: 10, name: 'ten', suit: 'hearts' }, 
    { score: 10, name: 'ten', suit: 'clubs' }, 
    { score: 10, name: 'ten', suit: 'spades' }, 
    { score: 11, name: 'jack', suit: 'diamonds' }, 
    { score: 11, name: 'jack', suit: 'hearts' }, 
    { score: 11, name: 'jack', suit: 'clubs' }, 
    { score: 11, name: 'jack', suit: 'spades' }, 
    { score: 12, name: 'queen', suit: 'diamonds' }, 
    { score: 12, name: 'queen', suit: 'hearts' }, 
    { score: 12, name: 'queen', suit: 'clubs' }, 
    { score: 12, name: 'queen', suit: 'spades' }, 
    { score: 13, name: 'king', suit: 'diamonds' }, 
    { score: 13, name: 'king', suit: 'hearts' }, 
    { score: 13, name: 'king', suit: 'clubs' }, 
    { score: 13, name: 'king', suit: 'spades' }, 
    { score: 14, name: 'ace', suit: 'diamonds' }, 
    { score: 14, name: 'ace', suit: 'hearts' }, 
    { score: 14, name: 'ace', suit: 'clubs' }, 
    { score: 14, name: 'ace', suit: 'spades' } 
] 
const gameCards = [...cards] 
function shuffle(array) { 
    array.sort(() => Math.random() - 0.5); 
} 
shuffle(gameCards) 
 
 
 
 
 
 
// const board = [] 
 
 
 
// function dealHands(x, y) { 
//     for (let i = 0; i < x; i++) { 
//         users[y].onHands.push(gameCards[gameCards.length - 1]) 
//         gameCards.pop() 
//     } 
// } 
// dealHands(2, 0) 
 
 
 
// function bet(x, y) { 
//     users[y].bet = x; 
// } 
// bet(5, 0) 
 
 
 
// function dealBoard(x) { 
//     for (let i = 0; i < x; i++) { 
//         board.push(gameCards[gameCards.length - 1]) 
//         gameCards.pop() 
//     } 
// } 
// dealboard(3) 
 
 
 
 
// console.log(board); 
// console.log(users); 
// console.log(gameCards); 
const users = [ 
    { 
        name: 'Atai', bet: 0, points: 0, onHands: [ 
            { score: 12, name: 'queen', suit: 'diamonds' }, 
            { score: 13, name: 'queen', suit: 'diamonds' }, 
            { score: 14, name: 'queen', suit: 'diamonds' }, 
            { score: 15, name: 'queen', suit: 'diamonds' }, 
            { score: 16, name: 'queen', suit: 'diamonds' }, 
        ] 
    }, 
    { name: 'Amantai', bet: 0, points: 0, onHands: [] }, 
    { name: 'Umid', bet: 0, points: 0, onHands: [] }, 
    { name: 'Mike', bet: 0, points: 0, onHands: [] } 
] 
 
function checkHand(array) {

if (flash(array)) { 
        console.log('flash'); 
    } 
} 
// checkHand(users[0].onHands) 
function flash(array) { 
    return array.every(i => i.suit === array[0].suit) 
} 
let sch = 0 
function straight(array) { 
    for (let i = 0; i < array.length; i++) { 
        if (array[i + 1].score - array[i].score == 1) { 
            sch++ 
            if (sch >= 4) { 
                return true 
            } 
        } 
    } 
} 
function straightFlash(array) { 
    if (straight(array) && flash(array)) { 
        // console.log('Straight Flash'); 
    } 
} 
 
function pair(array) { 
    const arraySorted = array.sort((a, b) => a.score - b.score); 
    for (let i = 1; i < arraySorted.length; i++) { 
        if ((arraySorted[i - 1].score) == arraySorted[i].score) { 
            return true 
        } 
    } 
}
// straight(users[0].onHands); 
// straightFlash(users[0].onHands) 
// pair(users[0].onHands);




