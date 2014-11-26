'use strict';

bombeiros.service('VistoriaService', function($rootScope, VistoriaDAO, ListaChecagemService) {
	var self = this,
	_vistoria;

	self.set = function(idVistoria, callback){
		VistoriaDAO.buscar.vistoria(idVistoria, function(vistoria) {
			// ListaChecagemService.getEquipamentos(idVistoria, function(equipamentos) {
			// 	_vistoria = vistoria;
			// 	_vistoria.equipamentos = equipamentos;
				
			// 	callback(_vistoria);
			// });

			VistoriaDAO.buscar.equipamentos(idVistoria, function(equipamentos) {
				_vistoria = vistoria;
				_vistoria.equipamentos = equipamentos;
				
				callback(_vistoria);
			});
		});
	}

	self.get = function() { return _vistoria; }

	self.getAll = function(idVistoriador, callback, idProcesso){
		VistoriaDAO.buscar.vistorias(idVistoriador, function(vistorias){
			callback(vistorias);
		}, idProcesso);
	}

	self.getVistoriaFormatoEnviar = function(idVistoria, callback){
		ListaChecagemService.getFormatoEnviar(idVistoria, callback);
	}

	self.getItensChecagem = function(idEquipamento, callback) {
		VistoriaDAO.buscar.itensChecagem(_vistoria.id, idEquipamento, callback);
	}

	self.getItemChecagem = function(idItemChecagem, callback) {
		VistoriaDAO.buscar.itemChecagem(_vistoria.id, idItemChecagem, callback);
	}

	self.getArquivos = function(callback){
		VistoriaDAO.buscar.arquivos(_vistoria.id, callback);		
	}

	self.inserirVistoria = function(vistoria, vistoriador){
		VistoriaDAO.inserir.processoAnalise(vistoria, vistoriador.id);
		VistoriaDAO.inserir.imovel(vistoria.processo.imovel);
		VistoriaDAO.inserir.processo(vistoria.processo, vistoria.id);
		inserirEquipamentos(vistoria.processo.equipamentos, vistoria.processo.id);

		if(vistoria.processo.arquivos)
			inserirArquivos(vistoria.processo.arquivos, vistoria.processo.id);

		if(!vistoria.processo.listaChecagem.length)
			vistoria.processo.listaChecagem = [vistoria.processo.listaChecagem];

		ListaChecagemService.inserirListaChecagem(vistoria.processo.listaChecagem, vistoria.processo.id);
	}

	self.remover = function(idVistoria, callback){
		ListaChecagemService.remover(idVistoria);
		VistoriaDAO.deletar.vistoria(idVistoria, callback);
	}

	function inserirArquivos(arquivos, idProcesso) {
		if(!arquivos.length)
			VistoriaDAO.inserir.processoArquivo(arquivos, idProcesso);
		else{
			for (var i = arquivos.length - 1; i >= 0; i--)
				VistoriaDAO.inserir.processoArquivo(arquivos[i], idProcesso);
		}
	}

	function inserirEquipamentos(equipamentos, idProcesso, indice) {
		if(!equipamentos.length){
			VistoriaDAO.inserir.processoEquipamento(equipamentos, idProcesso);
			VistoriaDAO.inserir.equipamento(equipamentos);
		}
		else{
			if(!indice) indice = 0;

			if(indice < equipamentos.length){
				VistoriaDAO.inserir.processoEquipamento(equipamentos[indice], idProcesso);
				// console.log('[%s] Inserindo equipamento %s..', idProcesso, equipamentos[indice].nome);
				VistoriaDAO.inserir.equipamento(equipamentos[indice], function() {
					inserirEquipamentos(equipamentos, idProcesso, ++indice);
				});
			}
		}
	}

	(function init () {
		VistoriaDAO.criarTabelas(function() {
			$rootScope.$broadcast('eventoTabelasCriadas', 'vistoria');
		});
	}());
});