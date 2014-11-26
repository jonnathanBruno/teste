'use strict'

bombeiros.service('VistoriadorService', function($rootScope, VistoriadorJSON, VistoriadorDAO, VistoriaService, SistemaDeArquivo) {
	var self = this,
	_vistoriador;

	self.get = function(callback){
		if(callback) callback(_vistoriador); 
		else return _vistoriador;
	}

	self.getAll = function(callback){
		VistoriadorDAO.buscar.vistoriadores(function(vistoriadores) {
			callback(vistoriadores);
		});
	}

	self.getVistorias = function(callback, idVistoriador){
		VistoriaService.getAll(_vistoriador.id, callback, idVistoriador);
	}

	self.getVistoriaFormatoEnviar = function(idVistoria, callback) {
		VistoriaService.getVistoriaFormatoEnviar(idVistoria, function(vistoria) {
			callback(vistoria);
		});
	}

	self.set = set;

	self.baixarVistoriadores = function(){
		console.log('Baixando..');
		VistoriadorDAO.buscar.vistoriadoresJaBaixados(function(vistoriadores) {
			VistoriadorJSON.baixarVistoriadores().get({vistoriadoresJaBaixados: vistoriadores}, function(json){
				if(json.lista){
					var vistoriadores = json.lista;

					for (var i = vistoriadores.length - 1; i >= 0; i--)
						inserirVistoriador(vistoriadores[i]);
				}
			});
		});
	}

	self.baixarVistorias = function(callback){
		console.log('Baixando?');
		VistoriadorDAO.buscar.vistoriasJaBaixadas(_vistoriador.id, function(vistorias){
			VistoriadorJSON.baixarVistorias().get({idVistoriador: _vistoriador.id, vistoriasJaBaixadas: vistorias}, function(json) {
				SistemaDeArquivo.criarPasta('');
				
				if(json.lista.length > 0 || json.lista.length == undefined){
					var vistorias = json.lista;

					callback(vistorias);
					console.log('Vistorias %s', json.lista.length);
					if(json.lista.length > 0){
						for (var i = vistorias.length - 1; i >= 0; i--)
							inserirVistoria(vistorias[i]);
					}
					else if(json.lista.length == undefined)
						inserirVistoria(vistorias);
				}
			});
		});
	}

	self.enviarVistoria = function(vistoria){
		var promessa = VistoriadorJSON.salvarVistoria(_vistoriador.id, vistoria)
		.success(function (data) {
			var sucesso = data.indexOf('Vistoria salva com sucesso') > -1;

			if(sucesso)
				removerVistoria(vistoria.id);

			return sucesso;
		})
		.error(function (data) {
			return false;
		});
		
		return promessa;
	}

	function set(vistoriador, callback){
		_vistoriador = angular.copy(vistoriador);
		localStorage['vistoriador'] = JSON.stringify(_vistoriador);
	}

	function inserirVistoriador(vistoriador){
		var nomePasta = vistoriador.id;

		if(vistoriador.matricula != undefined){
			if(typeof(vistoriador.matricula) == 'number')
				vistoriador.matricula = vistoriador.matricula.toString();
			
			nomePasta = vistoriador.matricula;
		}

		VistoriadorDAO.inserir.vistoriador(vistoriador);

		$rootScope.$broadcast('VistoriadoresAtualizado', vistoriador.id);
		SistemaDeArquivo.criarPasta(nomePasta);
	}

	function inserirVistoria(vistoria){
		VistoriaService.inserirVistoria(vistoria, {'id': _vistoriador.id, 'matricula': _vistoriador.matricula});

		SistemaDeArquivo.criarPasta(_vistoriador.matricula + '/' + vistoria.processo.id);

		if(vistoria.processo.arquivos){
			baixarArquivos(
				vistoria.processo.arquivos, 
				vistoria.processo.id, 
				_vistoriador.matricula == undefined ? _vistoriador.id : _vistoriador.matricula
			);
		}
	}

	function baixarArquivos(arquivos, idProcesso, nomePasta){
		if(!arquivos.length)
			VistoriadorJSON.baixarArquivo(_vistoriador.id, nomePasta, idProcesso, arquivos);
		else{
			for (var i = arquivos.length - 1; i >= 0; i--)
				VistoriadorJSON.baixarArquivo(_vistoriador.id, nomePasta, idProcesso, arquivos[i]);
		}
	}

	function removerVistoria(idVistoria) {
		var pastaVistoria = (_vistoriador.matricula != undefined ? _vistoriador.matricula : _vistoriador.id) +
							'/' + idVistoria;

		VistoriaService.remover(idVistoria);
		SistemaDeArquivo.removerPasta(pastaVistoria);
	}

	(function init (){
		VistoriadorDAO.criarTabelas();

		if(localStorage['vistoriador']){
			_vistoriador = JSON.parse(localStorage['vistoriador']);
			console.log('broadcast')
			$rootScope.$broadcast('eventoVistoriadorIniciado', _vistoriador);

			// set(localStorage['vistoriador'], function(vistoriador) {
			// 	console.log('[eventoVistoriadorIniciado] an?')
			// 	$rootScope.$broadcast('eventoVistoriadorIniciado', vistoriador);
			// });
		}
	}());
});