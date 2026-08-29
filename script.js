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
========================================
ARQUIVOS
========================================
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

  botaoComecar.disabled =
    !(arquivoA && arquivoB);

}


/*
========================================
COMEÇAR
========================================
*/

botaoComecar.addEventListener("click", async () => {

  if (!arquivoA || !arquivoB) {
    return;
  }

  try {

    const conteudoA =
      await lerArquivo(arquivoA);

    const conteudoB =
      await lerArquivo(arquivoB);


    blocosA =
      dividirEmBlocos(conteudoA);

    blocosB =
      dividirEmBlocos(conteudoB);


    criarComparacoes();


    if (!comparacoes.length) {

      alert(
        "Não foi encontrado nenhum texto para comparar."
      );

      return;

    }


    indiceAtual = 0;

    comparador.classList.remove(
      "escondido"
    );

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


/*
========================================
LEITURA
========================================
*/

function lerArquivo(arquivo) {

  return new Promise(
    (resolve, reject) => {

      const leitor =
        new FileReader();


      leitor.onload = () => {

        resolve(
          leitor.result
        );

      };


      leitor.onerror = () => {

        reject(
          leitor.error
        );

      };


      leitor.readAsText(
        arquivo,
        "UTF-8"
      );

    }
  );

}


/*
========================================
DIVISÃO EM PARÁGRAFOS
========================================
*/

function dividirEmBlocos(texto) {

  const textoNormalizado =
    texto
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .trim();


  if (!textoNormalizado) {
    return [];
  }


  return textoNormalizado
    .split(/\n\s*\n+/)
    .map(
      bloco => bloco.trim()
    )
    .filter(Boolean);

}


/*
========================================
NORMALIZAÇÃO PARA COMPARAÇÃO
========================================
*/

function normalizarParaComparacao(texto) {

  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /[^\p{L}\p{N}\s]/gu,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


/*
Palavras muito comuns que atrapalham
na hora de calcular semelhança.
*/

const palavrasIgnoradas =
  new Set([
    "a",
    "o",
    "as",
    "os",

    "um",
    "uma",
    "uns",
    "umas",

    "de",
    "da",
    "do",
    "das",
    "dos",

    "e",
    "ou",

    "em",
    "no",
    "na",
    "nos",
    "nas",

    "para",
    "por",
    "com",
    "sem",

    "que",
    "se",

    "ele",
    "ela",
    "eles",
    "elas",

    "eu",
    "tu",
    "voce",
    "voces",

    "me",
    "te",
    "lhe",
    "lhes",

    "meu",
    "minha",
    "meus",
    "minhas",

    "seu",
    "sua",
    "seus",
    "suas",

    "mais",
    "menos",

    "ja",
    "ainda",

    "como",
    "quando",
    "onde",

    "foi",
    "era",
    "ser",
    "estar",

    "tem",
    "tinha"
  ]);


/*
========================================
PALAVRAS RELEVANTES
========================================
*/

function obterPalavrasRelevantes(texto) {

  const normalizado =
    normalizarParaComparacao(texto);


  if (!normalizado) {
    return [];
  }


  return normalizado
    .split(" ")
    .filter(palavra => {

      if (!palavra) {
        return false;
      }


      if (
        palavrasIgnoradas.has(
          palavra
        )
      ) {

        return false;

      }


      return palavra.length > 1;

    });

}


/*
========================================
SIMILARIDADE
========================================
*/

function similaridadeTexto(
  texto1,
  texto2
) {

  if (
    !texto1 ||
    !texto2
  ) {

    return 0;

  }


  const normalizado1 =
    normalizarParaComparacao(
      texto1
    );

  const normalizado2 =
    normalizarParaComparacao(
      texto2
    );


  if (
    normalizado1 ===
    normalizado2
  ) {

    return 1;

  }


  const palavras1 =
    obterPalavrasRelevantes(
      texto1
    );

  const palavras2 =
    obterPalavrasRelevantes(
      texto2
    );


  if (
    palavras1.length === 0 ||
    palavras2.length === 0
  ) {

    return 0;

  }


  const conjunto1 =
    new Set(
      palavras1
    );

  const conjunto2 =
    new Set(
      palavras2
    );


  let palavrasIguais = 0;


  for (
    const palavra of conjunto1
  ) {

    if (
      conjunto2.has(
        palavra
      )
    ) {

      palavrasIguais++;

    }

  }


  const dice =
    (
      2 *
      palavrasIguais
    ) /
    (
      conjunto1.size +
      conjunto2.size
    );


  const maiorTamanho =
    Math.max(
      normalizado1.length,
      normalizado2.length
    );


  const menorTamanho =
    Math.min(
      normalizado1.length,
      normalizado2.length
    );


  const proporcaoTamanho =
    maiorTamanho > 0
      ? menorTamanho /
        maiorTamanho
      : 0;


  return (
    dice * 0.9 +
    proporcaoTamanho * 0.1
  );

}


/*
========================================
UTILIDADES DO ALINHAMENTO
========================================
*/

function juntarBlocos(
  blocos,
  inicio,
  quantidade
) {

  return blocos
    .slice(
      inicio,
      inicio + quantidade
    )
    .join("\n\n");

}


function adicionarComparacao(
  textoA,
  textoB
) {

  comparacoes.push({

    a:
      textoA || "",

    b:
      textoB || "",

    escolha:
      null,

    textoFinal:
      ""

  });

}


/*
========================================
ALINHAMENTO DOS TEXTOS
========================================
*/

function criarComparacoes() {

  comparacoes = [];


  let indiceA = 0;
  let indiceB = 0;


  /*
  Quantos parágrafos para frente
  ele pode procurar.
  */

  const LIMITE_BUSCA = 6;


  /*
  Similaridade mínima para considerar
  que reencontrou o mesmo trecho.
  */

  const LIMIAR_REENCONTRO = 0.24;


  /*
  A comparação futura precisa ser
  claramente melhor que a atual.
  */

  const VANTAGEM_MINIMA = 0.08;


  while (
    indiceA < blocosA.length ||
    indiceB < blocosB.length
  ) {


    /*
    ================================
    A ACABOU
    ================================
    */

    if (
      indiceA >=
      blocosA.length
    ) {

      adicionarComparacao(
        "",
        blocosB[indiceB]
      );

      indiceB++;

      continue;

    }


    /*
    ================================
    B ACABOU
    ================================
    */

    if (
      indiceB >=
      blocosB.length
    ) {

      adicionarComparacao(
        blocosA[indiceA],
        ""
      );

      indiceA++;

      continue;

    }


    const atualA =
      blocosA[indiceA];

    const atualB =
      blocosB[indiceB];


    const similaridadeAtual =
      similaridadeTexto(
        atualA,
        atualB
      );


    /*
    ================================
    TESTAR 1 A ↔ VÁRIOS B
    ================================
    */

    let melhorDivisaoB = {

      quantidade:
        1,

      similaridade:
        similaridadeAtual

    };


    for (
      let quantidade = 2;
      quantidade <= 3;
      quantidade++
    ) {

      if (
        indiceB + quantidade >
        blocosB.length
      ) {

        break;

      }


      const combinadoB =
        juntarBlocos(
          blocosB,
          indiceB,
          quantidade
        );


      const score =
        similaridadeTexto(
          atualA,
          combinadoB
        );


      if (
        score >
        melhorDivisaoB.similaridade
      ) {

        melhorDivisaoB = {

          quantidade,

          similaridade:
            score

        };

      }

    }


    /*
    ================================
    TESTAR VÁRIOS A ↔ 1 B
    ================================
    */

    let melhorDivisaoA = {

      quantidade:
        1,

      similaridade:
        similaridadeAtual

    };


    for (
      let quantidade = 2;
      quantidade <= 3;
      quantidade++
    ) {

      if (
        indiceA + quantidade >
        blocosA.length
      ) {

        break;

      }


      const combinadoA =
        juntarBlocos(
          blocosA,
          indiceA,
          quantidade
        );


      const score =
        similaridadeTexto(
          combinadoA,
          atualB
        );


      if (
        score >
        melhorDivisaoA.similaridade
      ) {

        melhorDivisaoA = {

          quantidade,

          similaridade:
            score

        };

      }

    }


    /*
    Só junta vários parágrafos
    quando a melhoria for relevante.
    */

    const usarDivisaoB =
      melhorDivisaoB.quantidade > 1 &&
      melhorDivisaoB.similaridade >= 0.28 &&
      melhorDivisaoB.similaridade >
        similaridadeAtual + 0.1;


    const usarDivisaoA =
      melhorDivisaoA.quantidade > 1 &&
      melhorDivisaoA.similaridade >= 0.28 &&
      melhorDivisaoA.similaridade >
        similaridadeAtual + 0.1;


    if (
      usarDivisaoA ||
      usarDivisaoB
    ) {


      /*
      B tem vários parágrafos
      correspondendo a um do A.
      */

      if (
        usarDivisaoB &&
        (
          !usarDivisaoA ||
          melhorDivisaoB.similaridade >=
          melhorDivisaoA.similaridade
        )
      ) {

        const combinadoB =
          juntarBlocos(
            blocosB,
            indiceB,
            melhorDivisaoB.quantidade
          );


        adicionarComparacao(
          atualA,
          combinadoB
        );


        indiceA++;


        indiceB +=
          melhorDivisaoB.quantidade;


        continue;

      }


      /*
      A tem vários parágrafos
      correspondendo a um do B.
      */

      const combinadoA =
        juntarBlocos(
          blocosA,
          indiceA,
          melhorDivisaoA.quantidade
        );


      adicionarComparacao(
        combinadoA,
        atualB
      );


      indiceA +=
        melhorDivisaoA.quantidade;


      indiceB++;


      continue;

    }


    /*
    ================================
    PROCURAR A MAIS PARA FRENTE EM B
    ================================
    */

    let melhorSaltoB = {

      distancia:
        0,

      similaridade:
        similaridadeAtual

    };


    for (
      let distancia = 1;
      distancia <= LIMITE_BUSCA;
      distancia++
    ) {

      const novoIndiceB =
        indiceB + distancia;


      if (
        novoIndiceB >=
        blocosB.length
      ) {

        break;

      }


      const score =
        similaridadeTexto(
          atualA,
          blocosB[novoIndiceB]
        );


      if (
        score >
        melhorSaltoB.similaridade
      ) {

        melhorSaltoB = {

          distancia,

          similaridade:
            score

        };

      }

    }


    /*
    ================================
    PROCURAR B MAIS PARA FRENTE EM A
    ================================
    */

    let melhorSaltoA = {

      distancia:
        0,

      similaridade:
        similaridadeAtual

    };


    for (
      let distancia = 1;
      distancia <= LIMITE_BUSCA;
      distancia++
    ) {

      const novoIndiceA =
        indiceA + distancia;


      if (
        novoIndiceA >=
        blocosA.length
      ) {

        break;

      }


      const score =
        similaridadeTexto(
          blocosA[novoIndiceA],
          atualB
        );


      if (
        score >
        melhorSaltoA.similaridade
      ) {

        melhorSaltoA = {

          distancia,

          similaridade:
            score

        };

      }

    }


    const saltoBValido =
      melhorSaltoB.distancia > 0 &&
      melhorSaltoB.similaridade >=
        LIMIAR_REENCONTRO &&
      melhorSaltoB.similaridade >=
        similaridadeAtual +
        VANTAGEM_MINIMA;


    const saltoAValido =
      melhorSaltoA.distancia > 0 &&
      melhorSaltoA.similaridade >=
        LIMIAR_REENCONTRO &&
      melhorSaltoA.similaridade >=
        similaridadeAtual +
        VANTAGEM_MINIMA;


    /*
    ================================
    B POSSUI PARÁGRAFOS EXTRAS
    ================================
    */

    if (
      saltoBValido &&
      (
        !saltoAValido ||
        melhorSaltoB.similaridade >
        melhorSaltoA.similaridade
      )
    ) {

      for (
        let i = 0;
        i < melhorSaltoB.distancia;
        i++
      ) {

        adicionarComparacao(
          "",
          blocosB[indiceB]
        );


        indiceB++;

      }


      continue;

    }


    /*
    ================================
    A POSSUI PARÁGRAFOS EXTRAS
    ================================
    */

    if (
      saltoAValido
    ) {

      for (
        let i = 0;
        i < melhorSaltoA.distancia;
        i++
      ) {

        adicionarComparacao(
          blocosA[indiceA],
          ""
        );


        indiceA++;

      }


      continue;

    }


    /*
    ================================
    COMPARAÇÃO NORMAL
    ================================
    */

    adicionarComparacao(
      atualA,
      atualB
    );


    indiceA++;
    indiceB++;

  }

}


/*
========================================
ATUALIZAR INTERFACE
========================================
*/

function atualizarTela() {

  if (!comparacoes.length) {
    return;
  }


  const trecho =
    comparacoes[indiceAtual];


  textoAElemento.textContent =
    trecho.a ||
    "[Sem trecho correspondente]";


  textoBElemento.textContent =
    trecho.b ||
    "[Sem trecho correspondente]";


  contador.textContent =
    `Trecho ${indiceAtual + 1} de ${comparacoes.length}`;


  const porcentagem =
    (
      (indiceAtual + 1) /
      comparacoes.length
    ) * 100;


  progresso.style.width =
    `${porcentagem}%`;


  anterior.disabled =
    indiceAtual === 0;


  proximo.textContent =
    indiceAtual ===
    comparacoes.length - 1
      ? "Fim"
      : "Próximo →";


  removerSelecoesVisuais();


  if (
    trecho.escolha === "a"
  ) {

    cardA.classList.add(
      "selecionado"
    );

  }


  if (
    trecho.escolha === "b"
  ) {

    cardB.classList.add(
      "selecionado"
    );

  }


  if (
    trecho.escolha === "ambos"
  ) {

    usarAmbos.classList.add(
      "selecionado"
    );

  }


  if (
    trecho.escolha === "ignorar"
  ) {

    ignorarTrecho.classList.add(
      "selecionado"
    );

  }


  if (
    trecho.escolha === "editar"
  ) {

    editarTrecho.classList.add(
      "selecionado"
    );


    editorArea.classList.remove(
      "escondido"
    );


    editorTexto.value =
      trecho.textoFinal;

  } else {

    editorArea.classList.add(
      "escondido"
    );

  }


  atualizarTextoC();

}


/*
========================================
REMOVER MARCAÇÕES
========================================
*/

function removerSelecoesVisuais() {

  cardA.classList.remove(
    "selecionado"
  );

  cardB.classList.remove(
    "selecionado"
  );


  usarAmbos.classList.remove(
    "selecionado"
  );

  editarTrecho.classList.remove(
    "selecionado"
  );

  ignorarTrecho.classList.remove(
    "selecionado"
  );

}


/*
========================================
ESCOLHER A
========================================
*/

usarA.addEventListener("click", () => {

  const trecho =
    comparacoes[indiceAtual];


  trecho.escolha =
    "a";


  trecho.textoFinal =
    trecho.a;


  atualizarTela();

});


/*
========================================
ESCOLHER B
========================================
*/

usarB.addEventListener("click", () => {

  const trecho =
    comparacoes[indiceAtual];


  trecho.escolha =
    "b";


  trecho.textoFinal =
    trecho.b;


  atualizarTela();

});


/*
========================================
ESCOLHER AMBOS
========================================
*/

usarAmbos.addEventListener("click", () => {

  const trecho =
    comparacoes[indiceAtual];


  trecho.escolha =
    "ambos";


  const partes = [];


  if (trecho.a) {

    partes.push(
      trecho.a
    );

  }


  if (trecho.b) {

    partes.push(
      trecho.b
    );

  }


  trecho.textoFinal =
    partes.join("\n\n");


  atualizarTela();

});


/*
========================================
IGNORAR
========================================
*/

ignorarTrecho.addEventListener("click", () => {

  const trecho =
    comparacoes[indiceAtual];


  trecho.escolha =
    "ignorar";


  trecho.textoFinal =
    "";


  atualizarTela();

});


/*
========================================
EDITAR
========================================
*/

editarTrecho.addEventListener("click", () => {

  const trecho =
    comparacoes[indiceAtual];


  if (
    trecho.escolha !== "editar"
  ) {

    let textoInicial = "";


    if (
      trecho.textoFinal
    ) {

      textoInicial =
        trecho.textoFinal;

    } else if (
      trecho.a
    ) {

      textoInicial =
        trecho.a;

    } else {

      textoInicial =
        trecho.b;

    }


    editorTexto.value =
      textoInicial;

  }


  trecho.escolha =
    "editar";


  removerSelecoesVisuais();


  editarTrecho.classList.add(
    "selecionado"
  );


  editorArea.classList.remove(
    "escondido"
  );


  editorTexto.focus();

});


/*
========================================
SALVAR EDIÇÃO
========================================
*/

salvarEdicao.addEventListener("click", () => {

  const trecho =
    comparacoes[indiceAtual];


  trecho.escolha =
    "editar";


  trecho.textoFinal =
    editorTexto.value.trim();


  atualizarTela();

});


/*
========================================
ANTERIOR
========================================
*/

anterior.addEventListener("click", () => {

  if (
    indiceAtual <= 0
  ) {

    return;

  }


  indiceAtual--;


  atualizarTela();


  rolarParaComparacao();

});


/*
========================================
PRÓXIMO
========================================
*/

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
    .querySelector(
      ".resultado"
    )
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


/*
========================================
TEXTO C
========================================
*/

function atualizarTextoC() {

  const textosEscolhidos =
    comparacoes
      .filter(
        item =>
          item.escolha &&
          item.escolha !== "ignorar" &&
          item.textoFinal
      )
      .map(
        item =>
          item.textoFinal.trim()
      );


  textoC.value =
    textosEscolhidos.join(
      "\n\n"
    );


  const quantidade =
    comparacoes.filter(
      item =>
        item.escolha !== null
    ).length;


  quantidadeEscolhida.textContent =
    `${quantidade} de ${comparacoes.length} trechos decididos`;

}


/*
========================================
BAIXAR TXT
========================================
*/

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
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    url;


  link.download =
    "Texto-C.txt";


  document.body.appendChild(
    link
  );


  link.click();


  link.remove();


  URL.revokeObjectURL(
    url
  );

});


/*
========================================
REINICIAR
========================================
*/

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


  textoC.value =
    "";


  quantidadeEscolhida.textContent =
    "0 trechos escolhidos";


  editorTexto.value =
    "";


  editorArea.classList.add(
    "escondido"
  );


  comparador.classList.add(
    "escondido"
  );

});
