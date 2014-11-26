'use strict'

bombeiros.directive('ngTap', function() {
   var isTouchDevice = !!("ontouchstart" in window),
   esperar = false;
  
   return function(scope, element, attrs) {
      if (isTouchDevice) {
         var tapping = false;
      
         element.bind('touchstart', function() { tapping = true; });
         element.bind('touchmove', function() { tapping = false; });
         element.bind('touchend', function() { 
            if(tapping && !element[0].disabled && !esperar){
               var classe = element[0].className;

               if(classe.indexOf('botaoNav') > -1){
                  element[0].className += ' cliqueBarraNav';
                  setTimeout(function(){ element[0].className = element[0].className.replace('cliqueBarraNav', '');}, 200);
               }
               else if(classe.indexOf('clicavel') > -1){
                  element[0].className += ' cliqueLinha';
                  setTimeout(function(){ element[0].className = element[0].className.replace('cliqueLinha', '');}, 200);
               }
               else if(classe.indexOf('link') > -1){
                  element[0].className += ' cliqueLinha';
                  esperar = true;
                  setTimeout(function(){esperar = false;}, 600);
               }
               else if(classe.indexOf('botao') > -1)
                  element[0].style.opacity = '.7';
           
               scope.$apply(attrs.ngTap);
            }
         });
      } 
      else {
         element.bind('click', function() {
            if(!element[0].disabled)
               scope.$apply(attrs.ngTap);
         });
      }
   };
});

bombeiros.directive('ngTextarea', function($rootScope, teclado){
   return {
      restrict : 'AC',
      link     : function(scope, element, attrs){
         var elementosFixos = document.getElementsByClassName('fixo');
         var botaoEdicaoConcluida = criarBotao();

         if(element[0].className.indexOf('ngTextarea') < 1)
            element[0].className += ' ngTextarea';

         element[0].onfocus = focarTextarea;
         element[0].onblur = desfocarTextarea;
         botaoEdicaoConcluida.onclick = element[0].blur();

         scope.$watch('attrs.desfocar', function(desfocar) {
            if(desfocar)
               desfocarTextarea();
         });

         function focarTextarea(){
            for (var i = elementosFixos.length - 1; i >= 0; i--){
               if(elementosFixos[i].className.indexOf('invisivel') < 0)
                  elementosFixos[i].className += ' invisivel';
            }

            // document.body.style.height = (document.getElementsByTagName('section')[0].clientHeight + (document.body.clientHeight / 1.8)) + 'px';
            window.scrollTo(0, element[0].offsetHeight + 70);

            setTimeout(estaTextareFocado, 1000);
         }

         function desfocarTextarea(){
            teclado.fechar();
            document.body.style.height = 'auto';
        
            for (var i = elementosFixos.length - 1; i >= 0; i--)
               elementosFixos[i].className = elementosFixos[i].className.replace('invisivel', '');

            if(attrs.ngBlur)
               scope.$apply(attrs.ngBlur)
         }

         function estaTextareFocado(){
            teclado.estaAberto(function(aberto) {
               if(!aberto)
                 element[0].blur();
               else
                  setTimeout(estaTextareFocado, 300);
            });
         }

         function criarBotao() {
            var botao = document.createElement('input');

            botao.type = 'button';
            botao.id = 'ngTextareaEdicaoConcluida';
            botao.className = 'botao botaoOk';
            botao.name = botao.id;
            botao.value = 'OK';

            if(element[0].nodeName.toLowerCase() == 'textarea')
               botao.className += ' botaoTextarea';
            else
               botao.className += ' botaoInput';

            return element[0].parentElement.insertBefore(botao, element.nextSibling);
         }
      }
   }
});

bombeiros.directive('ngEstadoConexao', function(){
  return {
    restrict: 'CA',
    link: function(scope, element, attrs) {
      setTimeout(function(){
        navigator.onLine ? onLine() : offLine();
      }, 0.1);

      scope.$on('eventoOnLine', onLine);
      scope.$on('eventoOffLine', offLine);
      
      function onLine() { scope.$apply(attrs.ngOnline); }
      function offLine() { scope.$apply(attrs.ngOffline); }
    }
  }
});

bombeiros.directive('dialogo', function($rootScope){
   return {
      restrict    : 'E',
      transclude  : true,
      template    : '<div class="background"></div>' +
                    '<div class="janela">' +
                     '<div class="conteudo" ng-transclude>' +
                     '</div>' +
                    '</div>',
      controller  : function($scope) {
         this.abrir = function() {
            $scope.aberto = true;
         }

         this.fechar = function() {
            $scope.aberto = false;
         }

         this.aberto = function() {
            return $scope.aberto;
         }
      },
      link        : function(scope, element, attrs){
         scope.$watch('aberto', function(aberto){
            if(aberto)
               abrir();
            else
               fechar();
         });

         $rootScope.$on('eventoVoltar', fechar);

         function abrir(){
            element[0].style.height = window.innerHeight + 'px';
            element[0].style.display = 'block';
         }

         function fechar(){
            element[0].style.display = 'none';
         }
      }
   } 
});

bombeiros.directive('dialogoTransferencia', function(){
   return {
      restrict    : 'E',
      transclude  : true,
      require     : '^dialogo',
      templateUrl : 'app/views/tags/dialogoEnviar.html',
      scope       : {
         abrirDialogo      : '=abrir',
         lista             : '=',
         enviado           : '=',
         noFim             : '&',
         msgs              : '='
      },
      link        : function(scope, element, attrs, controller){
         var enviados = [],
         naoEnviados = [];
         scope.enviando = 0;

         scope.$watch('abrirDialogo', function(abrirDialogo){
            if(abrirDialogo)
               controller.abrir();
         });

         scope.$watch('enviado', function(enviado){
            if(enviado){
               if(enviado.sucesso)
                  enviados.push(enviado.id);
               else
                  naoEnviados.push(enviado.id);

               if((enviados.length + naoEnviados.length) == scope.lista.length)
                  setEnviados();
            }
         });

         scope.fechar = function(){
            controller.fechar();
            element.remove();
            scope.noFim();
         }

         scope.estaEnviando = function(idVistoria){
            return !(enviados.indexOf(idVistoria) > -1 || naoEnviados.indexOf(idVistoria) > -1);
         }

         scope.jaEnviado = function(idVistoria){
            return enviados.indexOf(idVistoria) > -1;
         }

         function setEnviados() {
            naoEnviados.length > 0 ? scope.enviando = -1 : scope.enviando = enviados.length;
         }
      }
   }
});

bombeiros.directive('mapa', function(){
  return {
    restrict    : 'C',
    replace     : false,
    transclude  : true,
    link: function(scope, element, attrs) {
      var mapa, marcas = [],
      posicaoInicial = [-5.7947875, -35.19982160000001],
      geocoder = '',
      janelaInformacaoAberta = null;

      carregarMapa();
      // setTimeout(inicializarMapa, 0.1);

      function carregarMapa() {
        var a = document.getElementsByTagName('script');
        if(a.item(a.length - 1).src.indexOf('maps') > 1)
          setTimeout(inicializarMapa, 0.1);
        else{
          var script = document.createElement("script");
          
          script.type = "text/javascript";
          script.src = "http://maps.googleapis.com/maps/api/js?sensor=false&callback=inicializarMapa";
          
          document.body.appendChild(script);
        }
      }

      window.inicializarMapa = inicializarMapa;

      function inicializarMapa() {
        if(attrs.posicaoInicial)
          posicaoInicial = attrs.posicaoInicial;

        geocoder = new google.maps.Geocoder();
        mapa = new google.maps.Map(element[0], {
          zoom: 12,
          panControl: false,
          zoomControl: true,
          scaleControl: false,
          streetViewControl: false,
          overviewMapControl: false,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          center: new google.maps.LatLng(posicaoInicial[0], posicaoInicial[1])
        });

        element[0].style.height = (window.innerHeight - element[0].offsetTop - document.getElementsByTagName('header')[0].offsetHeight) + 'px';
        google.maps.event.trigger(mapa, "resize");

        var marca = scope.$apply(attrs.marca);
        if(marca != undefined){
          if(typeof(marca) == 'object')
            criarMarca(marca.titulo, marca.descricao, marca.posicao, marca.endereco);
          else{
            for (var i = marca.length - 1; i >= 0; i--)
              criarMarca(marca[i].titulo, marca[i].descricao, marca[i].posicao, marca.endereco);
          }
        }
      }

      function criarMarca(titulo, descricao, posicao, endereco){
        if(typeof(posicao) == 'object')
          posicao = new google.maps.LatLng(posicao[0], posicao[1]);

        getEnderecoFormatado(posicao, function(enderecoFormatado, posicao){
          if(enderecoFormatado === 'Não foi possível localizar este endereço' || enderecoFormatado.indexOf('Brasil') < 0){
            getEnderecoFormatado(endereco, function(enderecoFormatado, posicao){
              addMarca(titulo, descricao, posicao, enderecoFormatado)
            });
          }
          else
            addMarca(titulo, descricao, posicao);
        });
      }

      function addMarca(titulo, descricao, posicao, endereco){
        var marca = new google.maps.Marker({
          map       : mapa,
          flat      : true,
          icon      : 'img/predio.ico',
          title     : titulo,
          position  : posicao
        });

        var index = marcas.push({ 
          marca     : marca,
          endereco  : endereco,
          descricao : descricao
        }) - 1;
        
        addMarcaListener(index);
      }

      function addMarcaListener(index) {
        mapa.setCenter(marcas[index].marca.getPosition());

        google.maps.event.addListener(marcas[index].marca, 'click', function() {
          mapa.setZoom(mapa.getZoom() + 1);
          mapa.setCenter(marcas[index].marca.getPosition());
          // abrirJanelaInformacao(index);
        });
      }

      function abrirJanelaInformacao(id){
        var marca = marcas[id].marca;

        getEnderecoFormatado(marca.getPosition(), function(endereco) {

          var conteudo = "<div id='janelaInformacao'>" +
                          "<span id='detalhesMarca'>" +
                            "<h4 class='nomeImovel'>" + marca.getTitle() + "</h4>" +
                            "<p>" + marcas[id].descricao + "</p>" +
                          "</span>" +
                          "<span id='localizacaoMarca'>" +
                            "<p>" + marcas[id].endereco + "</p>" +
                          "</span>" +
                        "</div>";

          fecharJanelaInformacao();

          janelaInformacaoAberta = new google.maps.InfoWindow({
             content: conteudo //$compile(conteudo)(scope)[0]
          });

          scope.$apply(function(){
            janelaInformacaoAberta.open(mapa, marca);
          });

          mapa.setCenter(marca.getPosition());
        });
      }

      function fecharJanelaInformacao(){
        if (janelaInformacaoAberta)
          janelaInformacaoAberta.close();
      }

      function getEnderecoFormatado(posicao, callback){
        geoLocalizacao(posicao, function(resposta) {
          var endereco = "Não foi possível localizar este endereço",
          posicao = new google.maps.LatLng(posicaoInicial[0], posicaoInicial[1]);
          
          if (resposta && resposta.length > 0){
            endereco = resposta[0].formatted_address.substring(0, resposta[0].formatted_address.lastIndexOf(","));
            posicao = resposta[0].geometry.location;
          } 

          callback(endereco, posicao);
        });
      }

      function geoLocalizacao(posicao, callback){
        if(posicao == undefined)
          posicao = new google.maps.LatLng(posicaoInicial[0], posicaoInicial[1]);

        var parametro = { latLng: posicao };

        if(typeof(posicao) != 'object')
          parametro = { address: posicao };

        geocoder.geocode(parametro, function(resposta) {
          callback(resposta);
        });
      }
    }
  }
});