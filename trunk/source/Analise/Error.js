// Copyright � 2009 C�sar Roberto de Souza, Leonardo Sameshima Taba
// ----------------------------------------------------------------


// A classe Error encompassa erros n�o tokeniz�veis, como por exemplo, 
//   final de arquivo n�o esperado encontrado ou delimitador direito
//   de coment�rio n�o encontrado. Durante a an�lise l�xica, coment�rios
//   s�o simplesmente descartados, assim como espa�os em branco, e n�o
//   constituem tokens.
function Error(mensagem, linha) {

    var msg = mensagem;   // Mensagem do erro identificado
    var lin = linha;      // Linha em que aparece o erro


    this.message = function() {
       return msg;
    }

    this.line = function() {
       return lin;
    }


    this.toString = function() {
        var mensagem = msg;

        if (!msg || msg == "")
            mensagem = "Erro desconhecido";

        return "Erro na linha " + lin + ": " + mensagem;
    }
}
