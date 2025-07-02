const cards = document.querySelectorAll(".card");
const dropzones = document.querySelectorAll(".areaGuerreiro1, .areaGuerreiro2");
const deck = document.querySelector(".deck");
const resetButton = document.querySelector(".log button:last-of-type");
const battleButton = document.querySelector(".log button:first-of-type");
const infoLog = document.querySelector(".infolog");

const arena1Element = document.querySelector(".arena1");
const arena2Element = document.querySelector(".arena2");
const defaultArenaOuterBgColor = getComputedStyle(arena1Element)
  .getPropertyValue("background-color")
  .trim();

function appendToLog(message) {
  const p = document.createElement("p");
  p.textContent = message;
  infoLog.appendChild(p);
  infoLog.scrollTop = infoLog.scrollHeight;
}

function returnCardToDeck(cardElement, arenaElement) {
  if (cardElement) {
    deck.appendChild(cardElement);
    arenaElement.parentNode.style.backgroundColor = defaultArenaOuterBgColor;
    const p = document.createElement("p");
    p.textContent = "Arraste um Deus aqui";
    arenaElement.appendChild(p);
  }
}

function getCardStats(cardElement) {
  if (!cardElement) return null;
  const attackText = cardElement.querySelector("p:first-of-type").textContent;
  const defenseText = cardElement.querySelector("p:last-of-type").textContent;
  const attack = parseInt(attackText.match(/\d+/)[0]);
  const defense = parseInt(defenseText.match(/\d+/)[0]);
  return { attack, defense };
}

cards.forEach((card) => {
  card.addEventListener("dragstart", (event) => {
    card.classList.add("dragging");
    event.dataTransfer.setData("text/plain", card.id);
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
  });
});

dropzones.forEach((zone) => {
  zone.addEventListener("dragover", (event) => {
    event.preventDefault();
    zone.classList.add("drag-over");
  });

  zone.addEventListener("dragenter", (event) => {
    event.preventDefault();
  });

  zone.addEventListener("dragleave", () => {
    zone.classList.remove("drag-over");
  });

  zone.addEventListener("drop", (event) => {
    event.preventDefault();
    zone.classList.remove("drag-over");

    const cardId = event.dataTransfer.getData("text/plain");
    const draggedCard = document.getElementById(cardId);
    const originalParentArena = draggedCard.parentNode.parentNode;
    const existingCardInZone = zone.querySelector(".card");

    while (zone.firstChild) {
      zone.removeChild(zone.firstChild);
    }

    if (existingCardInZone) {
      if (
        originalParentArena.classList.contains("arena1") ||
        originalParentArena.classList.contains("arena2")
      ) {
        const originalDropZone = originalParentArena.querySelector(
          ".areaGuerreiro1, .areaGuerreiro2"
        );
        while (originalDropZone.firstChild) {
          originalDropZone.removeChild(originalDropZone.firstChild);
        }
        originalDropZone.appendChild(existingCardInZone);
        const originalArenaCard = originalDropZone.querySelector(".card");
        if (originalArenaCard) {
          const originalArenaThemeColor = getComputedStyle(originalArenaCard)
            .getPropertyValue("--theme-color")
            .trim();
          originalParentArena.style.backgroundColor =
            originalArenaThemeColor || defaultArenaOuterBgColor;
        } else {
          originalParentArena.style.backgroundColor = defaultArenaOuterBgColor;
          const p = document.createElement("p");
          p.textContent = "Arraste um Deus aqui";
          originalDropZone.appendChild(p);
        }
      } else {
        deck.appendChild(existingCardInZone);
      }
    }

    zone.appendChild(draggedCard);

    const computedStyle = getComputedStyle(draggedCard);
    const themeColor = computedStyle.getPropertyValue("--theme-color").trim();
    if (themeColor) {
      zone.parentNode.style.backgroundColor = themeColor;
    }

    if (
      (originalParentArena.classList.contains("arena1") ||
        originalParentArena.classList.contains("arena2")) &&
      !originalParentArena.querySelector(".card")
    ) {
      const originalDropZone = originalParentArena.querySelector(
        ".areaGuerreiro1, .areaGuerreiro2"
      );
      const p = document.createElement("p");
      p.textContent = "Arraste um Deus aqui";
      originalDropZone.appendChild(p);
      originalParentArena.style.backgroundColor = defaultArenaOuterBgColor;
    }
  });
});

deck.addEventListener("dragover", (event) => {
  event.preventDefault();
  deck.classList.add("drag-over-deck");
});

deck.addEventListener("dragenter", (event) => {
  event.preventDefault();
});

deck.addEventListener("dragleave", () => {
  deck.classList.remove("drag-over-deck");
});

deck.addEventListener("drop", (event) => {
  event.preventDefault();
  deck.classList.remove("drag-over-deck");

  const cardId = event.dataTransfer.getData("text/plain");
  const draggedCard = document.getElementById(cardId);
  const originalParentArena = draggedCard.parentNode.parentNode;

  let targetCard = event.target.closest(".card");

  if (targetCard && targetCard !== draggedCard) {
    const boundingBox = targetCard.getBoundingClientRect();
    const offset = event.clientX - boundingBox.left;
    if (offset < boundingBox.width / 2) {
      deck.insertBefore(draggedCard, targetCard);
    } else {
      deck.insertBefore(draggedCard, targetCard.nextSibling);
    }
  } else {
    deck.appendChild(draggedCard);
  }

  if (
    originalParentArena.classList.contains("arena1") ||
    originalParentArena.classList.contains("arena2")
  ) {
    const originalDropZone = originalParentArena.querySelector(
      ".areaGuerreiro1, .areaGuerreiro2"
    );
    if (!originalDropZone.querySelector(".card")) {
      const p = document.createElement("p");
      p.textContent = "Arraste um Deus aqui";
      originalDropZone.appendChild(p);
      originalParentArena.style.backgroundColor = defaultArenaOuterBgColor;
    }
  }
});

resetButton.addEventListener("click", () => {
  location.reload();
});

battleButton.addEventListener("click", () => {
  infoLog.innerHTML = "";

  const arena1Div = document.querySelector(".areaGuerreiro1");
  const arena2Div = document.querySelector(".areaGuerreiro2");
  const card1Element = arena1Div.querySelector(".card");
  const card2Element = arena2Div.querySelector(".card");

  if (!card1Element || !card2Element) {
    appendToLog("⚔️ Ambas as arenas precisam de um Deus para a batalha!");
    return;
  }

  const card1Stats = getCardStats(card1Element);
  const card2Stats = getCardStats(card2Element);

  let currentDef1 = card1Stats.defense;
  let currentDef2 = card2Stats.defense;

  appendToLog("----------- ⚔️ INÍCIO DA BATALHA ⚔️ -----------");
  appendToLog(
    `Deus da Arena 1: ${card1Element.id.toUpperCase()} (Ataque: ${
      card1Stats.attack
    }, Defesa: ${card1Stats.defense})`
  );
  appendToLog(
    `Deus da Arena 2: ${card2Element.id.toUpperCase()} (Ataque: ${
      card2Stats.attack
    }, Defesa: ${card2Stats.defense})`
  );
  appendToLog("-------------------------------------------");

  let turn = 0;
  const maxTurns = 100;

  while (currentDef1 > 0 && currentDef2 > 0 && turn < maxTurns) {
    turn++;
    appendToLog(`\n--- TURNO ${turn} ---`);

    const damage1 = card1Stats.attack;
    currentDef2 -= damage1;
    appendToLog(
      `${card1Element.id.toUpperCase()} (Arena 1) ataca ${card2Element.id.toUpperCase()} (Arena 2), causando ${damage1} de dano!`
    );
    appendToLog(
      `${card2Element.id.toUpperCase()} (Arena 2) agora tem ${Math.max(
        0,
        currentDef2
      )} de defesa.`
    );

    if (currentDef2 <= 0) {
      appendToLog(
        `\n💀 ${card2Element.id.toUpperCase()} (Arena 2) foi derrotado!`
      );
      returnCardToDeck(card2Element, arena2Div);
      appendToLog(`🏆 VENCEDOR: ${card1Element.id.toUpperCase()} (Arena 1)!`);
      break;
    }

    const damage2 = card2Stats.attack;
    currentDef1 -= damage2;
    appendToLog(
      `${card2Element.id.toUpperCase()} (Arena 2) contra-ataca ${card1Element.id.toUpperCase()} (Arena 1), causando ${damage2} de dano!`
    );
    appendToLog(
      `${card1Element.id.toUpperCase()} (Arena 1) agora tem ${Math.max(
        0,
        currentDef1
      )} de defesa.`
    );

    if (currentDef1 <= 0) {
      appendToLog(
        `\n💀 ${card1Element.id.toUpperCase()} (Arena 1) foi derrotado!`
      );
      returnCardToDeck(card1Element, arena1Div);
      appendToLog(`🏆 VENCEDOR: ${card2Element.id.toUpperCase()} (Arena 2)!`);
      break;
    }
  }

  if (turn >= maxTurns) {
    appendToLog(
      "\n⚠️ A batalha atingiu o limite de turnos! Empate técnico ou batalha muito longa."
    );
  }

  appendToLog("\n----------- 🏁 FIM DA BATALHA 🏁 -----------");
});
