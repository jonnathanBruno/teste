'use strict';

function NavbarController($rootScope, $scope, rota, metodosComuns) {
	$scope.paginaAtual = function() {
		if($rootScope.secao == 'Vistorias'){
			$scope.acao = rota.paginaEnviar;
			$scope.acaoPagina = 'Enviar';
		}
		else{
			$scope.acao = rota.paginaArquivos;
			$scope.acaoPagina = 'Arquivos';
		}

		return $scope.acaoPagina;
	}

	$rootScope.voltar = rota.voltar;

	$rootScope.data = metodosComuns.data;
	$rootScope.estadoVistoria = metodosComuns.estadoVistoria;
}