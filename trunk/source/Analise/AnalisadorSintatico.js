////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Ideias : passar os seguidores dos elementos pais para os elementos filhos.
//          na pior das hipoteses, todo o filho sera consumido
//          e tem que ser vindo do pai mesmo, porque uma funcao pode ser chamada de qualquer outra funcao,
//          e nao de uma funcao especifica apenas
////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Copyright © 2009 César Roberto de Souza, Leonardo Sameshima Taba
// ----------------------------------------------------------------


// Classe Analisador Sintático (Parser)
//  Esta classe é responsável por conduzir a etapa de análise sintática,
//  identificando regras gramaticais respeitadas pelos tokens adquiridos
//  pelo Analisador Léxico.
//
function AnalisadorSintatico(input) {


    // ************************************************************************
    // Variáveis privadas
    // ************************************************************************

    // Analisador Léxico a ser utilizado por este Analisador Sintático (parser)
    var analisadorLexico = new AnalisadorLexico(input);

    // Lista de erros encontrados durante a análise
    var error_list = new Array();


    // Variáveis para armazenar informações sobre o token atual
    var token;     // token atual propriamente dito reconhecido pelo analisador léxico
    var simbolo;   // simbolo (cadeia do token) atual (para simplificar os procedimentos)
    var categoria; // categoria (do token) atual (para simplificar os procedimentos)



    var debug = false;  //   aciona os alerts de tracing



    // ************************************************************************
    // Métodos públicos
    // ************************************************************************

    // Método principal para iniciar a análise sintática
    //   Retorna true caso a análise tenha terminado sem
    //   nenhum erro, e false caso contrário.
    this.parse = function() {
        // Obtem o primeiro simbolo
        obterSimbolo();

        // Inicia a analise a partir da regra inicial
        programa();

        // Verifica se houve erros durante a analise
        //  sintatica e retorna o estado de sucesso
        return (error_list.length == 0)
    }

    // Retorna a lista de erros encontrados
    this.errors = function() {
        return error_list;
    }




    // ************************************************************************
    // Métodos Privados
    // ************************************************************************

    // Obtem o proximo token to analisador léxico e o armazena
    //   nas variáveis privadas token e símbolo, em que token
    //   corresponde ao token propriamente dito e a variável
    //   símbolo corresponde à cadeia presente neste token.
    function obterSimbolo() {
        token = analisadorLexico.getToken();

        if (analisadorLexico.error() != null)
            error_list.push(analisadorLexico.error());

        if (token != null) { // se o token for diferente de null
           simbolo   = token.cadeia();
           categoria = token.id();
        }
        else {
           simbolo   = '';
           categoria = '';
        }
    }


    // Empilha um erro na lista de erros
    function error(mensagem) {
        var error = new Error(mensagem, analisadorLexico.line());
        error_list.push(error);
    }


    // Varre a entrada ate que um simbolo de sincronizacao seja encontrado
    function varre() {

       var conjsinc = join(varre.arguments);

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// Fazer tratamento especial para os simbolos ident, $ (fim de arquivo) e epsilon (vazio)
// quanto ao $, podemos fazer uma gambiarra: coloca-lo no fim da entrada, mas isso nao eh muito legal
///////////////////////////////////////////////////////////////////////////////////////////////////////////
//      if (debug)
      alert("> varre() - simbolo ofensivo = " + simbolo);

      // Varre de acordo com o conjunto de sincronizacao indicado
      while (!
               ((simbolo in conjsinc)                                              ||
               (("@ident"       in conjsinc) && (categoria == TokenId.Identifier)) ||
               (("@numero_real" in conjsinc) && (categoria == TokenId.Real))       ||
               (("@numero_int"  in conjsinc) && (categoria == TokenId.Integer))    ||
               (("$"            in conjsinc) && (token == null)))
            ) {
        obterSimbolo();
        if (debug)
          alert(simbolo);
      }

//      if (debug)
        alert("< varre()");
    }





    // Procedimentos para regras gramaticais
    // *************************************

    // Procedimento para as regras "programa", "corpo" e "dc"
    function programa() {
      if (debug)
        alert("> funcao programa()");

      if (simbolo == "programa") {
        obterSimbolo();
        if (categoria == TokenId.Identifier) {
          obterSimbolo();
          if (simbolo == ";") {
            obterSimbolo();
          }
          else {
            error("Esperado ';' mas encontrado '" + simbolo + "'");
            // sera que aqui deveriamos varrer ate o ';'? ja que ele nao foi encontrado. parece mais logico
            // varrer ate os primeiros de dc_v e dc_p.
            // se deixar deste jeito, declaracoes de variaveis possivelmente vao ser consumidas
            //varre(join(Seguidores["programa"], ";"));

            // pode ser que o programa nao tenha declaracoes de variaveis nem de procedimentos, entao eh
            // bom colocar o "inicio" aqui
            //varre(join(Primeiros["dc_v"], Primeiros["dc_p"], "inicio"));
            varre(Primeiros["dc_v"], Primeiros["dc_p"], "inicio");
          }
        }
        else {
          error("Esperado identificador mas encontrado '" + simbolo + "'");
          varre(Primeiros["dc_v"], Primeiros["dc_p"], "inicio");
        }
      }
      else {
        error("Esperado 'programa' mas encontrado '" + simbolo + "'");
        varre(Primeiros["dc_v"], Primeiros["dc_p"], "inicio");
      }

      dc_v();
      dc_p();

      if (simbolo == "inicio") {
        obterSimbolo();
      }
      else {
///////////////////////////////////////////////////////////////////////////////////////////////////////////
// E se houver algo diferente de inicio, ou se nao houver inicio? certamente nao podemos desconsiderar todo
// o corpo do programa.
///////////////////////////////////////////////////////////////////////////////////////////////////////////
        error("Esperado 'inicio' mas encontrado '" + simbolo + "'");
        varre(Primeiros["comandos"]);
      }

      comandos();

      if (simbolo == "fim") {
        obterSimbolo();
        if (simbolo == ".") {
           obterSimbolo();
        }
        else {
          error("Esperado '.' mas encontrado '" + simbolo + "'");
          varre(Seguidores["programa"]);  // (fim de arquivo)
        }
      }
      else {
        error("Esperado 'fim' mas encontrado '" + simbolo + "'");
        varre(Seguidores["programa"]);
      }


        if (debug)
          alert("< funcao programa()");
    }

    // Procedimento para regra "dc_v" e "tipo_var"
    function dc_v() {
      if (debug)
        alert("> funcao dc_v()");

      while (simbolo == "var") {
        obterSimbolo();
        variaveis();
        if (simbolo == ":") {
          obterSimbolo();
          if (simbolo in { "real":0, "inteiro":0 }) {
            obterSimbolo();
            if (simbolo == ";") {
              obterSimbolo();
            }
            else {
              error("Esperado ';' mas encontrado '" + simbolo + "'");
              varre(Primeiros["dc_v"], Seguidores["dc_v"]);
            }
          }
          else {
            error("Esperado 'real' ou 'inteiro' mas encontrado '" + simbolo + "'");
            varre(Primeiros["dc_v"], Seguidores["dc_v"]);
          }
        }
        else {
          error("Esperado ':' mas encontrado '" + simbolo + "'");
          varre(Primeiros["dc_v"], Seguidores["dc_v"]);
        }
      }

      if (debug)
        alert("< funcao dc_v()");
    }


    // Procedimento para regra "variaveis"
///////////////////////////////////////////////////////////////////////////////////////////////////////////
// Vamos pensar assim: o unico papel desta regra eh determinar os nomes das variaveis. Se aparecer um nome
// invalido, nos nos movemos ate o seguidor de variaveis, que eh ":" ou ")", que serao tratados pela funcao
// pai.
///////////////////////////////////////////////////////////////////////////////////////////////////////////
    function variaveis() {
      if (debug)
        alert("> funcao variaveis()");

      if (categoria == TokenId.Identifier) {
        obterSimbolo();
        if (simbolo == ",") {
          obterSimbolo();
          variaveis();
        }
        // else termina a regra
      }
      else {
        error("Esperado 'identificador' mas encontrado '" + simbolo + "'");
        varre(Seguidores["dc_v"], Seguidores["variaveis"]);
      }

      if (debug)
        alert("< funcao variaveis()");
    }


    // Procedimento para regra "dc_p" e "parametros"
    function dc_p() {
      if (debug)
          alert("> funcao dc_p()");

      while (simbolo == "procedimento") {
        obterSimbolo();
        if (categoria == TokenId.Identifier) {
          obterSimbolo();
          if (simbolo == "(") {
            obterSimbolo();
            lista_par();
            if (simbolo == ")") {
              obterSimbolo();
            }
            else {
///////////////////////////////////////////////////////////////////////////////////////////////////////////
// Imagine se estivesse faltando um ) aqui.
// procedimento p1 ( var a : inteiro ;
// inicio
//   ...
// nao podemos consumir o procedimento todo.
///////////////////////////////////////////////////////////////////////////////////////////////////////////
              error("Esperado ')' mas encontrado '" + simbolo + "'");
              varre(";", Seguidores["dc_p"]);
            }
          }
          if (simbolo == ";") {
            obterSimbolo();
            corpo_p();
          }
          else {
            error("Esperado ';' mas encontrado '" + simbolo + "'");
            varre(Seguidores["dc_p"]);
          }
        }
        else {
          error("Esperado 'identificador' mas encontrado '" + simbolo + "'");
          varre(Seguidores["dc_p"]);
        }
      }

      if (debug)
        alert("< funcao dc_p()");
    }


    // Procedimento para regra "lista_par" e "mais_par"
    function lista_par() {
      if (debug)
        alert("> funcao lista_par()");

      variaveis();
      if (simbolo == ":") {
        obterSimbolo();
        if (simbolo == "real" || simbolo == "inteiro") {
          obterSimbolo();
          if (simbolo == ";") {
            obterSimbolo();
            lista_par();
          }
        }
        else {
          error("Esperado 'inteiro' ou 'real' mas encontrado '" + simbolo + "'");
          varre(Seguidores["lista_par"], Seguidores["dc_p"]);
        }
      }
      else {
        error("Esperado ':' mas encontrado '" + simbolo + "'");
        varre(Seguidores["lista_par"], Seguidores["dc_p"]);
      }

      if (debug)
        alert("< funcao lista_par()");
    }

    // Procedimento para regra "corpo_p" e "dc_loc"
    function corpo_p() {
      if (debug)
        alert("> funcao corpo_p()");

      dc_v();
      if (simbolo == "inicio") {
        obterSimbolo();
        while (simbolo in Primeiros["cmd"]) {
          cmd();
          if (simbolo == ";") {
            obterSimbolo();
          }
          else {
            error("Esperado ';' mas encontrado '" + simbolo + "'");
            varre("fim", Seguidores["dc_p"]);
          }
        }
        if (simbolo == "fim") {
          obterSimbolo();
          if (simbolo == ";") {
            obterSimbolo();
            varre(Seguidores["corpo_p"], Seguidores["dc_p"]);
          }
          else {
            error("Esperado ';' mas encontrado '" + simbolo + "'");
            varre(Seguidores["corpo_p"], Seguidores["dc_p"]);
          }
        }
        else {
          error("Esperado 'fim' mas encontrado '" + simbolo + "'");
          varre(Seguidores["corpo_p"], Seguidores["dc_p"]);
        }
      }
      else {
        error("Esperado 'inicio' mas encontrado '" + simbolo + "'");
        varre(Seguidores["corpo_p"], Seguidores["dc_p"]);
      }

      if (debug)
        alert("< funcao corpo_p()");
    }

    // lista_arg
    function lista_arg() {
      if (debug)
        alert("> funcao lista_arg()");

      if (simbolo == "(") {
        obterSimbolo();
        if (categoria == TokenId.Identifier) {
          obterSimbolo();
          while (simbolo == ";") {
            obterSimbolo();
            if (categoria == TokenId.Identifier) {
              obterSimbolo();
            }
            else {
              error("Esperado identificador mas encontrado '" + simbolo + "'");
              varre(Seguidores["lista_arg"], ")");
            }
          }
          if (simbolo == ")") {
            obterSimbolo();
          }
          else {
            error("Esperado ')' mas encontrado '" + simbolo + "'");
            varre(Seguidores["lista_arg"]);
          }
        }
        else {
          error("Esperado identificador mas encontrado '" + simbolo + "'");
          varre(Seguidores["lista_arg"]);
        }
      }
      else {
        error("Esperado '(' mas encontrado '" + simbolo + "'");
        varre(Seguidores["lista_arg"]);
      }

      if (debug)
        alert("< funcao lista_arg()");
    }

    function comandos() {
      if (debug)
        alert("> funcao comandos()");
/////////////////////////////////////////////////////////////////////////////////////////////////////////
// gambiarra - Primeiros(cmd) contem os identificadores, mas eles são uma categoria e não um nome, por isso
// precisa deste or aqui. Vou pensar em um jeito melhor depois
/////////////////////////////////////////////////////////////////////////////////////////////////////////
      while (simbolo in Primeiros["cmd"] || categoria == TokenId.Identifier) {
        cmd();
        if (simbolo == ";") {
          obterSimbolo();
          comandos();
        }
        else {
          error("Esperado ';' mas encontrado '" + simbolo + "'");
          varre(Primeiros["cmd"], Seguidores["comandos"]);
        }
      }
      if (debug)
        alert("< funcao comandos()");
    }

    function cmd() {
      if (debug)
        alert("> funcao cmd()");

      if (simbolo == "le") {
        obterSimbolo();
        if (simbolo == "(") {
          obterSimbolo();
          variaveis();
          if (simbolo == ")") {
            obterSimbolo();
          }
          else {
            error("Esperado ')' mas encontrado '" + simbolo + "'");
            varre(Seguidores["cmd"]);
          }
        }
        else {
          error("Esperado '(' mas encontrado '" + simbolo + "'");
          varre(Seguidores["cmd"]);
//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Imagine a seguinte situacao:
// le a);
// o que fazer? desconsidera o comando? eh o que acontece aqui
//////////////////////////////////////////////////////////////////////////////////////////////////////////
        }
      }
      else if (simbolo == "escreve") {
        obterSimbolo();
        if (simbolo == "(") {
          obterSimbolo();
          variaveis();
          if (simbolo == ")") {
            obterSimbolo();
          }
          else {
            error("Esperado ')' mas encontrado '" + simbolo + "'");
            varre(Seguidores["cmd"]);
          }
        }
        else {
          error("Esperado '(' mas encontrado '" + simbolo + "'");
          varre(Seguidores["cmd"]);
        }
      }
      else if (simbolo == "enquanto") {
        obterSimbolo();
        condicao();
        if (simbolo == "faca") {
          obterSimbolo();
          cmd();
        }
        else {
          error("Esperado 'faca' mas encontrado '" + simbolo + "'");
          varre(Seguidores["cmd"]);
        }
      }
      else if (simbolo == "se") {
        obterSimbolo();
        condicao();
        if (simbolo == "entao") {
          obterSimbolo();
          cmd();
          cont_se();
        }
        else {
          error("Esperado 'entao' mas encontrado '" + simbolo + "'");
          varre(Seguidores["cmd"]);
        }
      }
      else if (categoria == TokenId.Identifier) {
        obterSimbolo();
        cont_ident();
      }
      else if (simbolo == "inicio") {
        obterSimbolo();
/////////////////////////////////////////////////////////////////////////////////////////////////////////
// gambiarra - Ver observacao acima
/////////////////////////////////////////////////////////////////////////////////////////////////////////
        while (simbolo in Primeiros["cmd"] || categoria == TokenId.Identifier) {
          cmd();
          if (simbolo == ";") {
            obterSimbolo();
          }
          else {
            error("Esperado ';' mas encontrado '" + simbolo + "'");
            varre(Primeiros["cmd"], Seguidores["cmd"]);
          }
        }
        if (simbolo == "fim") {
          obterSimbolo();
        }
        else {
          error("Esperado 'fim' mas encontrado '" + simbolo + "'");
          varre(Seguidores["cmd"]);
        }
      }
      else {
        error("Esperado 'le', 'escreve', 'enquanto', 'se', 'inicio' ou identificador, mas encontrado '" + simbolo + "'");
        varre(Seguidores["cmd"]);
      }

      if (debug)
        alert("< funcao cmd()");
    }

    function cont_se() {
      if (debug)
        alert("> funcao cont_se()");
      if (simbolo == "fim") {
        obterSimbolo();
      }
      else if (simbolo == "senao") {
        obterSimbolo();
        cmd();
      }
      else {
        error("Esperado 'fim' ou 'senao', mas encontrado '" + simbolo + "'");
        varre(Seguidores["cont_se"]);
      }
      if (debug)
        alert("< funcao cont_se()");
    }

    function cont_ident() {
      if (debug)
        alert("> funcao cont_ident()");

      if (simbolo == ":=") {
        obterSimbolo();
        expressao();
      }
      else if (simbolo in Primeiros["lista_arg"]) {
        lista_arg();
      }
      else error("Esperado ':=' ou '(', mas encontrado '" + simbolo + "'");

      if (debug)
        alert("< funcao cont_ident()");
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////
// Precisamos tomar mais cuidado com as regras abaixo
//////////////////////////////////////////////////////////////////////////////////////////////////////

    function condicao() {
      if (debug)
        alert("> funcao condicao()");

      expressao();
      if (simbolo == "=" || simbolo == "<>" || simbolo == ">=" ||
        simbolo == "<=" || simbolo == ">" || simbolo == "<") {
        obterSimbolo();
        expressao();
      }
      else {
        error("Esperado '=', '<>', '>=', '<=', '>' ou '<', mas encontrado '" + simbolo + "'");
        varre(Seguidores["condicao"]);
      }

      if (debug)
        alert("< funcao condicao()");
    }

    function expressao() {
      if (debug)
        alert("> funcao expressao()");

      termo();
      while (simbolo == "+" || simbolo == "-") {
        obterSimbolo();
        termo();
      }

      if (debug)
        alert("< funcao expressao()");
    }

    function termo() {
      if (debug)
        alert("> funcao termo()");

      if (simbolo == "+" || simbolo == "-") {
        obterSimbolo();
      }
      fator();
      while (simbolo == "*" || simbolo == "/") {
        obterSimbolo();
        fator();
      }

      if (debug)
        alert("< funcao termo()");
    }

    function fator() {
      if (debug)
        alert("> funcao fator()");

      if (categoria == TokenId.Identifier) {
        obterSimbolo();
      }
      else if (categoria == TokenId.Integer) {
        obterSimbolo();
      }
      else if (categoria == TokenId.Real) {
        obterSimbolo();
      }
      else if (simbolo == "(") {
        obterSimbolo();
        expressao();
        if (simbolo == ")") {
          obterSimbolo();
        }
        else {
          error("Esperado ')' mas encontrado '" + simbolo + "'");
          varre(Seguidores["fator"]);  // provavelmente seguidores de termos e etc tb
        }
      }
      else {
        error("Esperado '(', identificador, numero inteiro ou numero real, mas encontrado '" + simbolo + "'");
        // seguidores de fator e de termo tb e tal
        varre(";");
///////////////////////////////////////////////////////////////////////////////////////////////////////////
// Teriamos que procurar um identificador, mas temos que mudar a funcao de varredura para poder buscar
// identificadores
// do jeito que esta aqui, a expressao toda eh desconsiderada
// ex: a := _a + b;
// ou a := (a_ + b);
///////////////////////////////////////////////////////////////////////////////////////////////////////////
      }

      if (debug)
        alert("< funcao fator()");
    }




    //  Conjuntos da Linguagem ALG
    //  **************************

    // Conjunto de primeiros
    var Primeiros = {
        "programa"      : { "programa"  :0 },
        "corpo"         : { "var":0 },
        "dc"            : { "var":0 , "ε" : 0 },
        "dc_v"          : { "var":0 , "ε" : 0 },
        "tipo_var"      : { "real":0 , "inteiro" :0 },
        "variaveis"     : { "@ident":0 },
        "mais_var"      : { ",":0, "ε":0 },
        "dc_p"          : { "procedimento":0 , "ε" :0 },
        "parametros"    : { "(":0, "ε":0 },
        "lista_par"     : { "@ident" :0 },
        "mais_par"      : { ";":0 , "ε" :0 },
        "corpo_p"       : { "var":0 },
        "dc_loc"        : { "var":0 , "ε" :0 },
        "lista_arg"     : { "(":0 , "ε" :0 },
        "argumentos"    : { "@ident" :0 },
        "mais_ident"    : { ";":0, "ε" :0 },
        "comandos"      : { "le":0, "escreve":0, "enquanto":0, "se":0, "@ident":0, "inicio":0, "ε":0 },
        "cmd"           : { "le":0, "escreve":0, "enquanto":0, "se":0, "@ident":0, "inicio":0 },
        "cont_se"       : { "fim":0, "senao":0 },
        "cont_ident"    : { ":=":0 , "(":0, "ε":0 },
        "condicao"      : { "+":0 , "-":0 },
        "relacao"       : { "=":0 , "<>":0 , ">=":0 , "<=":0 , ">":0 , "<" :0 },
        "expressao"     : { "+":0 , "-":0 , "ε" :0 },
        "op_un"         : { "+":0 , "-":0 , "ε" :0 },
        "outros_termos" : { "+":0 , "-":0 , "ε" :0 },
        "op_ad"         : { "+":0 , "-":0 },
        "termo"         : { "+":0 , "-":0 },
        "mais_fatores"  : { "*":0 , "/":0 , "ε" :0 },
        "op_mul"        : { "*":0 , "/" :0 },
        "fator"         : { "@ident":0 , "@numero_int":0 , "@numero_real":0 , "(":0 }
    };

    // Conjunto de seguidores
    var Seguidores = {
        "programa"      : { "$":0 },
        "corpo"         : { ".":0 },
        "dc"            : { "inicio":0 },
        "dc_v"          : { "procedimento":0, "inicio":0 },
        "tipo_var"      : { ";":0 },
        "variaveis"     : { ":":0, ")":0 },
        "mais_var"      : { ":":0, ")":0 },
        "dc_p"          : { "inicio":0 },
        "parametros"    : { ";":0 },
        "lista_par"     : { ")":0 },
        "mais_par"      : { ")":0 },
        "corpo_p"       : { "procedimento":0 },
        "dc_loc"        : { "inicio":0 },
        "lista_arg"     : { ";":0, "fim":0, "senao":0 },
        "argumentos"    : { ")":0 },
        "mais_ident"    : { ")":0 },
        "comandos"      : { "fim":0 },
        "cmd"           : { ";":0, "fim":0, "senao":0 },
        "cont_se"       : { ";":0, "fim":0, "senao":0 },
        "cont_ident"    : { ";":0, "fim":0, "senao":0 },
        "condicao"      : { "faca":0, "entao":0 },
        "relacao"       : { "+":0 , "-":0 },
        "expressao"     : { "faca":0, "entao":0, "=":0 , "<>":0 , ">=":0 , "<=":0 , ">":0 , "<" :0, ")":0, ";":0, "fim":0, "senao":0 },
        "op_un"         : { "@ident":0 , "@numero_int":0 , "@numero_real":0 , "(":0 },
        "outros_termos" : { "faca":0, "entao":0, "=":0 , "<>":0 , ">=":0 , "<=":0 , ">":0 , "<" :0, ")":0, ";":0, "fim":0, "senao":0 },
        "op_ad"         : { "+":0 , "-":0 },
        "termo"         : { "+":0 , "-":0 },
        "mais_fatores"  : { "+":0 , "-":0 },
        "op_mul"        : { "@ident":0 , "@numero_int":0 , "@numero_real":0 , "(":0 },
        "fator"         : { "*":0 , "/":0 }
    };

}




/////////////////////////////////////////////////////////////////////////////////////////////////////////
// funcoes auxiliares
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// esta funcao retorna um array associativo que eh a uniao dos arrays ou strings passados como parametros
function join() {
  var list = new Object();
  var argumento;

  for (var i = 0; i < join.arguments[0].length; i++) {
    argumento = join.arguments[0][i];
    if (typeof argumento == "object") {
      for (chave in argumento) {
        list[chave] = 0;
      }
    }
    else if (typeof argumento == "string") {
      list[argumento] = 0;
    }
  }

  return list;
}