'use strict';

function ImovelController($rootScope, $scope, VistoriaService) {
	$scope.imovel = VistoriaService.get().imovel;
	$scope.marca = {
		'titulo' 	: $scope.imovel.nome.toLowerCase(),
		'posicao' 	: $scope.imovel.nome,
		'endereco' 	: $scope.imovel.logradouro + ', ' + $scope.imovel.bairro + ' ' + $scope.imovel.cidade,
		'descricao' : ''
	};

	$rootScope.secao = "Imovel";
}