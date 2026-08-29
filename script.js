const arquivoAInput = document.getElementById("arquivoA");
const arquivoBInput = document.getElementById("arquivoB");
const nomeArquivoA = document.getElementById("nomeArquivoA");
const nomeArquivoB = document.getElementById("nomeArquivoB");
const botaoComecar = document.getElementById("botaoComecar");
const botaoReiniciar = document.getElementById("botaoReiniciar");
const comparador = document.getElementById("comparador");
const contador = document.getElementById("contador");
const progresso = document.getElementById("progresso");
const textoAElemento = document.getElementById("textoA");
const textoBElemento = document.getElementById("textoB");
const cardA = document.getElementById("cardA");
const cardB = document.getElementById("cardB");
const usarA = document.getElementById("usarA");
const usarB = document.getElementById("usarB");
const usarAmbos = document.getElementById("usarAmbos");
const editarTrecho = document.getElementById("editarTrecho");
const ignorarTrecho = document.getElementById("ignorarTrecho");
const editorArea = document.getElementById("editorArea");
const editorTexto = document.getElementById("editorTexto");
const salvarEdicao = document.getElementById("salvarEdicao");
const anterior = document.getElementById("anterior");
const proximo = document.getElementById("proximo");
const textoC = document.getElementById("textoC");
const quantidadeEscolhida = document.getElementById("quantidadeEscolhida");
const baixarTxt = document.getElementById("baixarTxt");

let arquivoA = null;
let arquivoB = null;
let blocosA = [];
let blocosB = [];
let comparacoes = [];
let indiceAtual = 0;

const palavrasIgnoradas = new Set([
  "a", "o", "as", "os", "um", "uma", "uns", "umas",
  "de", "da", "do", "das", "dos", "e", "ou", "em", "no", "na", "nos", "nas",
  "para", "por", "com", "sem", "que", "se", "ele", "ela", "eles", "elas",
  "eu", "tu", "voce", "voces", "me", "te", "lhe", "lhes",
  "meu", "minha", "meus", "minhas", "seu", "sua", "seus", "suas",
  "mais", "menos", "ja", "ainda", "como", "quando", "onde",
  "foi", "era", "ser", "estar", "tem", "tinha"
]);

arquivoAInput.addEventListener("change", () => {
  arquivoA = arquivoAInput.files[0] || null;
  nomeArquivoA.textContent = arquivoA ? arquivoA.name : "Nenhum arquivo selecionado";
  verificarArquivos();
});

arquivoBInput.addEventListener("change", () => {
  arquivoB = arquivoBInput.files[0] || null;
  nomeArquivoB.textContent = arquivoB ? arquivoB.name : "Nenhum arquivo selecionado";
  verificarArquivos();
});

function verificarArquivos() {
  botaoComecar.disabled = !(arquivoA && arquivoB);
}

botaoComecar.addEventListener("click", async () => {
  if (!arquivoA || !arquivoB) return;

  try {
    const conteudoA = await lerArquivo(arquivoA);
    const conteudoB = await lerArquivo(arquivoB);

    blocosA = dividirEmBlocos(conteudoA);
    blocosB = dividirEmBlocos(conteudoB);

    criarComparacoes();

    if (!comparacoes.length) {
      alert("Não foi encontrado nenhum texto para comparar.");
      return;
    }

    indiceAtual = 0;
    comparador.classList.remove("escondido");
    atualizarTela();

    comparador.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  } catch (erro) {
    console.error(erro);
    alert("Não foi possível ler um dos arquivos.");
  }
});

function lerArquivo(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();

    leitor.onload = () => resolve(String(leitor.result || ""));
    leitor.onerror = () => reject(leitor.error);

    leitor.readAsText(arquivo, "UTF-8");
  });
}

function dividirEmBlocos(texto) {
  const normalizado = texto
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  if (!normalizado) return [];

  return normalizado
    .split(/\n\s*\n+/)
    .map((bloco) => bloco.trim())
    .filter(Boolean);
}

function normalizarParaComparacao(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function obterPalavrasRelevantes(texto) {
  const normalizado = normalizarParaComparacao(texto);
  if (!normalizado) return [];

  return normalizado
    .split(" ")
    .filter((palavra) => palavra.length > 1 && !palavrasIgnoradas.has(palavra));
}

function similaridadeTexto(texto1, texto2) {
  if (!texto1 || !texto2) return 0;

  const normalizado1 = normalizarParaComparacao(texto1);
  const normalizado2 = normalizarParaComparacao(texto2);

  if (!normalizado1 || !normalizado2) return 0;
  if (normalizado1 === normalizado2) return 1;

  const conjunto1 = new Set(obterPalavrasRelevantes(texto1));
  const conjunto2 = new Set(obterPalavrasRelevantes(texto2));

  if (!conjunto1.size || !conjunto2.size) return 0;

  let comuns = 0;
  for (const palavra of conjunto1) {
    if (conjunto2.has(palavra)) comuns++;
  }

  const dice = (2 * comuns) / (conjunto1.size + conjunto2.size);
  const maior = Math.max(normalizado1.length, normalizado2.length);
  const menor = Math.min(normalizado1.length, normalizado2.length);
  const proporcaoTamanho = maior ? menor / maior : 0;

  return dice * 0.9 + proporcaoTamanho * 0.1;
}

function juntarBlocos(blocos, inicio, quantidade) {
  return blocos.slice(inicio, inicio + quantidade).join("\n\n");
}

function adicionarComparacao(a, b) {
  comparacoes.push({
    a: a || "",
    b: b || "",
    escolha: null,
    textoFinal: ""
  });
}

function criarComparacoes() {
  comparacoes = [];

  let indiceA = 0;
  let indiceB = 0;

  const LIMITE_BUSCA = 6;
  const LIMIAR_REENCONTRO = 0.24;
  const VANTAGEM_MINIMA = 0.08;

  while (indiceA < blocosA.length || indiceB < blocosB.length) {
    if (indiceA >= blocosA.length) {
      adicionarComparacao("", blocosB[indiceB]);
      indiceB++;
      continue;
    }

    if (indiceB >= blocosB.length) {
      adicionarComparacao(blocosA[indiceA], "");
      indiceA++;
      continue;
    }

    const atualA = blocosA[indiceA];
    const atualB = blocosB[indiceB];
    const similaridadeAtual = similaridadeTexto(atualA, atualB);

    let melhorAgrupamentoB = { quantidade: 1, similaridade: similaridadeAtual };
    for (let quantidade = 2; quantidade <= 3; quantidade++) {
      if (indiceB + quantidade > blocosB.length) break;

      const score = similaridadeTexto(
        atualA,
        juntarBlocos(blocosB, indiceB, quantidade)
      );

      if (score > melhorAgrupamentoB.similaridade) {
        melhorAgrupamentoB = { quantidade, similaridade: score };
      }
    }

    let melhorAgrupamentoA = { quantidade: 1, similaridade: similaridadeAtual };
    for (let quantidade = 2; quantidade <= 3; quantidade++) {
      if (indiceA + quantidade > blocosA.length) break;

      const score = similaridadeTexto(
        juntarBlocos(blocosA, indiceA, quantidade),
        atualB
      );

      if (score > melhorAgrupamentoA.similaridade) {
        melhorAgrupamentoA = { quantidade, similaridade: score };
      }
    }

    const usarAgrupamentoB =
      melhorAgrupamentoB.quantidade > 1 &&
      melhorAgrupamentoB.similaridade >= 0.28 &&
      melhorAgrupamentoB.similaridade > similaridadeAtual + 0.1;

    const usarAgrupamentoA =
      melhorAgrupamentoA.quantidade > 1 &&
      melhorAgrupamentoA.similaridade >= 0.28 &&
      melhorAgrupamentoA.similaridade > similaridadeAtual + 0.1;

    if (usarAgrupamentoA || usarAgrupamentoB) {
      if (
        usarAgrupamentoB &&
        (!usarAgrupamentoA ||
          melhorAgrupamentoB.similaridade >= melhorAgrupamentoA.similaridade)
      ) {
        adicionarComparacao(
          atualA,
          juntarBlocos(blocosB, indiceB, melhorAgrupamentoB.quantidade)
        );
        indiceA++;
        indiceB += melhorAgrupamentoB.quantidade;
        continue;
      }

      adicionarComparacao(
        juntarBlocos(blocosA, indiceA, melhorAgrupamentoA.quantidade),
        atualB
      );
      indiceA += melhorAgrupamentoA.quantidade;
      indiceB++;
      continue;
    }

    let melhorSaltoB = { distancia: 0, similaridade: similaridadeAtual };
    for (let distancia = 1; distancia <= LIMITE_BUSCA; distancia++) {
      const alvoB = indiceB + distancia;
      if (alvoB >= blocosB.length) break;

      const score = similaridadeTexto(atualA, blocosB[alvoB]);
      if (score > melhorSaltoB.similaridade) {
        melhorSaltoB = { distancia, similaridade: score };
      }
    }

    let melhorSaltoA = { distancia: 0, similaridade: similaridadeAtual };
    for (let distancia = 1; distancia <= LIMITE_BUSCA; distancia++) {
      const alvoA = indiceA + distancia;
      if (alvoA >= blocosA.length) break;

      const score = similaridadeTexto(blocosA[alvoA], atualB);
      if (score > melhorSaltoA.similaridade) {
        melhorSaltoA = { distancia, similaridade: score };
      }
    }

    const saltoBValido =
      melhorSaltoB.distancia > 0 &&
      melhorSaltoB.similaridade >= LIMIAR_REENCONTRO &&
      melhorSaltoB.similaridade >= similaridadeAtual + VANTAGEM_MINIMA;

    const saltoAValido =
      melhorSaltoA.distancia > 0 &&
      melhorSaltoA.similaridade >= LIMIAR_REENCONTRO &&
      melhorSaltoA.similaridade >= similaridadeAtual + VANTAGEM_MINIMA;

    if (
      saltoBValido &&
      (!saltoAValido || melhorSaltoB.similaridade > melhorSaltoA.similaridade)
    ) {
      for (let i = 0; i < melhorSaltoB.distancia; i++) {
        adicionarComparacao("", blocosB[indiceB]);
        indiceB++;
      }
      continue;
    }

    if (saltoAValido) {
      for (let i = 0; i < melhorSaltoA.distancia; i++) {
        adicionarComparacao(blocosA[indiceA], "");
        indiceA++;
      }
      continue;
    }

    adicionarComparacao(atualA, atualB);
    indiceA++;
    indiceB++;
  }
}

function atualizarTela() {
  if (!comparacoes.length) return;

  const trecho = comparacoes[indiceAtual];

  textoAElemento.textContent = trecho.a || "[Sem trecho correspondente]";
  textoBElemento.textContent = trecho.b || "[Sem trecho correspondente]";

  contador.textContent = `Trecho ${indiceAtual + 1} de ${comparacoes.length}`;
  progresso.style.width = `${((indiceAtual + 1) / comparacoes.length) * 100}%`;

  anterior.disabled = indiceAtual === 0;
  proximo.textContent = indiceAtual === comparacoes.length - 1 ? "Fim" : "Próximo →";

  removerSelecoesVisuais();

  if (trecho.escolha === "a") cardA.classList.add("selecionado");
  if (trecho.escolha === "b") cardB.classList.add("selecionado");
  if (trecho.escolha === "ambos") usarAmbos.classList.add("selecionado");
  if (trecho.escolha === "ignorar") ignorarTrecho.classList.add("selecionado");

  if (trecho.escolha === "editar") {
    editarTrecho.classList.add("selecionado");
    editorArea.classList.remove("escondido");
    editorTexto.value = trecho.textoFinal;
  } else {
    editorArea.classList.add("escondido");
  }

  atualizarTextoC();
}

function removerSelecoesVisuais() {
  cardA.classList.remove("selecionado");
  cardB.classList.remove("selecionado");
  usarAmbos.classList.remove("selecionado");
  editarTrecho.classList.remove("selecionado");
  ignorarTrecho.classList.remove("selecionado");
}

usarA.addEventListener("click", () => {
  const trecho = comparacoes[indiceAtual];
  trecho.escolha = "a";
  trecho.textoFinal = trecho.a;
  atualizarTela();
});

usarB.addEventListener("click", () => {
  const trecho = comparacoes[indiceAtual];
  trecho.escolha = "b";
  trecho.textoFinal = trecho.b;
  atualizarTela();
});

usarAmbos.addEventListener("click", () => {
  const trecho = comparacoes[indiceAtual];
  trecho.escolha = "ambos";
  trecho.textoFinal = [trecho.a, trecho.b].filter(Boolean).join("\n\n");
  atualizarTela();
});

ignorarTrecho.addEventListener("click", () => {
  const trecho = comparacoes[indiceAtual];
  trecho.escolha = "ignorar";
  trecho.textoFinal = "";
  atualizarTela();
});

editarTrecho.addEventListener("click", () => {
  const trecho = comparacoes[indiceAtual];

  if (trecho.escolha !== "editar") {
    editorTexto.value = trecho.textoFinal || trecho.a || trecho.b || "";
  }

  trecho.escolha = "editar";
  removerSelecoesVisuais();
  editarTrecho.classList.add("selecionado");
  editorArea.classList.remove("escondido");
  editorTexto.focus();
});

salvarEdicao.addEventListener("click", () => {
  const trecho = comparacoes[indiceAtual];
  trecho.escolha = "editar";
  trecho.textoFinal = editorTexto.value.trim();
  atualizarTela();
});

anterior.addEventListener("click", () => {
  if (indiceAtual <= 0) return;
  indiceAtual--;
  atualizarTela();
  rolarParaComparacao();
});

proximo.addEventListener("click", () => {
  if (indiceAtual < comparacoes.length - 1) {
    indiceAtual++;
    atualizarTela();
    rolarParaComparacao();
    return;
  }

  document.querySelector(".resultado").scrollIntoView({ behavior: "smooth" });
});

function rolarParaComparacao() {
  contador.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function atualizarTextoC() {
  const textosEscolhidos = comparacoes
    .filter((item) => item.escolha && item.escolha !== "ignorar" && item.textoFinal)
    .map((item) => item.textoFinal.trim());

  textoC.value = textosEscolhidos.join("\n\n");

  const quantidade = comparacoes.filter((item) => item.escolha !== null).length;
  quantidadeEscolhida.textContent = `${quantidade} de ${comparacoes.length} trechos decididos`;
}

baixarTxt.addEventListener("click", () => {
  const conteudo = textoC.value.trim();

  if (!conteudo) {
    alert("O Texto C ainda está vazio.");
    return;
  }

  const blob = new Blob([conteudo], {
    type: "text/plain;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "Texto-C.txt";

  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});

botaoReiniciar.addEventListener("click", () => {
  const confirmar = confirm("Isso apagará todas as escolhas feitas. Deseja continuar?");
  if (!confirmar) return;

  comparacoes = [];
  blocosA = [];
  blocosB = [];
  indiceAtual = 0;

  textoC.value = "";
  quantidadeEscolhida.textContent = "0 trechos escolhidos";
  editorTexto.value = "";
  editorArea.classList.add("escondido");
  comparador.classList.add("escondido");
});
