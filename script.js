// Seleção de Elementos DOM: Obtém referências aos elementos HTML
// com os quais o script irá interagir.
const cards = document.querySelectorAll(".card"); // Todas as cartas.
const dropzones = document.querySelectorAll(".areaGuerreiro1, .areaGuerreiro2"); // As áreas onde as cartas podem ser soltas.
const deck = document.querySelector(".deck"); // O contêiner do baralho.
const resetButton = document.querySelector(".log button:last-of-type"); // O botão de reset.
const battleButton = document.querySelector(".log button:first-of-type"); // O botão de batalha.
const infoLog = document.querySelector(".infolog"); // A área de log para mensagens da batalha.

const arena1Element = document.querySelector(".arena1"); // Elemento da Arena 1.
const arena2Element = document.querySelector(".arena2"); // Elemento da Arena 2.
// Obtém a cor de fundo padrão da arena externa para resetar após a remoção de uma carta.
const defaultArenaOuterBgColor = getComputedStyle(arena1Element)
  .getPropertyValue("background-color")
  .trim();

// Função para desabilitar/reabilitar interação do mouse no body ---
function toggleBodyMouseInteraction(disable) {
  if (disable) {
    document.body.classList.add("desabilitar-mouse");
  } else {
    document.body.classList.remove("desabilitar-mouse");
  }
}

// Função auxiliar para criar um atraso (delay)
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Função para adicionar mensagens ao log da batalha com um pequeno atraso.
async function appendToLogWithDelay(message, ms = 300) {
  // Aumentado o valor padrão de 'ms' novamente
  const p = document.createElement("p"); // Cria um novo parágrafo.
  p.textContent = message; // Define o texto da mensagem.
  infoLog.appendChild(p); // Adiciona o parágrafo ao log.
  infoLog.scrollTop = infoLog.scrollHeight; // Rola para o final do log.
  await delay(ms); // Espera o tempo definido antes de continuar
}

// Função para retornar uma carta da arena para o baralho.
function returnCardToDeck(cardElement, arenaElement) {
  if (cardElement) {
    deck.appendChild(cardElement); // Move a carta de volta para o baralho.
    // Restaura a cor de fundo da arena para o padrão.
    arenaElement.parentNode.style.backgroundColor = defaultArenaOuterBgColor;
    const p = document.createElement("p"); // Cria o texto de placeholder "Arraste um Deus aqui".
    p.textContent = "Arraste um Deus aqui";
    arenaElement.appendChild(p); // Adiciona o placeholder de volta à arena.
  }
}

// Função para extrair os valores de ataque e defesa de uma carta.
function getCardStats(cardElement) {
  if (!cardElement) return null; // Retorna nulo se não houver carta.
  // Extrai o texto do ataque e defesa.
  const attackText = cardElement.querySelector("p:first-of-type").textContent;
  const defenseText = cardElement.querySelector("p:last-of-type").textContent;
  // Converte para números inteiros.
  const attack = parseInt(attackText.match(/\d+/)[0]);
  const defense = parseInt(defenseText.match(/\d+/)[0]);
  return { attack, defense }; // Retorna um objeto com os valores.
}

// Event Listeners para Drag and Drop (Arrastar e Soltar)
cards.forEach((card) => {
  // Ao iniciar o arrastar:
  card.addEventListener("dragstart", (event) => {
    card.classList.add("dragging"); // Adiciona classe 'dragging' para estilo visual.
    event.dataTransfer.setData("text/plain", card.id); // Define o ID da carta como dado a ser transferido.
  });
  // Ao finalizar o arrastar:
  card.addEventListener("dragend", () => {
    card.classList.remove("dragging"); // Remove a classe 'dragging'.
  });
});

dropzones.forEach((zone) => {
  // Quando uma carta está sendo arrastada sobre a zona de drop:
  zone.addEventListener("dragover", (event) => {
    event.preventDefault(); // Permite o drop.
    zone.classList.add("drag-over"); // Adiciona classe 'drag-over' para estilo visual.
  });
  // Quando uma carta entra na zona de drop:
  zone.addEventListener("dragenter", (event) => {
    event.preventDefault(); // Previne o comportamento padrão.
  });
  // Quando uma carta sai da zona de drop:
  zone.addEventListener("dragleave", () => {
    zone.classList.remove("drag-over"); // Remove a classe 'drag-over'.
  });
  // Quando uma carta é solta na zona de drop:
  zone.addEventListener("drop", (event) => {
    event.preventDefault(); // Previne o comportamento padrão.
    zone.classList.remove("drag-over"); // Remove a classe 'drag-over'.

    const cardId = event.dataTransfer.getData("text/plain"); // Obtém o ID da carta arrastada.
    const draggedCard = document.getElementById(cardId); // Obtém a carta arrastada.
    // Obtém o pai original da carta (a arena ou o deck).
    const originalParentArena = draggedCard.parentNode.parentNode;
    // Verifica se já existe uma carta na zona de drop.
    const existingCardInZone = zone.querySelector(".card");
    // Remove todos os filhos da zona de drop (incluindo o placeholder).
    while (zone.firstChild) {
      zone.removeChild(zone.firstChild);
    }
    // Se já existia uma carta na zona de drop:
    if (existingCardInZone) {
      // Se a carta existente veio de uma arena:
      if (
        originalParentArena.classList.contains("arena1") ||
        originalParentArena.classList.contains("arena2")
      ) {
        // Encontra a zona de drop original e move a carta de volta.
        const originalDropZone = originalParentArena.querySelector(
          ".areaGuerreiro1, .areaGuerreiro2"
        );
        while (originalDropZone.firstChild) {
          originalDropZone.removeChild(originalDropZone.firstChild);
        }
        originalDropZone.appendChild(existingCardInZone);
        const originalArenaCard = originalDropZone.querySelector(".card");
        if (originalArenaCard) {
          // Restaura a cor da arena original baseada na carta que voltou.
          const originalArenaThemeColor = getComputedStyle(originalArenaCard)
            .getPropertyValue("--theme-color")
            .trim();
          originalParentArena.style.backgroundColor =
            originalArenaThemeColor || defaultArenaOuterBgColor;
        } else {
          // Se não há carta na arena original, coloca o placeholder.
          originalParentArena.style.backgroundColor = defaultArenaOuterBgColor;
          const p = document.createElement("p");
          p.textContent = "Arraste um Deus aqui";
          originalDropZone.appendChild(p);
        }
      } else {
        // Se a carta existente veio do deck, retorna-a para o deck.
        deck.appendChild(existingCardInZone);
      }
    }

    zone.appendChild(draggedCard); // Adiciona a carta arrastada à nova zona de drop.
    // Aplica a cor do tema da carta à arena externa.
    const computedStyle = getComputedStyle(draggedCard);
    const themeColor = computedStyle.getPropertyValue("--theme-color").trim();
    if (themeColor) {
      zone.parentNode.style.backgroundColor = themeColor;
    }
    // Se a carta arrastada veio de uma arena e essa arena ficou vazia,
    // adiciona o placeholder e restaura a cor de fundo da arena.
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

// Event Listeners para o Deck (Baralho) - funcionalidade de drag and drop para o baralho.
deck.addEventListener("dragover", (event) => {
  event.preventDefault(); // Permite o drop.
  deck.classList.add("drag-over-deck"); // Adiciona classe para estilo.
});

deck.addEventListener("dragenter", (event) => {
  event.preventDefault(); // Previne o comportamento padrão.
});

deck.addEventListener("dragleave", () => {
  deck.classList.remove("drag-over-deck"); // Remove classe.
});

deck.addEventListener("drop", (event) => {
  event.preventDefault(); // Previne o comportamento padrão.
  deck.classList.remove("drag-over-deck"); // Remove classe.

  const cardId = event.dataTransfer.getData("text/plain"); // Obtém o ID da carta.
  const draggedCard = document.getElementById(cardId); // Obtém a carta.
  // Obtém o pai original da carta (se era uma arena).
  const originalParentArena = draggedCard.parentNode.parentNode;

  let targetCard = event.target.closest(".card"); // Verifica se o drop foi sobre outra carta no deck.
  // Se soltou sobre outra carta, insere antes ou depois dela, dependendo da posição do mouse.
  if (targetCard && targetCard !== draggedCard) {
    const boundingBox = targetCard.getBoundingClientRect();
    const offset = event.clientX - boundingBox.left;
    if (offset < boundingBox.width / 2) {
      deck.insertBefore(draggedCard, targetCard);
    } else {
      deck.insertBefore(draggedCard, targetCard.nextSibling);
    }
  } else {
    deck.appendChild(draggedCard); // Caso contrário, adiciona ao final do deck.
  }
  // Se a carta veio de uma arena e a arena ficou vazia, restaura o placeholder e a cor.
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

// Event Listener para o botão de Reset: Recarrega a página.
resetButton.addEventListener("click", () => {
  location.reload();
});

// Event Listener para o botão de Batalha: Inicia a lógica da batalha.
battleButton.addEventListener("click", async () => {
  toggleBodyMouseInteraction(true);

  infoLog.innerHTML = ""; // Limpa o log de batalha anterior.
  // Obtém as áreas e as cartas nas arenas.
  const arena1Div = document.querySelector(".areaGuerreiro1");
  const arena2Div = document.querySelector(".areaGuerreiro2");
  const card1Element = arena1Div.querySelector(".card");
  const card2Element = arena2Div.querySelector(".card");
  // Verifica se ambas as arenas têm cartas.
  if (!card1Element || !card2Element) {
    await appendToLogWithDelay(
      "⚔️ Ambas as arenas precisam de um Deus para a batalha!",
      500
    );

    toggleBodyMouseInteraction(false);

    return;
  }
  // Obtém as estatísticas de ataque e defesa das cartas.

  // A função getCardStats agora já retorna os valores ajustados para uma batalha mais longa.
  const card1Stats = getCardStats(card1Element);
  const card2Stats = getCardStats(card2Element);

  let currentDef1 = card1Stats.defense;
  let currentDef2 = card2Stats.defense;

  await appendToLogWithDelay("--- ⚔️ INÍCIO DA BATALHA ⚔️ ---", 1000);
  // Mostra os stats da batalha (já ajustados) no log.
  await appendToLogWithDelay(
    `Deus da Arena 1: ${card1Element.id.toUpperCase()} (Ataque: ${
      card1Stats.attack
    }, Defesa: ${card1Stats.defense})`,
    700
  );
  await appendToLogWithDelay(
    `Deus da Arena 2: ${card2Element.id.toUpperCase()} (Ataque: ${
      card2Stats.attack
    }, Defesa: ${card2Stats.defense})`,
    700
  );
  await appendToLogWithDelay(
    "-------------------------------------------",
    1000
  );

  let turn = 0;
  const maxTurns = 100;

  while (currentDef1 > 0 && currentDef2 > 0 && turn < maxTurns) {
    turn++;
    await appendToLogWithDelay(`\n--- ⚔️ TURNO ${turn} ⚔️ ---`, 800);

    // Animação de Ataque (Carta 1)
    card1Element.classList.add("attacking");
    card2Element.classList.add("taking-damage");
    await delay(500);

    const damage1 = card1Stats.attack;
    currentDef2 -= damage1;

    card1Element.classList.remove("attacking");
    card2Element.classList.remove("taking-damage");

    await appendToLogWithDelay(
      `${card1Element.id.toUpperCase()} (Arena 1) ataca ${card2Element.id.toUpperCase()} (Arena 2), causando ${damage1} de dano!`,
      400
    );
    await appendToLogWithDelay(
      `${card2Element.id.toUpperCase()} (Arena 2) agora tem ${Math.max(
        0,
        currentDef2
      )} de defesa.`,
      400
    );

    if (currentDef2 <= 0) {
      await appendToLogWithDelay(
        `\n 💀 ${card2Element.id.toUpperCase()} (Arena 2) foi derrotado! `,
        1000
      );
      card2Element.classList.add("defeated");
      await delay(1000);

      returnCardToDeck(card2Element, arena2Div);
      await appendToLogWithDelay(
        `\n 🏆 VENCEDOR: ${card1Element.id.toUpperCase()} (Arena 1)! `,
        1000
      );
      break;
    }

    await delay(700);

    // Animação de Ataque (Carta 2)
    card2Element.classList.add("attacking");
    card1Element.classList.add("taking-damage");
    await delay(500); // (500ms)

    const damage2 = card2Stats.attack;
    currentDef1 -= damage2;

    card2Element.classList.remove("attacking");
    card1Element.classList.remove("taking-damage");

    await appendToLogWithDelay(
      `${card2Element.id.toUpperCase()} (Arena 2) contra-ataca ${card1Element.id.toUpperCase()} (Arena 1), causando ${damage2} de dano!`,
      400
    );
    await appendToLogWithDelay(
      `${card1Element.id.toUpperCase()} (Arena 1) agora tem ${Math.max(
        0,
        currentDef1
      )} de defesa.`,
      400
    );

    if (currentDef1 <= 0) {
      await appendToLogWithDelay(
        `\n💀 ${card1Element.id.toUpperCase()} (Arena 1) foi derrotado! `,
        1000
      );
      card1Element.classList.add("defeated");
      await delay(1000);

      returnCardToDeck(card1Element, arena1Div);
      await appendToLogWithDelay(
        `\n 🏆 VENCEDOR: ${card2Element.id.toUpperCase()} (Arena 2)! `,
        1000
      );
      break;
    }
  }

  if (turn >= maxTurns) {
    await appendToLogWithDelay(
      "\n⚠️ A batalha atingiu o limite de turnos! Os deuses estão exaustos! É um empate!",
      1000
    );
  }

  await appendToLogWithDelay("\n--- 🏁 FIM DA BATALHA 🏁 ---", 1000);

  toggleBodyMouseInteraction(false);
});
