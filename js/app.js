const app = document.getElementById('app');

async function loadPage(page) {
  try {
    const res = await fetch(`templates/${page}.html`);
    if (!res.ok) throw new Error('Página não encontrada');
    const html = await res.text();
    app.innerHTML = html;

    initScripts(); // Inicializa scripts para SPA
  } catch (err) {
    app.innerHTML = `<h2>Erro ao carregar a página</h2><p>${err.message}</p>`;
  }
}

// Inicializar página padrão
loadPage('home');

// Detectar mudança de hash
window.addEventListener('hashchange', () => {
  const page = window.location.hash.substring(1);
  if (page) loadPage(page);
});

// Função que reaplica scripts (animações, máscaras, destaque de menu)
function initScripts() {
  // Destacar link ativo
  document.querySelectorAll("nav a").forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${window.location.hash.substring(1)}`) {
      link.classList.add("active");
    }
  });

  // Observer de animação
  const elements = document.querySelectorAll(".projeto, section, main.container");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  elements.forEach(el => observer.observe(el));

  // Máscaras e validações
  const cpf = document.getElementById("cpf");
  const telefone = document.getElementById("telefone");
  const cep = document.getElementById("cep");

  if (cpf) {
    cpf.addEventListener("input", () => {
      cpf.value = cpf.value
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    });
  }

  if (telefone) {
    telefone.addEventListener("input", () => {
      telefone.value = telefone.value
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
    });
  }

  if (cep) {
    cep.addEventListener("blur", async () => {
      const cepLimpo = cep.value.replace(/\D/g, "");
      if (cepLimpo.length === 8) {
        try {
          const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
          const dados = await resposta.json();
          if (!dados.erro) {
            document.getElementById("rua").value = dados.logradouro || "";
            document.getElementById("cidade").value = dados.localidade || "";
            document.getElementById("estado").value = dados.uf || "";
          } else {
            alert("CEP não encontrado.");
          }
        } catch (erro) {
          alert("Erro ao buscar CEP.");
        }
      }
    });
  }
}
