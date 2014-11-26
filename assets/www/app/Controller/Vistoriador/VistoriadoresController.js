'use strict';

function VistoriadoresController($rootScope, $scope, VistoriadorService, rota) {
	$rootScope.secao = 'Vistoriadores';
	$scope.vistoriadores = [];
	getVistoriadores();

	$scope.iniciarVistoria = function(vistoriador){
		$rootScope.vistoriador = vistoriador;

		VistoriadorService.set(vistoriador);
		VistoriadorService.baixarVistorias(function(vistorias) {
			$rootScope.baixando = true;

			if(!vistorias.length)
				vistorias = [vistorias];
			
			$rootScope.vistoriasBaixando = vistorias;
		});

		$rootScope.pastaVistoriador = vistoriador.matricula ? vistoriador.matricula : vistoriador.id;
		$rootScope.botaoDireito = undefined;

		rota.paginaVistorias(vistoriador.id);
	}

	$scope.$on('VistoriadoresAtualizado', function (e, idVistoriador) {
    	getVistoriadores();
    });

	function getVistoriadores(){
		VistoriadorService.getAll(function(vistoriadores) {
			$scope.$apply(function() {
				$scope.vistoriadores = vistoriadores;
			});
		});
	}
}