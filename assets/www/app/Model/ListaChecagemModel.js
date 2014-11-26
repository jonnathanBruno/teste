'use strict';

bombeiros.service('ListaChecagemService', function($rootScope, ListaChecagemDAO) {
	var self = this,
	_listaChecagem = undefined;

	self.set = function(idVistoria, idItemChecagem, callback){
		ListaChecagemDAO.buscar.itemChecagem(idVistoria, idItemChecagem, function(itemChecagem, naoConformidades) {
			_listaChecagem = {
				id: itemChecagem.id
			}

			callback({itemChecagem : itemChecagem, naoConformidades : naoConformidades});
		});
	}

	self.get = function() { return _listaChecagem; }

	self.getEquipamentos = function(idVistoria, callback){
		ListaChecagemDAO.buscar.equipamentos(idVistoria, function(equipamentos){
			callback(equipamentos);
		});
	}

	self.getItensChecagem = function(idVistoria, idEquipamento, callback) {
		ListaChecagemDAO.buscar.itensChecagem(idVistoria, idEquipamento, callback);
	}

	self.getFormatoEnviar = function(idVistoria, callback){
		ListaChecagemDAO.buscar.listaChecagemFormatoEnviar(idVistoria, callback);
	}

	self.setResultado = function(resultado) {
		ListaChecagemDAO.alterar.resultadoVistoria(_listaChecagem.id, resultado);
	}

	self.setObservacao = function(observacao) {
		ListaChecagemDAO.alterar.observacaoVistoria(_listaChecagem.id, observacao);
	}

	self.setParecer = function(parecer, callback) {
		ListaChecagemDAO.alterar.parecerVistoria(_listaChecagem.id, parecer, callback);
	}

	self.addNaoConformidade = function(naoConformidade, callback) {
		ListaChecagemDAO.inserir.processoListaChecagem_naoConformidade(
			_listaChecagem.id, naoConformidade.id,
			naoConformidade.numeroNaoConformidade, callback
		);
	}

	self.removerNaoConformidade = function(idNaoConformidade) {
		ListaChecagemDAO.deletar.processoListaChecagem_naoConformidade(idNaoConformidade);
	}

	self.remover = function(idVistoria, callback){
		ListaChecagemDAO.deletar.processoListaChecagem_naoConformidade_PorProcesso(idVistoria);		
		ListaChecagemDAO.deletar.processoListaChecagem_PorProcesso(idVistoria, callback);
	}

	function inserirListaChecagem(listaChecagem, idProcesso, indice) {
		if(indice == undefined) indice = 0;

		if(indice < listaChecagem.length){
			// console.log('[%s] (%s/%s) Inserindo %s', idProcesso, indice, listaChecagem.length, listaChecagem[indice].id);
			// ListaChecagemDAO.inserir.equipamento(listaChecagem[indice].itemChecagem.equipamento, function(){
				if(!listaChecagem[indice].itemChecagem){
					listaChecagem[indice].itemChecagem = {id : null};
					inserirItemListaChecagem(listaChecagem[indice], idProcesso)
					inserirListaChecagem(listaChecagem, idProcesso, ++indice);
				}
				else{
					ListaChecagemDAO.inserir.itemChecagem(listaChecagem[indice].itemChecagem, function(){
						inserirItemListaChecagem(listaChecagem[indice], idProcesso)
						inserirListaChecagem(listaChecagem, idProcesso, ++indice);
					});
				}
			// });
		}
		else
			$rootScope.$broadcast('eventoVistoriaAtualizada', idProcesso);
	}

	self.inserirListaChecagem = inserirListaChecagem;

	function inserirItemListaChecagem(itemListaChecagem, idProcesso) {
		if(itemListaChecagem.itemChecagem && itemListaChecagem.itemChecagem.naoConformidades)
			inserirNaoConformidades(itemListaChecagem.itemChecagem.naoConformidades, itemListaChecagem.itemChecagem.id);

		ListaChecagemDAO.inserir.processoListaChecagem(itemListaChecagem, idProcesso);
		inserirNaoConformidadesPele(itemListaChecagem, 1);
	}

	function inserirNaoConformidades(naoConformidades, idItemChecagem) {
		if(!naoConformidades.length){
			ListaChecagemDAO.inserir.naoConformidade(naoConformidades, idItemChecagem);
		}
		else{
			for(var i = naoConformidades.length - 1; i >= 0; i--)
				ListaChecagemDAO.inserir.naoConformidade(naoConformidades[i], idItemChecagem);
		}
	}

	function inserirNaoConformidadesPele(listaChecagem, numeroNaoConformidade) {
		if(numeroNaoConformidade <= 6){
			if(listaChecagem['naoConformidade' + numeroNaoConformidade]){
				ListaChecagemDAO.inserir.processoListaChecagem_naoConformidade(listaChecagem.id, 
					listaChecagem['naoConformidade' + numeroNaoConformidade].id, numeroNaoConformidade);

				inserirNaoConformidades(listaChecagem['naoConformidade' + numeroNaoConformidade], listaChecagem.itemChecagem.id);
			}

			inserirNaoConformidadesPele(listaChecagem, ++numeroNaoConformidade);
		}
	}

	(function init () {
		ListaChecagemDAO.criarTabelas(function() {
			$rootScope.$broadcast('eventoTabelasCriadas', 'equipamento');
		});
	}());
});