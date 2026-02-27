const wheelPockets = [
  "0",
  "00",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
];

const redNumbers = new Set([
  "1", "3", "5", "7", "9", "12", "14", "16", "18", "19", "21", "23", "25", "27", "30", "32", "34", "36",
]);

const chipsEl = document.getElementById("chips");
const currentBetEl = document.getElementById("current-bet");
const selectedPocketEl = document.getElementById("selected-pocket");
const statusEl = document.getElementById("status");
const pocketsEl = document.getElementById("pockets");
const gameSwitcher = document.getElementById("game-switcher");
const betRedBtn = document.getElementById("bet-red");
const betBlackBtn = document.getElementById("bet-black");

const placeBetBtn = document.getElementById("place-bet");
const spinBtn = document.getElementById("spin");
const clearBetBtn = document.getElementById("clear-bet");
const rechargeBtn = document.getElementById("recharge");
const chipButtons = document.querySelectorAll(".chip-btn");

let chips = 1000;
let selectedChipAmount = 10;
let selectedBetTarget = null;
let activeBet = null;

function pocketColorClass(pocket) {
  if (pocket === "0" || pocket === "00") {
    return "green";
  }
  return redNumbers.has(pocket) ? "red" : "black";
}

function describeTarget(target) {
  if (target === "RED") return "All on Red";
  if (target === "BLACK") return "All on Black";
  return target;
}

function buildPockets() {
  pocketsEl.innerHTML = "";

  wheelPockets.forEach((pocket) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = pocket;
    button.className = `pocket ${pocketColorClass(pocket)}`;
    button.dataset.pocket = pocket;

    button.addEventListener("click", () => {
      selectedBetTarget = pocket;
      render();
      statusEl.textContent = `Pocket ${pocket} selected. Choose amount and place bet.`;
    });

    pocketsEl.append(button);
  });
}

function setSelectedChip(amount) {
  selectedChipAmount = amount;
  render();
  statusEl.textContent = `Chip amount set to ${amount}.`;
}

function placeBet() {
  if (!selectedBetTarget) {
    statusEl.textContent = "Select a number or color bet first.";
    return;
  }

  if (selectedChipAmount > chips) {
    statusEl.textContent = "Not enough chips for that bet amount.";
    return;
  }

  chips -= selectedChipAmount;
  activeBet = {
    amount: selectedChipAmount,
    target: selectedBetTarget,
  };

  statusEl.textContent = `Bet placed: ${activeBet.amount} on ${describeTarget(activeBet.target)}. Click Spin.`;
  render();
}

function spinWheel() {
  if (!activeBet) {
    statusEl.textContent = "Place a bet before spinning.";
    return;
  }

  const winningPocket = wheelPockets[Math.floor(Math.random() * wheelPockets.length)];
  const winningColor = pocketColorClass(winningPocket);

  const isExactNumberWin = winningPocket === activeBet.target;
  const isRedWin = activeBet.target === "RED" && winningColor === "red";
  const isBlackWin = activeBet.target === "BLACK" && winningColor === "black";
  const isWin = isExactNumberWin || isRedWin || isBlackWin;

  if (isWin) {
    const isColorBet = activeBet.target === "RED" || activeBet.target === "BLACK";
    const payout = isColorBet ? activeBet.amount * 2 : activeBet.amount * 36;
    chips += payout;
    statusEl.textContent = `Ball landed on ${winningPocket}. You win ${payout} chips!`;
  } else {
    statusEl.textContent = `Ball landed on ${winningPocket}. You lost ${activeBet.amount} chips.`;
  }

  activeBet = null;
  render();
}

function clearBet() {
  if (activeBet) {
    chips += activeBet.amount;
    activeBet = null;
    statusEl.textContent = "Active bet cleared and refunded.";
  } else {
    statusEl.textContent = "No active bet to clear.";
  }

  render();
}

function recharge() {
  if (chips > 0 || activeBet) {
    return;
  }

  chips = 1000;
  statusEl.textContent = "Chips recharged to 1000.";
  render();
}

function render() {
  chipsEl.textContent = `Chips: ${chips}`;
  currentBetEl.textContent = `Current Bet: ${activeBet ? `${activeBet.amount} on ${describeTarget(activeBet.target)}` : 0}`;
  selectedPocketEl.textContent = `Selected Bet: ${selectedBetTarget ? describeTarget(selectedBetTarget) : "None"}`;

  chipButtons.forEach((button) => {
    const amount = Number(button.dataset.bet);
    button.classList.toggle("active-chip", amount === selectedChipAmount);
    button.disabled = Boolean(activeBet);
  });

  [...pocketsEl.querySelectorAll(".pocket")].forEach((button) => {
    const isSelected = button.dataset.pocket === selectedBetTarget;
    const isBetPocket = activeBet && button.dataset.pocket === activeBet.target;
    button.classList.toggle("selected-pocket", isSelected);
    button.classList.toggle("bet-pocket", Boolean(isBetPocket));
    button.disabled = Boolean(activeBet);
  });

  const redSelected = selectedBetTarget === "RED";
  const blackSelected = selectedBetTarget === "BLACK";
  const redBet = activeBet && activeBet.target === "RED";
  const blackBet = activeBet && activeBet.target === "BLACK";

  betRedBtn.classList.toggle("selected-pocket", redSelected);
  betBlackBtn.classList.toggle("selected-pocket", blackSelected);
  betRedBtn.classList.toggle("bet-pocket", Boolean(redBet));
  betBlackBtn.classList.toggle("bet-pocket", Boolean(blackBet));

  betRedBtn.disabled = Boolean(activeBet);
  betBlackBtn.disabled = Boolean(activeBet);

  placeBetBtn.disabled = Boolean(activeBet);
  spinBtn.disabled = !activeBet;
  clearBetBtn.disabled = !activeBet;
  rechargeBtn.disabled = !(chips === 0 && !activeBet);
}

chipButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setSelectedChip(Number(button.dataset.bet));
  });
});

betRedBtn.addEventListener("click", () => {
  selectedBetTarget = "RED";
  statusEl.textContent = "All on Red selected. Choose amount and place bet.";
  render();
});

betBlackBtn.addEventListener("click", () => {
  selectedBetTarget = "BLACK";
  statusEl.textContent = "All on Black selected. Choose amount and place bet.";
  render();
});

placeBetBtn.addEventListener("click", placeBet);
spinBtn.addEventListener("click", spinWheel);
clearBetBtn.addEventListener("click", clearBet);
rechargeBtn.addEventListener("click", recharge);

buildPockets();
render();

gameSwitcher.value = "roulette";
gameSwitcher.addEventListener("change", () => {
  if (gameSwitcher.value === "roulette") {
    return;
  }

  if (gameSwitcher.value === "blackjack") {
    window.location.href = "index.html";
  }
});
