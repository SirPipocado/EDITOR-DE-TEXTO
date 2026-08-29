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
const quantidadeEscolhida = document.getElementById(
  "quantidadeEscolhida"
);

const baixarTxt = document.getElementById("baixarTxt");


let arquivoA = null;
let arquivoB = null;

let blocosA = [];
let blocosB = [];

let comparacoes = [];

let indiceAtual = 0;


/*
Cada item de comparacoes:

{
  a: "texto do A",
  b: "texto do B",

  escolha: null,
  textoFinal: ""
}

escolha pode ser:

"a"
"b"
"ambos"
"editar"
"ignorar"
*/


arquivoAInput.addEventListener("change", () => {

  arquivoA = arquivoAInput.files[0] || null;

  nomeArquivoA.textContent =
    arquivoA
      ? arquivoA.name
      : "Nenhum arquivo selecionado";

  verificarArquivos();

});


arquivoBInput.addEventListener("change", () => {

  arquivoB = arquivoBInput.files[0] || null;

  nomeArquivoB.textContent =
    arquivoB
      ? arquivoB.name
      : "Nenhum arquivo selecionado";

  verificarArquivos();

});


function verificarArquivos() {

  botaoComecar.disabled = !(arquivoA && arquivoB);

}


botaoComecar.addEventListener("click", async () => {

  if (!arquivoA || !arquivoB) {
    return;
  }

  try {

    const conteudoA = await lerArquivo(arquivoA);
    const conteudoB = await lerArquivo(arquivoB);

    blocosA = dividirEmBlocos(conteudoA);
    blocosB = dividirEmBlocos(conteudoB);

    criarComparacoes();

    indiceAtual = 0;

    comparador.classList.remove("escondido");

    atualizarTela();

    comparador.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  } catch (erro) {

    console.error(erro);

    alert(
      "Não foi possível ler um dos arquivos."
    );

  }

});


function lerArquivo(arquivo) {

  return new Promise((resolve, reject) => {

    const leitor = new FileReader();

    leitor.onload = () => {
      resolve(leitor.result);
    };

    leitor.onerror = () => {
      reject(leitor.error);
    };

    leitor.readAsText(
      arquivo,
      "UTF-8"
    );

  });

}


function dividirEmBlocos(texto) {

  const textoNormalizado = texto
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  if (!textoNormalizado) {
    return [];
  }

  return textoNormalizado
    .split(/\n\s*\n+/)
    .map(bloco => bloco.trim())
    .filter(Boolean);

}


function criarComparacoes() {

  comparacoes = [];

  const quantidade = Math.max(
    blocosA.length,
    blocosB.length
  );

  for (
    let i = 0;
    i < quantidade;
    i++
  ) {

    comparacoes.push({

      a: blocosA[i] || "",
      b: blocosB[i] || "",

      escolha: null,
      textoFinal: ""

    });

  }

}


function atualizarTela() {

  if (!comparacoes.length) {
    return;
  }

  const trecho = comparacoes[indiceAtual];

  textoAElemento.textContent =
    trecho.a || "[Sem trecho correspondente]";

  textoBElemento.textContent =
    trecho.b || "[Sem trecho correspondente]";


  contador.textContent =
    `Trecho ${indiceAtual + 1} de ${comparacoes.length}`;


  const porcentagem =
    ((indiceAtual + 1) / comparacoes.length) * 100;

  progresso.style.width =
    `${porcentagem}%`;


  anterior.disabled =
    indiceAtual === 0;

  proximo.textContent =
    indiceAtual === comparacoes.length - 1
      ? "Fim"
      : "Próximo →";


  removerSelecoesVisuais();


  if (trecho.escolha === "a") {

    cardA.classList.add("selecionado");

  }


  if (trecho.escolha === "b") {

    cardB.classList.add("selecionado");

  }


  if (trecho.escolha === "ambos") {

    usarAmbos.classList.add("selecionado");

  }


  if (trecho.escolha === "ignorar") {

    ignorarTrecho.classList.add("selecionado");

  }


  if (trecho.escolha === "editar") {

    editarTrecho.classList.add("selecionado");

    editorArea.classList.remove("escondido");

    editorTexto.value =
      trecho.textoFinal;

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

  const trecho =
    comparacoes[indiceAtual];

  trecho.escolha = "a";
  trecho.textoFinal = trecho.a;

  atualizarTela();

});


usarB.addEventListener("click", () => {

  const trecho =
    comparacoes[indiceAtual];

  trecho.escolha = "b";
  trecho.textoFinal = trecho.b;

  atualizarTela();

});


usarAmbos.addEventListener("click", () => {

  const trecho =
    comparacoes[indiceAtual];

  trecho.escolha = "ambos";


  const partes = [];

  if (trecho.a) {
    partes.push(trecho.a);
  }

  if (trecho.b) {
    partes.push(trecho.b);
  }


  trecho.textoFinal =
    partes.join("\n\n");

  atualizarTela();

});


ignorarTrecho.addEventListener("click", () => {

  const trecho =
    comparacoes[indiceAtual];

  trecho.escolha = "ignorar";
  trecho.textoFinal = "";

  atualizarTela();

});


editarTrecho.addEventListener("click", () => {

  const trecho =
    comparacoes[indiceAtual];


  if (
    trecho.escolha !== "editar"
  ) {

    let textoInicial = "";

    if (trecho.textoFinal) {

      textoInicial =
        trecho.textoFinal;

    } else if (trecho.a) {

      textoInicial =
        trecho.a;

    } else {

      textoInicial =
        trecho.b;

    }


    editorTexto.value =
      textoInicial;

  }


  trecho.escolha = "editar";

  removerSelecoesVisuais();

  editarTrecho.classList.add(
    "selecionado"
  );

  editorArea.classList.remove(
    "escondido"
  );

  editorTexto.focus();

});


salvarEdicao.addEventListener("click", () => {

  const trecho =
    comparacoes[indiceAtual];

  trecho.escolha = "editar";

  trecho.textoFinal =
    editorTexto.value.trim();

  atualizarTela();

});


anterior.addEventListener("click", () => {

  if (indiceAtual <= 0) {
    return;
  }

  indiceAtual--;

  atualizarTela();

  rolarParaComparacao();

});


proximo.addEventListener("click", () => {

  if (
    indiceAtual <
    comparacoes.length - 1
  ) {

    indiceAtual++;

    atualizarTela();

    rolarParaComparacao();

    return;

  }


  document
    .querySelector(".resultado")
    .scrollIntoView({
      behavior: "smooth"
    });

});


function rolarParaComparacao() {

  contador.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


function atualizarTextoC() {

  const textosEscolhidos =
    comparacoes
      .filter(item =>
        item.escolha &&
        item.escolha !== "ignorar" &&
        item.textoFinal
      )
      .map(item =>
        item.textoFinal.trim()
      );


  textoC.value =
    textosEscolhidos.join(
      "\n\n"
    );


  const quantidade =
    comparacoes.filter(
      item => item.escolha !== null
    ).length;


  quantidadeEscolhida.textContent =
    `${quantidade} de ${comparacoes.length} trechos decididos`;

}


baixarTxt.addEventListener("click", () => {

  const conteudo =
    textoC.value.trim();


  if (!conteudo) {

    alert(
      "O Texto C ainda está vazio."
    );

    return;

  }


  const blob =
    new Blob(
      [conteudo],
      {
        type:
          "text/plain;charset=utf-8"
      }
    );


  const url =
    URL.createObjectURL(blob);


  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    "Texto-C.txt";


  document.body.appendChild(link);

  link.click();

  link.remove();


  URL.revokeObjectURL(url);

});


botaoReiniciar.addEventListener("click", () => {

  const confirmar =
    confirm(
      "Isso apagará todas as escolhas feitas. Deseja continuar?"
    );


  if (!confirmar) {
    return;
  }


  comparacoes = [];
  blocosA = [];
  blocosB = [];

  indiceAtual = 0;

  textoC.value = "";

  comparador.classList.add(
    "escondido"
  );

});
