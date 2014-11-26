'use strict';

function InicioController($rootScope, $scope, VistoriadorService, rota) {
	$rootScope.secao = 'Início';

	$scope.paginaVistoriadores = function(){
		VistoriadorService.baixarVistoriadores();

		rota.paginaVistoriadores();
	}

	$scope.paginaConfiguracoes = rota.paginaConfiguracoes;
	$scope.paginaVistorias = rota.paginaVistorias;
}