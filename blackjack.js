const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const dealerCardsEl = document.getElementById("dealer-cards");
const dealerScoreEl = document.getElementById("dealer-score");
const playerCards1El = document.getElementById("player-cards-1");
const playerScore1El = document.getElementById("player-score-1");
const playerCards2El = document.getElementById("player-cards-2");
const playerScore2El = document.getElementById("player-score-2");
const playerHand1Card = document.getElementById("player-hand-1-card");
const playerHand2Card = document.getElementById("player-hand-2-card");
const statusEl = document.getElementById("status");
const chipsEl = document.getElementById("chips");
const betEl = document.getElementById("bet");
const gameSwitcher = document.getElementById("game-switcher");

const newRoundBtn = document.getElementById("new-round");
const hitBtn = document.getElementById("hit");
const standBtn = document.getElementById("stand");
const splitBtn = document.getElementById("split");
const doubleBtn = document.getElementById("double");
const allInBtn = document.getElementById("all-in");
const clearBetBtn = document.getElementById("clear-bet");
const rechargeBtn = document.getElementById("recharge");
const chipButtons = document.querySelectorAll(".chip-btn");

let deck = [];
let dealerHand = [];
let playerHands = [];
let activeHandIndex = 0;
let gameOver = true;

let chips = 1000;
let currentBet = 0;

function createDeck() {
  const cards = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      cards.push({ suit, rank });
    }
  }
  return shuffle(cards);
}

function shuffle(cards) {
  const copy = [...cards];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function dealCard(hand) {
  if (deck.length === 0) {
    deck = createDeck();
  }
  hand.push(deck.pop());
}

function cardValue(rank) {
  if (rank === "A") return 11;
  if (["K", "Q", "J"].includes(rank)) return 10;
  return Number(rank);
}

function handValue(hand) {
  let total = hand.reduce((sum, card) => sum + cardValue(card.rank), 0);
  let aces = hand.filter((card) => card.rank === "A").length;

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
}

function formatHand(hand, hideFirst = false) {
  if (hand.length === 0) {
    return "-";
  }

  return hand
    .map((card, index) => (hideFirst && index === 0 ? "🂠" : `${card.rank}${card.suit}`))
    .join("  ");
}

function canSplitActiveHand() {
  if (gameOver || playerHands.length !== 1) {
    return false;
  }

  const hand = playerHands[activeHandIndex];
  if (!hand || hand.cards.length !== 2) {
    return false;
  }

  return hand.cards[0].rank === hand.cards[1].rank && chips >= hand.bet;
}

function canDoubleActiveHand() {
  if (gameOver) {
    return false;
  }

  const hand = playerHands[activeHandIndex];
  if (!hand || hand.done || hand.cards.length !== 2 || hand.doubled) {
    return false;
  }

  return chips >= hand.bet;
}

function canAllInActiveHand() {
  if (gameOver) {
    return false;
  }

  const hand = playerHands[activeHandIndex];
  if (!hand || hand.done) {
    return false;
  }

  return chips > 0;
}

function render(showDealerFull = false) {
  dealerCardsEl.textContent = formatHand(dealerHand, !showDealerFull && !gameOver);

  if (dealerHand.length < 2) {
    dealerScoreEl.textContent = "Score: ?";
  } else {
    const dealerVisibleValue = showDealerFull || gameOver
      ? handValue(dealerHand)
      : cardValue(dealerHand[1].rank);

    dealerScoreEl.textContent = showDealerFull || gameOver
      ? `Score: ${dealerVisibleValue}`
      : `Score: ${dealerVisibleValue} + ?`;
  }

  const hand1 = playerHands[0];
  const hand2 = playerHands[1];

  playerCards1El.textContent = formatHand(hand1?.cards ?? []);
  playerScore1El.textContent = `Score: ${hand1 ? handValue(hand1.cards) : 0} | Bet: ${hand1 ? hand1.bet : 0}`;

  playerCards2El.textContent = formatHand(hand2?.cards ?? []);
  playerScore2El.textContent = `Score: ${hand2 ? handValue(hand2.cards) : 0} | Bet: ${hand2 ? hand2.bet : 0}`;

  playerHand2Card.classList.toggle("hidden", !hand2);
  playerHand1Card.classList.toggle("active-hand", !gameOver && activeHandIndex === 0);
  playerHand2Card.classList.toggle("active-hand", !gameOver && activeHandIndex === 1);

  chipsEl.textContent = `Chips: ${chips}`;
  betEl.textContent = `Current Bet: ${currentBet}`;
}

function setControls(isPlaying) {
  hitBtn.disabled = !isPlaying;
  standBtn.disabled = !isPlaying;
  splitBtn.disabled = !isPlaying || !canSplitActiveHand();
  doubleBtn.disabled = !isPlaying || !canDoubleActiveHand();
  allInBtn.disabled = !isPlaying || !canAllInActiveHand();
  newRoundBtn.disabled = isPlaying;

  chipButtons.forEach((button) => {
    button.disabled = isPlaying;
  });

  clearBetBtn.disabled = isPlaying;
  rechargeBtn.disabled = !(gameOver && chips === 0);
}

function placeBet(amount) {
  if (!gameOver) {
    return;
  }

  if (currentBet + amount > chips) {
    statusEl.textContent = "You do not have enough chips for that bet.";
    return;
  }

  currentBet += amount;
  statusEl.textContent = `Bet set to ${currentBet}. Press “Deal” when ready.`;
  render(true);
  setControls(false);
}

function clearBet() {
  if (!gameOver) {
    return;
  }

  currentBet = 0;
  statusEl.textContent = "Bet cleared. Place a new bet to play.";
  render(true);
  setControls(false);
}

function rechargeChips() {
  if (!gameOver || chips > 0) {
    return;
  }

  chips = 1000;
  currentBet = 0;
  statusEl.textContent = "Recharged! You are back to 1000 chips.";
  render(true);
  setControls(false);
}

function startRound() {
  if (currentBet <= 0) {
    statusEl.textContent = "Place a bet first (10, 50, 100, or 200).";
    return;
  }

  if (currentBet > chips) {
    statusEl.textContent = "Current bet is higher than available chips.";
    return;
  }

  chips -= currentBet;

  deck = createDeck();
  dealerHand = [];
  playerHands = [{ cards: [], bet: currentBet, done: false, doubled: false }];
  activeHandIndex = 0;
  gameOver = false;

  dealCard(playerHands[0].cards);
  dealCard(dealerHand);
  dealCard(playerHands[0].cards);
  dealCard(dealerHand);

  statusEl.textContent = "Your move: Hit, Stand, Split, Double Down, or All In.";
  render(false);
  setControls(true);

  if (handValue(playerHands[0].cards) === 21) {
    stand();
  }
}

function nextHandOrDealer() {
  const nextIndex = playerHands.findIndex((hand, index) => index > activeHandIndex && !hand.done);

  if (nextIndex !== -1) {
    activeHandIndex = nextIndex;
    statusEl.textContent = `Now playing Hand ${activeHandIndex + 1}.`;
    render(false);
    setControls(true);
    return;
  }

  finishDealerAndSettle();
}

function finishDealerAndSettle() {
  while (handValue(dealerHand) < 17) {
    dealCard(dealerHand);
  }

  const dealerTotal = handValue(dealerHand);
  let wins = 0;
  let pushes = 0;
  let losses = 0;

  playerHands.forEach((hand) => {
    const total = handValue(hand.cards);

    if (total > 21) {
      losses += 1;
      return;
    }

    if (dealerTotal > 21 || total > dealerTotal) {
      chips += hand.bet * 2;
      wins += 1;
    } else if (total === dealerTotal) {
      chips += hand.bet;
      pushes += 1;
    } else {
      losses += 1;
    }
  });

  const message = `Round over — Wins: ${wins}, Pushes: ${pushes}, Losses: ${losses}.`;
  endRound(message);
}

function endRound(message) {
  gameOver = true;
  currentBet = 0;

  if (chips === 0) {
    statusEl.textContent = `${message} You are out of chips. Press Recharge.`;
  } else {
    statusEl.textContent = `${message} Place your next bet.`;
  }

  render(true);
  setControls(false);
}

function hit() {
  if (gameOver) return;

  const hand = playerHands[activeHandIndex];
  if (!hand || hand.done) return;

  dealCard(hand.cards);

  if (handValue(hand.cards) > 21) {
    hand.done = true;
    statusEl.textContent = `Hand ${activeHandIndex + 1} busts.`;
    render(false);
    setControls(true);
    nextHandOrDealer();
    return;
  }

  render(false);
  setControls(true);
}

function stand() {
  if (gameOver) return;

  const hand = playerHands[activeHandIndex];
  if (!hand || hand.done) return;

  hand.done = true;
  nextHandOrDealer();
}

function split() {
  if (!canSplitActiveHand()) {
    return;
  }

  const original = playerHands[activeHandIndex];
  chips -= original.bet;

  const movedCard = original.cards.pop();
  const splitHand = {
    cards: [movedCard],
    bet: original.bet,
    done: false,
    doubled: false,
  };

  original.done = false;
  original.doubled = false;

  dealCard(original.cards);
  dealCard(splitHand.cards);

  playerHands.push(splitHand);
  statusEl.textContent = "Split successful. Play Hand 1 first.";
  render(false);
  setControls(true);
}

function doubleDown() {
  if (!canDoubleActiveHand()) {
    return;
  }

  const hand = playerHands[activeHandIndex];
  chips -= hand.bet;
  hand.bet *= 2;
  hand.doubled = true;

  dealCard(hand.cards);
  hand.done = true;

  if (handValue(hand.cards) > 21) {
    statusEl.textContent = `Hand ${activeHandIndex + 1} busts after double down.`;
  } else {
    statusEl.textContent = `Hand ${activeHandIndex + 1} stands after double down.`;
  }

  render(false);
  setControls(true);
  nextHandOrDealer();
}

function allIn() {
  if (!canAllInActiveHand()) {
    return;
  }

  const hand = playerHands[activeHandIndex];
  const allInAmount = chips;
  chips = 0;
  hand.bet += allInAmount;

  statusEl.textContent = `Hand ${activeHandIndex + 1} is all in (+${allInAmount}).`;
  render(false);
  setControls(true);
}

chipButtons.forEach((button) => {
  button.addEventListener("click", () => {
    placeBet(Number(button.dataset.bet));
  });
});

clearBetBtn.addEventListener("click", clearBet);
rechargeBtn.addEventListener("click", rechargeChips);
newRoundBtn.addEventListener("click", startRound);
hitBtn.addEventListener("click", hit);
standBtn.addEventListener("click", stand);
splitBtn.addEventListener("click", split);
doubleBtn.addEventListener("click", doubleDown);
allInBtn.addEventListener("click", allIn);

playerHand2Card.classList.add("hidden");
render(true);
setControls(false);

gameSwitcher.value = "blackjack";
gameSwitcher.addEventListener("change", () => {
  if (gameSwitcher.value === "blackjack") {
    return;
  }

  if (gameSwitcher.value === "roulette") {
    window.location.href = "roulette.html";
  }
});
