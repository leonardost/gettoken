// Copyright � 2009 C�sar Roberto de Souza, Leonardo Sameshima Taba
// ----------------------------------------------------------------


// Classe Gerador
//   Esta classe � respons�vel por realizar a gera��o de c�digo fonte
//     ANSI C equivalente ao programa fornecido em ALG.
//   Apenas programas bem formados ser�o compilados. Qualquer erro
//     encontrado durante qualquer fase de an�lise impedir� a
//     apresenta��o do programa compilado.

function Gerador() {

    // Vari�vel que guardar� o c�digo produzido
    var codigo = "";

    // Nivel de identa��o em que o c�digo se encontra
    var identacao = 0;
    // Tamanho, em n�mero de espa�os, do recuo de identa��o
    var identSize = 4;

    // Lista de vari�veis e lista de tipos, utilizadas na gera��o de
    //   declara��es de vari�veis e par�metros
    var listaVariaveis = undefined;
    var listaTipos = undefined;


    ///////////////////////////////////////////
    // M�todos p�blicos

    // Retorna o c�digo gerado
    this.getCodigo = function () {
        return codigo;
    }


    ///////////////////////////////////////////
    // M�todos privados

    // Insere identa��o na linha atual do c�digo gerado
    function identar() {
        for (var i = 0; i < identacao; i++) {
            for (var j = 0; j < identSize; j++) {
                codigo += " ";
            }
        }
    }

    // Inicia a gera��o do c�digo. Coloca um cabe�alho (nome do programa) e
    //   insere o #include <stdio.h>
    this.genStart = function (cadeia) {
        codigo += "/* programa " + cadeia + " */\n\n";
        codigo += "#include <stdio.h>\n\n";
    }

    // Guarda uma vari�vel e seu tipo em uma lista tempor�ria (utilizada na declara��o de
    //   vari�veis e par�metros)
    this.guardaVariavel = function (cadeia, tipo) {
        if (listaVariaveis == undefined) {
            listaVariaveis = Array();
        }
        if (listaTipos == undefined) {
            listaTipos = Array();
        }

        listaVariaveis.push(cadeia);

        if (tipo != undefined) {
            listaTipos.push(tipo);
        }
    }

    // Gera declara��o de vari�veis ou par�metros
    this.genDeclaracao = function (tipo) {
        identar();
        if (tipo == "inteiro") {
            tipo = "int";
        }
        else if (tipo == "real") {
            tipo = "float";
        }
        codigo += tipo + " ";
        for (v in listaVariaveis) {
            codigo += listaVariaveis[v] + ", ";
        }
        // Retiramos a ultima virgula e espa�o que sobram ao final
        codigo = codigo.substr(0, codigo.length - 2);
        codigo += ";\n";

        listaVariaveis = undefined;
    }

    // Inicia a gera��o de um procedimento
    this.genProcedimento = function (cadeia) {
        codigo += "\n";
        codigo += "void " + cadeia + " (";
    }

    // Gera a declara��o de par�metros de uma fun��o
    this.genParametros = function (tipo) {
        identar();

        if (tipo == "inteiro") {
            tipo = "int";
        }
        else if (tipo == "real") {
            tipo = "float";
        }

        for (v in listaVariaveis) {
            codigo += tipo + " " + listaVariaveis[v] + ", ";
        }
        listaVariaveis = undefined;
    }

    // Finaliza a declara��o de par�metros de uma fun��o
    this.finalizaParametros = function () {
        identar();
        // Retiramos a ultima virgula e espa�o que sobram ao final
        codigo = codigo.substr(0, codigo.length - 2);
        codigo += ") {\n";
        identacao++;
    }

    // Finaliza uma fun��o
/////////////////////////////////////////////////////////////////////////////////////////////////
    // Perceber que � igual ao finalizar bloco
/////////////////////////////////////////////////////////////////////////////////////////////////
    this.finalizarProcedimento = function () {
        identacao--;
        identar();
        codigo += "}\n\n";
    }

    // Inicia a fun��o principal
    this.iniciarMain = function () {
        codigo += "\nint main (int argc, char **argv) {\n\n";
        identacao++;
    }

    // Finaliza a fun��o principal
    this.finalizarMain = function () {
        codigo += "\n";
        identar();
        codigo += "return 0;\n\n";
        identacao--;
        codigo += "}\n";
    }

    // Transforma uma instru��o "le" em uma fun��o "scanf"
    this.iniciarLe = function () {
        identar();
        codigo += "scanf(\"";
    }

    // Finaliza uma fun��o scanf, escrevendo a string de formata��o e os par�metros
    this.finalizarLe = function () {
        for (t in listaTipos) {
            if (listaTipos[t] == "inteiro") {
                codigo += "%d ";
            }
            else if (listaTipos[t] == "real") {
                codigo += "%f ";
            }
        }
        codigo = codigo.substr(0, codigo.length - 1);
        codigo += "\", ";

        for (v in listaVariaveis) {
            codigo += "&" + listaVariaveis[v] + ", ";
        }
        codigo = codigo.substr(0, codigo.length - 2);
        codigo += ");\n";

        listaTipos = undefined;
        listaVariaveis = undefined;
    }

    // Transforma uma instru��o "escreve" em uma fun��o "printf"
    this.iniciarEscreve = function () {
        identar();
        codigo += "printf(\"";
    }

    // Finaliza uma fun��o "printf", escrevendo a string de formata��o e os par�metros
    this.finalizarEscreve = function () {
        for (t in listaTipos) {
            if (listaTipos[t] == "inteiro") {
                codigo += "%d ";
            }
            else if (listaTipos[t] == "real") {
                codigo += "%f ";
            }
        }
        codigo = codigo.substr(0, codigo.length - 1);
        codigo += "\\n\", ";

        for (v in listaVariaveis) {
            codigo += listaVariaveis[v] + ", ";
        }
        codigo = codigo.substr(0, codigo.length - 2);
        codigo += ");\n";

        listaTipos = undefined;
        listaVariaveis = undefined;
    }

    // Transforma uma instru��o "enquanto" em uma instru��o "while"
    this.iniciarEnquanto = function () {
        identar();
        codigo += "while (";
    }

    // Transforma uma instru��o "se" em uma instru��o "if"
    this.iniciarSe = function () {
        identar();
        codigo += "if (";
    }

    // Transforma uma instru��o "senao" em uma instru��o "else"
    this.iniciarSenao = function () {
        identar();
        codigo += "else\n";
    }

    // Insere um identificador no c�digo (pode ser uma atribui��o de vari�vel ou
    //   chamada de fun��o)
    this.genIdentificador = function (cadeia) {
        identar();
        codigo += cadeia;
    }

    // Come�a a inserir um comando de atribui��o ('=')
    this.iniciarAtribuicao = function () {
        codigo += " = ";
    }

    // Finaliza a atribui��o retirando o �ltimo caractere do c�digo, que � um espa�o (vindo da
    // express�o)
    this.finalizarAtribuicao = function () {
        codigo = codigo.substr(0, codigo.length - 1);
        codigo += ";\n";
    }

    // Come�a uma chamada de fun��o
    this.iniciarChamada = function () {
        codigo += "(";
    }

    // Escreve os argumentos de chamadas de fun��o
    this.incluirArgumento = function (cadeia) {
        codigo += cadeia + ", ";
    }

    // Finaliza uma chamada de fun��o, retirando os dois �ltimos caracteres (v�rgula e espa�o)
    this.finalizarChamada = function () {
        codigo = codigo.substr(0, codigo.length - 2);
        codigo += ");\n";
    }

    
    this.iniciarCondicao = function () {

    }

    //
    this.finalizarCondicao = function () {
        codigo = codigo.substr(0, codigo.length - 1);
        codigo += ")\n";
    }

    // Inicia um bloco de comandos, aumentando o n�vel de identa��o
    this.iniciarBloco = function () {
        identar();
        codigo += "{\n";
        identacao++;
    }

    // Finaliza um bloco de comandos, diminuindo o n�vel de identa��o
    this.finalizarBloco = function () {
        identacao--;
        identar();
        codigo += "}\n";
    }

    // As express�es s�o transcritas ipsis litteris no c�digo gerado
    this.expressao = function (cadeia) {
        codigo += cadeia + " ";
    }


}