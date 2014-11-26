'use strict';

var bombeiros = angular.module('bombeiros', ['ajoslin.mobile-navigate', 'ngResource']);

bombeiros.config(function($routeProvider) {
  $routeProvider.
      when('/', {
         templateUrl   : 'app/views/Vistoriador/inicio.html',
         controller    : 'InicioController'
      }).
      when('/configuracoes', {
         templateUrl   : 'app/views/configuracoes.html',
         controller    : 'ConfiguracoesController'
      }).
      when('/vistoriadores', {
         templateUrl   : 'app/views/Vistoriador/vistoriadores.html',
         controller    : 'VistoriadoresController'
      }).
      when('/vistoriadores/:idVistoriador/vistorias', {
         templateUrl   : 'app/views/Vistoriador/vistorias.html',
         controller    : 'VistoriasController'
      }).
      when('/vistoriadores/:idVistoriador/enviar', {
         templateUrl   : 'app/views/Vistoriador/enviar.html',
         controller    : 'EnviarController'
      }).
      when('/vistoriadores/:idVistoriador/vistorias/:idVistoria', {
         templateUrl   : 'app/views/Vistoria/vistoria.html',
         controller    : 'VistoriaController',
         resolve       : VistoriaController.resolve
      }).
      when('/vistoriadores/:idVistoriador/vistorias/:idVistoria/imovel', {
         templateUrl   : 'app/views/Vistoria/imovel.html',
         controller    : 'ImovelController'
      }).
      when('/vistoriadores/:idVistoriador/vistorias/:idVistoria/arquivos', {
         templateUrl   : 'app/views/Vistoria/arquivos.html',
         controller    : 'ArquivosController'
      }).
      when('/vistoriadores/:idVistoriador/vistorias/:idVistoria/equipamento/:idEquipamento', {
         templateUrl   : 'app/views/Vistoria/equipamento.html',
         controller    : 'EquipamentoController'
      }).
      when('/vistoriadores/:idVistoriador/vistorias/:idVistoria/equipamento/:idEquipamento/itemChecagem/:idItemChecagem', {
         templateUrl   : 'app/views/Vistoria/itemChecagem.html',
         controller    : 'ItemChecagemController',
         resolve       : ItemChecagemController.resolve
      });
});

bombeiros.run(function($rootScope, $route, $http, $templateCache, VistoriadorService) {
   angular.forEach($route.routes, function(r) {
      if (r.templateUrl)
	     $http.get(r.templateUrl, {cache: $templateCache});
   });
  
   document.addEventListener("deviceready", function(){
      $rootScope.$broadcast('eventoDispositivoPronto');

      document.addEventListener("online", onLine, false);
      document.addEventListener("offline", offLine, false);

      function onLine() { $rootScope.$broadcast('eventoOnLine'); console.log('Online');}
      function offLine() { $rootScope.$broadcast('eventoOffLine'); console.log('Offline');}
   });

   VistoriadorService.get(function(vistoriador) {
      if(vistoriador)
         setVistoriador(vistoriador);
   })

   $rootScope.$on('eventoVistoriadorIniciado', function(e, vistoriador) {
      console.log('[eventoVistoriadorIniciado] lepra?');

      setVistoriador(); 
   });

   function setVistoriador(vistoriador) {
      $rootScope.vistoriador = vistoriador;
      $rootScope.pastaVistoriador = vistoriador.matricula ? vistoriador.matricula : vistoriador.id;
   }
});

bombeiros.service('EnderecoHost', function() {
   var _endereco = 'http://192.168.0.124';

   this.get = function() { return _endereco; }

   this.set = set;
   
   function set(endereco) {
      _endereco = endereco;
      localStorage['enderecoHost'] = endereco;
   }

   (function() {
      if(localStorage['enderecoHost'])
         set(localStorage['enderecoHost']);
   }());
});