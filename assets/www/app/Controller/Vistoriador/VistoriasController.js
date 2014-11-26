'use strict';

function VistoriasController($rootScope, $scope, VistoriaService, rota, mensagens){
	$scope.vistorias = [];
	getVistorias();

	$rootScope.secao = "Vistorias";

	$scope.paginaVistoria = rota.paginaVistoria;

	$scope.$on('eventoVistoriaAtualizada', function (e, idVistoria) {
    	getVistorias(idVistoria);
    });

	$scope.$watch('vistoriasBaixando', function(vistorias) {
		if(vistorias){
			$scope.msgs = {
		        durante  : mensagens.transferencia.baixar.carregando(),
		        sucesso  : mensagens.transferencia.baixar.noFim('vistoria'),
		        sucessos : mensagens.transferencia.baixar.noFim('vistorias'),
		        erro     : 'Erro'
		    };
		    
			$scope.lista = [];

			for (var i = vistorias.length - 1; i >= 0; i--) {
				$scope.lista.push({
					id 			: vistorias[i].processo.id,
					imovelNome 	: vistorias[i].processo.imovel.nome
				});
			}

			$scope.abrirDialogo = true;
			$rootScope.vistoriasBaixando = undefined;
		}
	});
	
	function getVistorias(idVistoria) {
		VistoriaService.getAll($rootScope.vistoriador.id, function(vistorias){
			if(idVistoria) $scope.baixado = {sucesso: true, id: idVistoria};
			
			$scope.$apply(function() {
				$scope.vistorias = $scope.vistorias.concat(vistorias);

				console.log($rootScope.numVistorias);
				if($scope.vistorias.length > 0 && ($rootScope.numVistorias != $scope.vistorias.length || !$rootScope.botaoDireito)){
					$rootScope.numVistorias = $scope.vistorias.length;
					habilitarEnviarVistorias();
				}
			});
		}, idVistoria);
	}

	function habilitarEnviarVistorias(indice){
		$rootScope.botaoDireito = false;

		if(indice == undefined) indice = 0;

		if(indice < $scope.vistorias.length){
			if($scope.vistorias[indice].estado != undefined)
				$rootScope.botaoDireito = true;
			else
				habilitarEnviarVistorias(++indice);
		}
	}
}