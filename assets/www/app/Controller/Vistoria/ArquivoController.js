'use strict';

function ArquivosController($rootScope, $scope, SistemaDeArquivo, rota) {
	var pastaVistoria = $rootScope.pastaVistoriador + '/' + rota.parametros.idVistoria;

	SistemaDeArquivo.listarArquivos(pastaVistoria, function(arquivos, caminhoPasta){
		$scope.arquivos = arquivos;
		pastaVistoria = caminhoPasta.replace('mnt/', '');
	});

	$rootScope.secao = 'Arquivos';

	$scope.abrirArquivo = function(arquivo){
		SistemaDeArquivo.abrirArquivo(pastaVistoria + '/' + arquivo);
	}
}