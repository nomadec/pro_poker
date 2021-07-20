// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import "../css/app.scss";

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import deps with the dep name or local files with a relative path, for example:
//
//     import {Socket} from "phoenix"
//     import socket from "./socket"
//
import "phoenix_html";
import { Socket } from "phoenix";
import topbar from "topbar";
import { LiveSocket } from "phoenix_live_view";

let Hooks = {};
Hooks.Game = {
    mounted() {
        window.gameSocket = this;
        this.handleEvent("game_event", (eventMsg) => processEvent(eventMsg));
    },
};

let csrfToken = document
    .querySelector("meta[name='csrf-token']")
    .getAttribute("content");
let liveSocket = new LiveSocket("/live", Socket, {
    params: { _csrf_token: csrfToken },
    hooks: Hooks,
});

// Show progress bar on live navigation and form submits
topbar.config({ barColors: { 0: "#29d" }, shadowColor: "rgba(0, 0, 0, .3)" });
window.addEventListener("phx:page-loading-start", (info) => topbar.show());
window.addEventListener("phx:page-loading-stop", (info) => topbar.hide());

// connect if there are any LiveViews on the page
liveSocket.connect();

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket;

// liveSocket.on(event, msg => console.log("Got message", msg, event) )

// liveSocket.on("new_msg", msg => console.log("Got message", msg) )

// $input.onEnter( e => {
//   channel.push("new_msg", {body: e.target.val}, 10000)
//     .receive("ok", (msg) => console.log("created message", msg) )
//     .receive("error", (reasons) => console.log("create failed", reasons) )
//     .receive("timeout", () => console.log("Networking issue...") )
// })

window.pushEvent = function pushEvent(eventMsg) {
    const eventMsgRef = gameSocket.pushEvent(
        "new_event",
        eventMsg,
        (reply, ref) => console.log(reply)
    ); // ref is a counter of an event/message
    return eventMsgRef;
};
function processEvent({ event }) {
    if (event.command === "join") addUser(event.player);
    if (event.command === "start") startGame(event);
    if (
        event.command === "bet" ||
        event.command === "call" ||
        event.command === "raise"
    ) {
        shiftTurn(event);
    }
    if (event.command === "start_round") startRound(event);

    // if (msg.event.command === "bet") addUser(msg.event.player);
    // if (msg.event.command === "call") addUser(msg.event.player);
    // if (msg.event.command === "fold") addUser(msg.event.player);
    // if (msg.event.command === "raise") addUser(msg.event.player);
    console.log(event);
}

window.gameHelp = {
    commands: {
        create: "to create a game lobby",
        join: "to join game lobby",
        start: "to start a game",
        bet: "to place a bet",
        call: "to accept a bet",
        fold: "to quite round",
        raise: "to raise a bet",
        quit: "to quit game",
    },
};

const currentPlayer = {};

window.checkData = function checkData() {
    console.log(users);
    console.log(currentPlayer);
    console.log(currentBet);
    console.log(bank);
    console.log(gameCards);
    console.log(table);
};

window.createGame = function createGame() {
    const obj = {
        command: "create_game",
    };
    pushEvent(obj);
};

window.joinGame = function join(game_id, player) {
    const obj = {
        command: "join",
        player: player,
        game_id: game_id,
    };
    currentPlayer.name = player;
    console.log("This is You!", currentPlayer);
    pushEvent(obj);
};

window.startGame = function startGame() {
    const obj = {
        command: "start",
        cards: shuffle(),
    };
    pushEvent(obj);
};

window.endRound = function endRound() {
    const obj = {
        command: "start_round",
    };
    pushEvent(obj);
};

window.placeBet = function placeBet(val) {
    bet(val, currentPlayer.seat);
    const obj = {
        command: "bet",
        player: currentPlayer.name,
        seat: currentPlayer.seat,
        value: val.toString(),
    };
    pushEvent(obj);
};

window.callBet = function callBet() {
    bet(currentBet, currentPlayer.seat);
    const obj = {
        command: "call",
        player: currentPlayer.name,
        seat: currentPlayer.seat,
        value: currentBet.toString(),
    };
    pushEvent(obj);
};

window.raiseBet = function raiseBet(val) {
    bet(val, currentPlayer.seat);
    const obj = {
        command: "raise",
        player: currentPlayer.name,
        seat: currentPlayer.seat,
        value: val.toString(),
    };
    pushEvent(obj);
};

// window.foldBet = function foldBet() {
//     bet(val, currentPlayer.seat);
//     const obj = {
//         command: "raise",
//         player: currentPlayer.name,
//         seat: currentPlayer.seat,
//         value: val.toString(),
//     };
//     pushEvent(obj);
// };

const obj_Create = {
    command: "create_game",
};

const obj_Join = {
    command: "join",
    player: "Umid",
    game_id: "3045",
};

//////////////////////////

const users = [];
const gameCards = [];
const table = [];
let bank = 0;
let currentBet = 0;

function addUser(name) {
    let obj = {
        name: name,
        bet: 0,
        money: 100,
        points: 0,
        onHands: [],
    };
    users.push(obj);
    if (name === currentPlayer.name) {
        currentPlayer.seat = users.findIndex(
            (user) => user.name === currentPlayer.name
        );
    }
}

function startGame(event) {
    event.cards.forEach((card) => gameCards.push(card));
    // gameCards.push(event.cards);
    // gameCards.flat(Infinity);
    // console.log("startGame", gameCards.slice(0, 2));
    shiftTurn(0);
}

function startRound() {
    dealHands(2);
    dealTable(5);
    checkHandler();
    findWinner();
}

// Dealing hands
function dealHands(x) {
    for (let i in users) {
        const from = x * +i;
        const to = x * (+i + 1);
        const dealtCard = gameCards.slice(from, to);
        users[+i].onHands = users[+i].onHands.concat(dealtCard);
        // for (let i = 0; i < x; i++) {
        //     const dealtCard = gameCards.pop();
        //     y.onHands.push(dealtCard);
        // }
    }
}

// Giving cards for the table
function dealTable(x) {
    // const dealtCard = gameCards.slice(2 * users.length + 1, x * (i + 1));
    // table.onHands.push(dealtCard);
    for (let i = 0; i < x; i++) {
        table.push(gameCards[gameCards.length - 1]);
        gameCards.pop();
    }
}

function totalCards(user) {
    let totalArr = [];
    totalArr.push(user.onHands);
    totalArr.push(table);
    totalArr = totalArr.flat(Infinity);
    return totalArr;
}

function giveScores(combVal, cards) {
    let score = combVal;
    for (const card of cards) {
        score += card.score;
    }
    return score;
}

function findWinner() {
    const arr = [...users];
    arr.sort((a, b) => a.points - b.points);
    console.log(table[0], table[1], table[2], table[3], table[4]);
    console.log(`The winner is ${arr.pop().name}`);
}

// Check Handler for all Combinations
function checkHandler() {
    console.log("Evaluating your hand...");

    for (const user of users) {
        const onHands = user.onHands;
        const array = totalCards(user);
        const matchObjname = checkequals(array, "name");
        const matchObjsuite = checkequals(array, "suit");

        if (checkRoyalFlush(array)) {
            console.log(user.name, "Royal Flush");
            user.points = giveScores(1000, onHands);
        } else if (straight(array) && flush(matchObjsuite)) {
            console.log(user.name, "Straight Flush!");
            user.points = giveScores(900, onHands);
        } else if (nOfKind(matchObjname) >= 4) {
            console.log(user.name, "Four of kind!");
            user.points = giveScores(800, onHands);
        } else if (checkFullHouse(matchObjname)) {
            console.log(user.name, "Full House!");
            user.points = giveScores(700, onHands);
        } else if (flush(matchObjsuite)) {
            console.log(user.name, "Flush");
            user.points = giveScores(600, onHands);
        } else if (straight(array)) {
            console.log(user.name, "Straight!");
            user.points = giveScores(500, onHands);
        } else if (nOfKind(matchObjname) === 3) {
            console.log(user.name, "Three of a kind!");
            user.points = giveScores(400, onHands);
        } else if (checkPairs(matchObjname) === 2) {
            console.log(user.name, "Two pairs!");
            user.points = giveScores(300, onHands);
        } else if (checkPairs(matchObjname) === 1) {
            console.log(user.name, "One pair!");
            user.points = giveScores(200, onHands);
        } else if (highCard(array)) {
            console.log(user.name, "High card!");
            user.points = giveScores(100, onHands);
        }
        console.log(user.name, user.points, user.onHands[0], user.onHands[1]);
    }
}

// Check Royal Flush
function checkRoyalFlush(array) {
    const highArr = ["ten", "jack", "queen", "king", "ace"];
    const tempArr = [];

    for (const i of array) {
        if (highArr.includes(i.name)) {
            tempArr.push(i);
        }
    }

    const matchObjsuite = checkequals(tempArr, "suit");

    if (flush(matchObjsuite) && straight(tempArr)) {
        return true;
    } else return false;
}

// Check FullHouse
function checkFullHouse(array) {
    const fullHousePattern = {};
    array.forEach((item) => {
        if (item.count >= 2) {
            fullHousePattern[item.count] = item.name;
        }
    });
    if (2 in fullHousePattern && 3 in fullHousePattern) {
        return true;
    } else return false;
}

// Check Flush
function flush(array) {
    let result = false;
    for (const item of array) {
        if (item.count >= 5) {
            result = true;
        }
    }
    return result;
}

// Check Straight
function straight(arr) {
    let sch = 0;
    const arraySorted = arr.sort((a, b) => a.score - b.score);
    const setArray = new Set(arraySorted.map((item) => item.score));
    const array = Array.from(setArray);
    for (let i = 0; i < array.length - 1; i++) {
        if (array[i + 1] - array[i] === 1) {
            sch += 1;
            if (sch >= 4) {
                return true;
            }
        } else {
            sch = 0;
        }
    }
    return false;
}

// Check One or More Pairs
function checkPairs(array) {
    let pairs = 0;
    array.forEach((item) => {
        if (item.count >= 2) {
            pairs += Math.floor(item.count / 2);
        }
    });
    return pairs;
}

// Check N - of Kind
function nOfKind(array) {
    let repeats = 0;
    array.forEach((item) => {
        if (item.count >= 2 && item.count > repeats) {
            repeats = item.count;
        }
    });
    return repeats;
}

// Check High Card
function highCard(array) {
    const highArr = ["jack", "queen", "king", "ace"];
    for (const i of array) {
        if (highArr.includes(i.name)) {
            return true;
        }
    }
}

// Check Equals Function
function checkequals(array, key) {
    const newObj = {};
    array.forEach((item) => {
        if (item[key] in newObj) {
            newObj[item[key]] += 1;
        } else {
            newObj[item[key]] = 1;
        }
    });
    const result = [];
    for (const objKey in newObj) {
        if (newObj[objKey] > 1) {
            result.push({
                name: objKey,
                count: newObj[objKey],
            });
        }
    }
    return result;
}

function shiftTurn(event) {
    // console.log("game started. Blind Round!");

    if (event === 0) {
        for (let i in users) {
            if (i == 0 && users[i].name === currentPlayer.name) {
                console.log(
                    `Your turn to BET or CHECK!, ${currentPlayer.name}!`
                );
            }
        }
    }

    // if (prevAction === "bet" || prevAction === "call" || prevAction === "raise") {
    else {
        let seat = event.seat + 1;
        if (seat > users.length - 1) {
            for (const user of users) {
                if (user.bet < currentBet) {
                    seat = 0;
                }
            }
        }
        currentBet = +event.value;
        for (let i in users) {
            if (users[i].name === event.player) users[i].bet = +event.value;
            if (
                i == seat &&
                users[i].name === currentPlayer.name &&
                users[i].bet < currentBet
            ) {
                const alertMsg = `Your turn to CALL or RAISE or FOLD!, ${currentPlayer.name}!`;
                alert(alertMsg);
                console.log(alertMsg);
            }
        }
    }
}

function collectBetsToBank() {
    bank = 0;
    for (let i of users) {
        bank += i.bet;
    }
}
function bet(bet, index) {
    let player = users[index];
    if (player.money - bet < 0) {
        console.log(`${player.name} has not enough money`);
        return false;
    }
    player.money -= bet;
    player.bet = bet;
    currentBet = bet;
    collectBetsToBank();
    return true;
}

const cards = [
    { score: 2, name: "two", suit: "diamonds" },
    { score: 2, name: "two", suit: "hearts" },
    { score: 2, name: "two", suit: "clubs" },
    { score: 2, name: "two", suit: "spades" },
    { score: 3, name: "three", suit: "diamonds" },
    { score: 3, name: "three", suit: "hearts" },
    { score: 3, name: "three", suit: "clubs" },
    { score: 3, name: "three", suit: "spades" },
    { score: 4, name: "four", suit: "diamonds" },
    { score: 4, name: "four", suit: "hearts" },
    { score: 4, name: "four", suit: "clubs" },
    { score: 4, name: "four", suit: "spades" },
    { score: 5, name: "five", suit: "diamonds" },
    { score: 5, name: "five", suit: "hearts" },
    { score: 5, name: "five", suit: "clubs" },
    { score: 5, name: "five", suit: "spades" },
    { score: 6, name: "six", suit: "diamonds" },
    { score: 6, name: "six", suit: "hearts" },
    { score: 6, name: "six", suit: "clubs" },
    { score: 6, name: "six", suit: "spades" },
    { score: 7, name: "seven", suit: "diamonds" },
    { score: 7, name: "seven", suit: "hearts" },
    { score: 7, name: "seven", suit: "clubs" },
    { score: 7, name: "seven", suit: "spades" },
    { score: 8, name: "eight", suit: "diamonds" },
    { score: 8, name: "eight", suit: "hearts" },
    { score: 8, name: "eight", suit: "clubs" },
    { score: 8, name: "eight", suit: "spades" },
    { score: 9, name: "nine", suit: "diamonds" },
    { score: 9, name: "nine", suit: "hearts" },
    { score: 9, name: "nine", suit: "clubs" },
    { score: 9, name: "nine", suit: "spades" },
    { score: 10, name: "ten", suit: "diamonds" },
    { score: 10, name: "ten", suit: "hearts" },
    { score: 10, name: "ten", suit: "clubs" },
    { score: 10, name: "ten", suit: "spades" },
    { score: 11, name: "jack", suit: "diamonds" },
    { score: 11, name: "jack", suit: "hearts" },
    { score: 11, name: "jack", suit: "clubs" },
    { score: 11, name: "jack", suit: "spades" },
    { score: 12, name: "queen", suit: "diamonds" },
    { score: 12, name: "queen", suit: "hearts" },
    { score: 12, name: "queen", suit: "clubs" },
    { score: 12, name: "queen", suit: "spades" },
    { score: 13, name: "king", suit: "diamonds" },
    { score: 13, name: "king", suit: "hearts" },
    { score: 13, name: "king", suit: "clubs" },
    { score: 13, name: "king", suit: "spades" },
    { score: -14, name: "ace", suit: "diamonds" },
    { score: -14, name: "ace", suit: "hearts" },
    { score: -14, name: "ace", suit: "clubs" },
    { score: -14, name: "ace", suit: "spades" },
];

function shuffle() {
    const array = [...cards];
    array.sort(() => Math.random() - 0.5);
    return array;
}
