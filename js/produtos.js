/* ==========================================================================
   TECHSTORE - Filtros da página de produtos
   Faz funcionar: categorias, faixa de preço e ordenação.
   ========================================================================== */

// Converte textos como "R$ 12.500,00" ou "210,00" em número (12500 e 210).
// Devolve null se o campo estiver vazio ou inválido.
function converterPreco(texto) {
    const limpo = String(texto).replace(/[^\d,]/g, "").replace(",", ".");
    const numero = parseFloat(limpo);
    return isNaN(numero) ? null : numero;
}

// Mostra um número no formato brasileiro, ex.: 12500 -> "12.500,00"
function formatarPreco(numero) {
    return numero.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const grade = document.querySelector(".grelha-produtos-dji");
    const cards = Array.from(grade.querySelectorAll(".card-dji"));
    const pills = document.querySelectorAll(".tag-pill");
    const campos = document.querySelectorAll(".inputs-preco input");
    const inputMin = campos[0];
    const inputMax = campos[1];
    const btnPreco = document.querySelector(".btn-filtrar-preco");
    const selectOrdenar = document.getElementById("ordenar");
    const contagem = document.getElementById("contagem");

    let categoriaAtual = "Todas";

    // Mensagem exibida quando nenhum produto atende aos filtros
    const semResultados = document.createElement("p");
    semResultados.className = "sem-resultados";
    semResultados.textContent = "Nenhum produto encontrado com esses filtros.";
    semResultados.hidden = true;
    grade.after(semResultados);

    // Guarda no próprio card a posição original, o preço e o código
    cards.forEach(function (card, i) {
        card.dataset.ordem = i;
        card.dataset.preco = converterPreco(card.querySelector(".preco-vista").textContent);
        card.dataset.codigo = card.querySelector(".codigo-prod").textContent.trim();
    });

    function aplicarFiltros() {
        let min = converterPreco(inputMin.value);
        let max = converterPreco(inputMax.value);

        // Se o mínimo for maior que o máximo, troca os dois de lugar
        if (min !== null && max !== null && min > max) {
            const troca = min;
            min = max;
            max = troca;
            inputMin.value = formatarPreco(min);
            inputMax.value = formatarPreco(max);
        }

        let visiveis = 0;

        cards.forEach(function (card) {
            const preco = parseFloat(card.dataset.preco);
            const categoriaOk = categoriaAtual === "Todas" || card.dataset.categoria === categoriaAtual;
            const minOk = min === null || preco >= min;
            const maxOk = max === null || preco <= max;
            const mostrar = categoriaOk && minOk && maxOk;

            card.hidden = !mostrar;
            if (mostrar) visiveis++;
        });

        semResultados.hidden = visiveis > 0;
        contagem.textContent = visiveis + (visiveis === 1 ? " produto" : " produtos");

        ordenar();
    }

    function ordenar() {
        const criterio = selectOrdenar.value;
        const lista = cards.slice();

        lista.sort(function (a, b) {
            if (criterio === "Menor Preço") return a.dataset.preco - b.dataset.preco;
            if (criterio === "Maior Preço") return b.dataset.preco - a.dataset.preco;
            if (criterio === "Código (PROD)") return a.dataset.codigo.localeCompare(b.dataset.codigo);
            return a.dataset.ordem - b.dataset.ordem; // Relevância = ordem original
        });

        lista.forEach(function (card) {
            grade.appendChild(card);
        });
    }

    // Clique nas categorias
    pills.forEach(function (pill) {
        pill.addEventListener("click", function () {
            pills.forEach(function (p) { p.classList.remove("ativo"); });
            pill.classList.add("ativo");
            categoriaAtual = pill.textContent.trim();
            aplicarFiltros();
        });
    });

    // Faixa de preço: botão ">" ou tecla Enter
    btnPreco.addEventListener("click", aplicarFiltros);
    [inputMin, inputMax].forEach(function (campo) {
        campo.addEventListener("keydown", function (evento) {
            if (evento.key === "Enter") {
                evento.preventDefault();
                aplicarFiltros();
            }
        });
    });

    // Ordenação
    selectOrdenar.addEventListener("change", ordenar);

    aplicarFiltros();
});
