'use strict';

bombeiros.filter('filtroMensagens', function($filter, mensagens) {
   return function(parametro, tipoMensagem) {
      return mensagens[tipoMensagem](parametro);
   }
});

bombeiros.filter('tamanhoArquivo', function($filter) {
   return function(input) {
      var tamanho = input + 'B';

      if(input > 1000)
         tamanho = $filter('number')(input / 1024, 1) + 'KB';
      if(input > 1000000)
         tamanho = $filter('number')(input / (1024 * 1024), 1) + 'MB';
      if(input > 1080000000)
         tamanho = $filter('number')(input / (1024 * 1024 * 1024), 1) + 'GB';

      return tamanho;
   }
});