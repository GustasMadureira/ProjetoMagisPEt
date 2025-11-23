document.addEventListener("DOMContentLoaded", () => {
const url = "https://cc20c04c-918d-4941-adea-327d532368d2-00-3p832i6nen4dl.riker.replit.dev/eventos";

  fetch(url)
    .then(response => response.json())
    .then(eventos => {
      const grid = document.querySelector(".grid-eventos");
      if (!grid) return;

      eventos.forEach(evento => {
        const card = document.createElement("div");
        card.classList.add("card-evento");

        card.dataset.id = evento.id;
        card.dataset.titulo = evento["nome-evento"];
        card.dataset.data = evento["data-evento"];
        card.dataset.horario = evento["hora-evento"] || "Horário não informado";
        card.dataset.local = evento["local-evento"];
        card.dataset.descricao = evento["descricao-comp"];
        card.dataset.imagem = evento["link-banner"] || "https://via.placeholder.com/600x300?text=Sem+Imagem";

        card.innerHTML = `
          <img src="${card.dataset.imagem}" alt="${evento["nome-evento"]}" />
          <div class="conteudo-evento">
            <h3>${evento["nome-evento"]}</h3>
            <div class="info-evento">
              <div class="info-item"><strong>📅 Data:</strong> ${evento["data-evento"]}</div>
              <div class="info-item"><strong>🕐 Horário:</strong> ${evento["hora-evento"]}</div>
              <div class="info-item"><strong>📍 Local:</strong> ${evento["local-evento"]}</div>
            </div>
            <p>${evento["descricao-curta"] || "Descrição não disponível."}</p>
          </div>
        `;

        card.addEventListener("click", () => mostrarDetalhes(card));
        grid.appendChild(card);
      });
    })
    .catch(error => {
      console.error("Erro ao buscar eventos:", error);
    });
});
