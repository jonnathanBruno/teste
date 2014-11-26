'use strict';

function EquipamentoController($rootScope, $scope, ListaChecagemService, rota) {
	ListaChecagemService.getItensChecagem(rota.parametros.idVistoria, rota.parametros.idEquipamento, function(itensChecagem){
		$scope.$apply(function() {
			$scope.itensChecagem = itensChecagem;
		});
	});

	$rootScope.secao = rota.parametros.equipamento;
	$scope.paginaItemChecagem = rota.paginaItemChecagem;
}