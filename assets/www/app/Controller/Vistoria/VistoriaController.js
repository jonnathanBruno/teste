'use strict';

VistoriaController.resolve = {
	Vistoria: function($route, VistoriaService, $q) {
	    var deferred = $q.defer();

	    VistoriaService.set($route.current.params.idVistoria, function(vistoria){
			deferred.resolve(vistoria);
		});

	    return deferred.promise;
  	},
	delay: function($q, $timeout) {
		var delay = $q.defer();
		$timeout(delay.resolve, 300);
		return delay.promise;
	}
}

function VistoriaController($rootScope, $scope, rota, Vistoria) {
	$scope.imovel = Vistoria.imovel;
	$scope.equipamentos = Vistoria.equipamentos;

	$rootScope.secao = "Vistoria";
	$scope.paginaImovel = rota.paginaImovel;
	$scope.paginaEquipamento = rota.paginaEquipamento;
}