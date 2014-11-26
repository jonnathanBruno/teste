'use strict';

function EnviarController($rootScope, $scope, VistoriadorService, mensagens){
	VistoriadorService.getVistorias(function(vistorias){
		$scope.vistorias = [];

		$scope.$apply(function() {
			for (var i = vistorias.length - 1; i >= 0; i--) {
				if(vistorias[i].estado != undefined)
					$scope.vistorias.push(vistorias[i]); 
			}
		});
	});

	$rootScope.secao = "Enviar";

	$scope.vistoriasSelecionadas = [];
	$scope.todos = false;
	$scope.msgs = {
        durante  : mensagens.transferencia.enviar.carregando(),
        sucesso  : mensagens.transferencia.enviar.noFim('vistoria'),
        sucessos : mensagens.transferencia.enviar.noFim('vistorias'),
        erro     : 'Erro'
    };

	$scope.estadoConexao = function(conectado){
		$scope.dispositivoOnLine = conectado;
	}

	$scope.$watch('vistoriasSelecionadas.length', function(selecionadas){
		if($scope.vistorias && selecionadas == $scope.vistorias.length)
			$scope.todos = true;
		else
			$scope.todos = false;
	});

	$scope.selecionar = function(indiceVistoria){
		if(selecionado(indiceVistoria))
			$scope.vistoriasSelecionadas.splice($scope.vistoriasSelecionadas.indexOf($scope.vistorias[indiceVistoria]), 1);
		else
			$scope.vistoriasSelecionadas.push($scope.vistorias[indiceVistoria]);
	}

	$scope.selecionarTodos = function(){
		$scope.vistoriasSelecionadas = [];

		if(!$scope.todos){
			for (var i = $scope.vistorias.length - 1; i >= 0; i--)
				$scope.vistoriasSelecionadas.push($scope.vistorias[i]);
		}
	}

	$scope.validarEnviar = function(){
		return $scope.dispositivoOnLine && $scope.vistoriasSelecionadas.length > 0;
	}

	$scope.enviar = function(){
		$scope.abrirDialogo = true;

		for (var i = 0; i < $scope.vistoriasSelecionadas.length; i++) {
			VistoriadorService.getVistoriaFormatoEnviar($scope.vistoriasSelecionadas[i].id, function(vistoria){
				VistoriadorService.enviarVistoria(vistoria).then(function(sucesso){
					$scope.enviado = {sucesso: sucesso, id: vistoria.id};
				});
			});
		}
	}

	function selecionado(idVistoria){
		return $scope.vistoriasSelecionadas.indexOf($scope.vistorias[idVistoria]) > -1;
	}
}