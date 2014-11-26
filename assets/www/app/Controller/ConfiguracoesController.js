'use strict';

function ConfiguracoesController($rootScope, $scope, EnderecoHost) {
	$rootScope.secao = "Configuracoes";
	$scope.endereco = EnderecoHost.get();
	var enderecoCopia = angular.copy($scope.endereco);

	$scope.salvar = function() {
		EnderecoHost.set($scope.endereco);

		$rootScope.voltar();
	}

	$scope.cancelar = function() {
		$scope.endereco = enderecoCopia;

		$rootScope.voltar();
	}

	$scope.temModificacao = function() {
		return enderecoCopia != $scope.endereco;
	}
}