document.addEventListener("DOMContentLoaded", () => {
  // ===== MODO ESCURO =====
  const botao = document.getElementById("botao-tema");
  const linkCss = document.getElementById("tema-css");
  const logo = document.getElementById("logo");
  let tema = localStorage.getItem("tema") || "claro";

  function setTema(t) {
    if (linkCss) linkCss.href = t === "escuro" ? "escuro.css" : "claro.css";
    if (logo)
      logo.src =
        t === "escuro"
          ? "mindflow_logo_branca.png"
          : "mindflow_logo_transparente.png";
    if (botao)
      botao.textContent = t === "escuro" ? "☀️ Modo Claro" : "🌙 Modo Escuro";
    localStorage.setItem("tema", t);
  }
  setTema(tema);

  if (botao) {
    botao.addEventListener("click", () => {
      tema = tema === "escuro" ? "claro" : "escuro";
      setTema(tema);
    });
  }

  // ===== CALENDÁRIO =====
  let eventos = JSON.parse(localStorage.getItem("eventos")) || [];
  const calendarEl = document.getElementById("calendar");
  if (calendarEl) {
    window.calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      locale: "pt-br",
      editable: true,
      selectable: true,
      height: "auto",
      contentHeight: "auto",
      headerToolbar: {
        left: "prev,next today addEventButton",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
      },
      customButtons: {
        addEventButton: {
          text: "➕ Adicionar Evento",
          click: adicionarEvento,
        },
      },
      events: eventos,
    });
    window.calendar.render();
  }

  function adicionarEvento() {
    const titulo = prompt("Digite o nome do evento:");
    if (!titulo) return;
    const descricao = prompt("Descrição (opcional):");
    const data = prompt("Data (AAAA-MM-DD):");
    const hora = prompt("Hora (HH:MM) ou deixe em branco:");
    if (!data) {
      alert("⚠️ Data inválida");
      return;
    }
    const evento = {
      title: titulo,
      start: hora ? `${data}T${hora}` : data,
      description: descricao || "",
    };
    window.calendar.addEvent(evento);
    eventos.push(evento);
    localStorage.setItem("eventos", JSON.stringify(eventos));
  }

  // ===== DIÁRIO =====
  let currentEntry = null;
  const tituloEl = document.getElementById("titulo");
  const textoEl = document.getElementById("texto");
  const humorEl = document.getElementById("humor");
  const container = document.getElementById("entries-container");

  function renderEntries() {
    if (!container) return;
    container.innerHTML = "";
    let entries = JSON.parse(localStorage.getItem("entries")) || [];
    entries.forEach((entry) => {
      const div = document.createElement("div");
      div.className = "entry";
      div.innerHTML = `<h3>${entry.title} <span class="mood">${
        entry.humor
      }</span></h3>
                       <small>${entry.date}</small>
                       <p>${entry.text.substring(0, 150)}...</p>`;
      div.onclick = () => openPopup(entry);
      container.appendChild(div);
    });
  }

  window.salvarEntrada = function () {
    if (!tituloEl || !textoEl || !humorEl) return;
    const titulo = tituloEl.value.trim();
    const texto = textoEl.value.trim();
    const humor = humorEl.value;
    if (!titulo || !texto) {
      alert("Preencha o título e o texto!");
      return;
    }
    const entrada = {
      id: Date.now(),
      title: titulo,
      text: texto,
      humor,
      date: new Date().toLocaleString(),
    };
    let entries = JSON.parse(localStorage.getItem("entries")) || [];
    entries.unshift(entrada);
    localStorage.setItem("entries", JSON.stringify(entries));
    renderEntries();
    tituloEl.value = "";
    textoEl.value = "";
  };

  window.openPopup = function (entry) {
    currentEntry = entry;
    document.getElementById("popup-title").textContent = entry.title;
    document.getElementById("popup-date").textContent = entry.date;
    document.getElementById("popup-text").textContent = entry.text;
    document.getElementById("popup").classList.remove("hidden");
  };

  window.closePopup = function () {
    document.getElementById("popup").classList.add("hidden");
    currentEntry = null;
  };

  window.editEntry = function () {
    if (!currentEntry) return;
    const novoTexto = prompt("Edite seu texto:", currentEntry.text);
    if (novoTexto !== null) {
      let entries = JSON.parse(localStorage.getItem("entries")) || [];
      const idx = entries.findIndex((e) => e.id === currentEntry.id);
      entries[idx].text = novoTexto;
      localStorage.setItem("entries", JSON.stringify(entries));
      renderEntries();
      openPopup(entries[idx]);
    }
  };

  window.deleteEntry = function () {
    if (!currentEntry) return;
    let entries = JSON.parse(localStorage.getItem("entries")) || [];
    entries = entries.filter((e) => e.id !== currentEntry.id);
    localStorage.setItem("entries", JSON.stringify(entries));
    renderEntries();
    closePopup();
  };

  renderEntries();

  // ===== LOGOUT =====
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      alert("Você será desconectado!");
      window.location.href = "index.html";
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    // ==============================
    // 🔹 CHAT IA MINDLFOW
    // ==============================
    const chatToggle = document.getElementById("chat-toggle");
    const chatWindow = document.getElementById("chat-window");
    const chatClose = document.getElementById("chat-close");
    const sendBtn = document.getElementById("send-btn");
    const userInput = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-box");

    if (
      chatToggle &&
      chatWindow &&
      chatClose &&
      sendBtn &&
      userInput &&
      chatBox
    ) {
      chatToggle.addEventListener("click", () =>
        chatWindow.classList.toggle("hidden")
      );
      chatClose.addEventListener("click", () =>
        chatWindow.classList.add("hidden")
      );

      async function sendMessage() {
        const texto = msgInput.value.trim();
        if (!texto) return;

        chatBox.innerHTML += `<div class='sos-user-msg'>${texto}</div>`;
        msgInput.value = "";
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
          const res = await fetch("/chat", {
            // <-- Garantir que está assim!
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: texto }),
          });

          if (!res.ok) {
            const txt = await res.text();
            throw new Error(`Erro: ${res.status} → ${txt}`);
          }

          const data = await res.json();
          const reply = data.reply || "⚠️ A IA não respondeu.";
          chatBox.innerHTML += `<div class='sos-ai-msg'>${reply}</div>`;
          chatBox.scrollTop = chatBox.scrollHeight;
        } catch (err) {
          console.error("Erro no chat:", err);
          // A linha abaixo foi ajustada para exibir o erro real no chat, o que ajuda na depuração
          chatBox.innerHTML += `<div class='sos-ai-msg'>❌ Erro: ${err.message}</div>`;
        }
      }

      sendBtn.addEventListener("click", sendMessage);
      userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
      });
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // ... TODO O SEU CÓDIGO ATUAL (modo escuro, calendário, diário, chat, etc)

  // ===== MAPA =====
  function initMap() {
    const saoPaulo = { lat: -23.5505, lng: -46.6333 };
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 12,
      center: saoPaulo,
    });

    // Para uma aplicação real, as buscas seriam feitas aqui.
    // Como exemplo, usamos os dados pré-carregados abaixo.
    const locais = [
      // --- CAPS ---
      {
        pos: { lat: -23.676, lng: -46.6974 },
        nome: "CAPS AD II Santo Amaro",
        tipo: "caps",
      },
      {
        pos: { lat: -23.6938, lng: -46.6572 },
        nome: "CAPS Adulto II Cidade Ademar",
        tipo: "caps",
      },
      {
        pos: { lat: -23.6334, lng: -46.7099 },
        nome: "CAPS ADULTO III LARGO 13",
        tipo: "caps",
      },
      {
        pos: { lat: -23.6826, lng: -46.6631 },
        nome: "CAPS AD II CIDADE ADEMAR",
        tipo: "caps",
      },

      // --- Clínicas Psiquiátricas ---
      {
        pos: { lat: -23.5857, lng: -46.6433 },
        nome: "Clínica Spatium",
        tipo: "clinica",
      },
      {
        pos: { lat: -23.6067, lng: -46.68 },
        nome: "Dra. Lilian Bruza | Consultório Psiquiatria",
        tipo: "clinica",
      },
      {
        pos: { lat: -23.5413, lng: -46.5765 },
        nome: "Espaço Humaniza Clínica de Psiquiatria",
        tipo: "clinica",
      },

      // --- Consultórios de Psicologia ---
      {
        pos: { lat: -23.6666, lng: -46.6668 },
        nome: "New Life Psicologia",
        tipo: "consultorio",
      },
      {
        pos: { lat: -23.6559, lng: -46.6787 },
        nome: "Psicóloga Carla Olivastro",
        tipo: "consultorio",
      },
      {
        pos: { lat: -23.6644, lng: -46.671 },
        nome: "Gaude Psicologia",
        tipo: "consultorio",
      },
    ];

    // --- Ícones Personalizados para Priorização ---
    // Você pode criar ou baixar seus próprios ícones!
    const icones = {
      caps: {
        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png", // Ícone vermelho para CAPS
      },
      clinica: {
        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", // Ícone azul para Clínicas
      },
      consultorio: {
        url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png", // Ícone verde para Consultórios
      },
    };

    // Adiciona um marcador para cada local da lista
    locais.forEach((local) => {
      new google.maps.Marker({
        position: local.pos,
        map: map,
        title: local.nome,
        icon: icones[local.tipo].url, // Define o ícone com base no tipo
      });
    });

    // Pontos de exemplo
    const pontos = [
      { pos: { lat: -23.555, lng: -46.639 }, nome: "Hospital Central" },
      { pos: { lat: -23.545, lng: -46.629 }, nome: "Clínica Popular" },
      { pos: { lat: -23.56, lng: -46.64 }, nome: "CAPS Zona Sul" },
    ];

    pontos.forEach((p) => {
      new google.maps.Marker({
        position: p.pos,
        map,
        title: p.nome,
      });
    });
  }

  // chama o mapa só se a div existir
  if (document.getElementById("map")) {
    initMap();
  }
});

//QUESTIONARIO

const MAX_QUESTIONS = 3;
const BACKEND_BASE_URL = 'http://localhost:3000';
// A URL para obter a pergunta (agora acedida via GET)
const GET_QUESTION_URL = `${BACKEND_BASE_URL}/api/get-question`;
// A URL para criar o perfil (continua a ser POST pois envia dados)
const CREATE_PROFILE_URL = `${BACKEND_BASE_URL}/api/create-profile`;

// --- ELEMENTOS DA PÁGINA ---
let loadingDiv, questionDiv, profileDiv, errorDiv;
let questionTextElement, optionsContainer, profileTextElement, errorMessageElement;


// --- ESTADO DA APLICAÇÃO ---
let questionCount = 0;
let userAnswers = [];
let currentQuestion = '';

// --- FUNÇÕES PRINCIPAIS ---

/**
 * Mostra um dos estados principais da UI (loading, question, profile, error) e esconde os outros.
 * @param {string} state - O estado a ser mostrado ('loading', 'question', 'profile', 'error').
 */
function showUIState(state) {
    if (!loadingDiv) return;
    loadingDiv.classList.add('hidden');
    questionDiv.classList.add('hidden');
    profileDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');

    if (state === 'loading') loadingDiv.classList.remove('hidden');
    if (state === 'question') questionDiv.classList.remove('hidden');
    if (state === 'profile') profileDiv.classList.remove('hidden');
    if (state === 'error') errorDiv.classList.remove('hidden');
}

/**
 * Função de fetch com retentativas para lidar com falhas de rede.
 * @param {string} url - A URL para a qual fazer a requisição.
 * @param {object} options - As opções para a requisição fetch.
 * @param {number} retries - O número de tentativas restantes.
 * @returns {Promise<any>} - Os dados da resposta em JSON.
 */
async function fetchWithExponentialBackoff(url, options, retries = 5) {
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            const delay = Math.pow(2, i) * 100;
            console.warn(`Tentativa ${i + 1} falhou: ${error.message}. Tentando novamente em ${delay}ms...`);
            if (i === retries - 1) {
                console.error(`Erro final após ${retries} tentativas:`, error);
                throw error;
            }
            await wait(delay);
        }
    }
}

/**
 * Busca a próxima pergunta do backend utilizando o método GET.
 */
async function fetchQuestion() {
    showUIState('loading');
    try {
        // ALTERAÇÃO PRINCIPAL: A chamada agora é um GET.
        // O método 'GET' é o padrão, então não precisamos de especificar { method: 'GET' }.
        const data = await fetchWithExponentialBackoff(GET_QUESTION_URL);

        currentQuestion = data.pergunta;
        displayQuestion(data.pergunta, data.opcoes);
        showUIState('question');

    } catch (error) {
        console.error('Erro ao buscar pergunta do backend:', error);
        errorMessageElement.textContent = `Não foi possível carregar a pergunta. Verifique se o servidor (server.js) está a ser executado e tente novamente. (Erro: ${error.message})`;
        showUIState('error');
    }
}

/**
 * Mostra a pergunta e as opções na tela.
 * @param {string} question - O texto da pergunta.
 * @param {string[]} options - Um array com as opções de resposta.
 */
function displayQuestion(question, options) {
    questionTextElement.textContent = question;
    optionsContainer.innerHTML = '';
    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.className = 'option-button';
        button.onclick = () => handleOptionClick(option);
        optionsContainer.appendChild(button);
    });
}

/**
 * Lida com o clique numa opção de resposta.
 * @param {string} answer - A resposta selecionada pelo usuário.
 */
function handleOptionClick(answer) {
    userAnswers.push({ question: currentQuestion, answer: answer });
    questionCount++;

    if (questionCount >= MAX_QUESTIONS) {
        fetchProfile();
    } else {
        fetchQuestion();
    }
}

/**
 * Envia as respostas para o backend para gerar o perfil do usuário.
 */
async function fetchProfile() {
    showUIState('loading');
    try {
        // Este pedido permanece POST porque precisa de enviar os dados das respostas.
        const data = await fetchWithExponentialBackoff(CREATE_PROFILE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers: userAnswers })
        });

        profileTextElement.textContent = data.profileText;
        showUIState('profile');

    } catch (error) {
        console.error('Erro ao criar perfil no backend:', error);
        errorMessageElement.textContent = `Não foi possível criar o seu perfil. (Erro: ${error.message})`;
        showUIState('error');
    }
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    loadingDiv = document.getElementById('loading-state');
    questionDiv = document.getElementById('question-state');
    profileDiv = document.getElementById('profile-state');
    errorDiv = document.getElementById('error-state');
    questionTextElement = document.getElementById('question-text');
    optionsContainer = document.getElementById('options-container');
    profileTextElement = document.getElementById('profile-text');
    errorMessageElement = document.getElementById('error-message');

    if (!loadingDiv || !questionDiv || !profileDiv || !errorDiv) {
        console.error("Erro Crítico: Um ou mais elementos principais da UI não foram encontrados no HTML. Verifique os IDs.");
        return;
    }

    fetchQuestion();
});
