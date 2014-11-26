'use strict';

ItemChecagemController.resolve = {
	dados: function($route, ListaChecagemService, $q) {
	    var deferred = $q.defer();

	    ListaChecagemService.set($route.current.params.idVistoria, $route.current.params.idItemChecagem, function(itemChecagem){
			deferred.resolve(itemChecagem);
		});

	    return deferred.promise;
  	},
	delay: function($q, $timeout) {
		var delay = $q.defer();
		$timeout(delay.resolve, 200);
		return delay.promise;
	}
}

function ItemChecagemController($rootScope, $scope, ListaChecagemService, dados) {
	$scope.naoConformidades = angular.copy(dados.naoConformidades);
	$scope.itemChecagem = angular.copy(dados.itemChecagem);
	$rootScope.secao = dados.itemChecagem.nome;

	$scope.salvarResultado = salvarResultado;

	$scope.selecionarNaoConformidade = function(idNaoConformidade){
		salvarNaoConformidade($scope.naoConformidades[getIndexNaoConformidade(idNaoConformidade)]);
	}

	$scope.salvarObservacao = function(){
		if($scope.itemChecagem.observacao != dados.itemChecagem.observacao)
			salvarObservacao($scope.itemChecagem.observacao);
	}

	$scope.salvarParecer = function(){
		ListaChecagemService.setParecer($scope.parecer);
	}

	$scope.isNaoConfomidadeSelecionada = function(idNaoConformidade) {
		for (var i = $scope.naoConformidades.length - 1; i >= 0; i--) {
			if($scope.naoConformidades[i].id == idNaoConformidade && $scope.naoConformidades[i].numeroNaoConformidade)
				return true;
		}

		return false;
	}

	$scope.existeNaoConfomidadeSelecionada = function() {
		for (var i = $scope.naoConformidades.length - 1; i >= 0; i--) {
			if($scope.isNaoConfomidadeSelecionada($scope.naoConformidades[i].id))
				return true;
		}

		return false;
	}

	$scope.cancelar = function(){
		$rootScope.voltar();

		if(dados.itemChecagem.resultado1 != $scope.itemChecagem.resultado1)
			salvarResultado(dados.itemChecagem.resultado1);
		if(dados.itemChecagem.observacao != $scope.itemChecagem.observacao)
			salvarObservacao(dados.itemChecagem.observacao);

		for (var i = dados.naoConformidades.length - 1; i >= 0; i--) {
			if(dados.naoConformidades[i].numeroNaoConformidade != $scope.naoConformidades[i].numeroNaoConformidade)
				salvarNaoConformidade($scope.naoConformidades[i]);
		}
	}

	function salvarResultado(resultado){
		$scope.itemChecagem.resultado1 = resultado;

		if(resultado == 'OK'){
			$scope.parecer = '';
			$scope.salvarParecer();

			if(getUltimoNumeroNaoConformidade() > 1){
				for (var i = $scope.naoConformidades.length - 1; i >= 0; i--) {
					if($scope.naoConformidades[i].idNaoConformidadeSelecionada != undefined)
						salvarNaoConformidade($scope.naoConformidades[i]);
				}
			}
		}

		ListaChecagemService.setResultado(resultado);
	}

	function salvarNaoConformidade(naoConformidade){
		if(naoConformidade.numeroNaoConformidade == undefined){
			if($scope.itemChecagem.resultado1 != 'NAO_CONFORME')
				salvarResultado('NAO_CONFORME');

			naoConformidade.numeroNaoConformidade = getUltimoNumeroNaoConformidade();

			ListaChecagemService.addNaoConformidade(naoConformidade, function(id){
				naoConformidade.idNaoConformidadeSelecionada = id;
			});

			$scope.parecer += naoConformidade.parecer + '\n';

			ListaChecagemService.setParecer($scope.parecer);
		}
		else{
			naoConformidade.numeroNaoConformidade = undefined;
			ListaChecagemService.removerNaoConformidade(naoConformidade.idNaoConformidadeSelecionada);

			$scope.parecer = $scope.parecer.replace(naoConformidade.parecer + '\n', '');

			ListaChecagemService.setParecer($scope.parecer);
		}
	}

	function salvarObservacao(observacao){
		ListaChecagemService.setObservacao(observacao);
	}

	function getIndexNaoConformidade(idNaoConformidade) {
		for (var i = $scope.naoConformidades.length - 1; i >= 0; i--) {
			if($scope.naoConformidades[i].id == idNaoConformidade)
				return i;
		}
	}

	function getUltimoNumeroNaoConformidade() {
		var numeroNaoConformidade = 1; 

		for (var i = 0; i < $scope.naoConformidades.length; i++) {
			if($scope.naoConformidades[i].numeroNaoConformidade != undefined)
				numeroNaoConformidade++;
		}

		return numeroNaoConformidade;
	}

	function getPareceres() {
		var parecer = angular.copy($scope.itemChecagem.parecer);

		if(parecer && parecer.length > 0)
			parecer += '\n';

		for (var i = 0; i < $scope.naoConformidades.length; i++) {
			if($scope.isNaoConfomidadeSelecionada($scope.naoConformidades[i].id) && $scope.naoConformidades[i].parecer != $scope.itemChecagem.parecer.replace('\n', ''))
				parecer += $scope.naoConformidades[i].parecer + '\n';
		}

		return parecer;
	}

	$scope.parecer = getPareceres();
}