'use strict';

bombeiros.value('BD', window.openDatabase("CBMRN", "1.0", "Bombeiros DB", 500000));

bombeiros.factory('DAO', function(BD) {
	var self = this;

	self.erro = function(dbMagic, msg){
		console.log("[Erro] " + msg + ": " + dbMagic.message);
	};

	return{
		bancoJaExiste: function(callback) {
	        BD.readTransaction(
	            function(dbMagic) {
	                var sql = "SELECT name FROM sqlite_master WHERE type='table' AND name=:tableName";

	                dbMagic.executeSql(sql, ['ProcessoListaChecagem_NaoConformidade'], function(dbMagic, resultado) {
                        callback(resultado.rows.length === 1);
	                }, this.erro);
	            },
	            self.erro
	        );
	    },

	    jaExiste: function(tabela, id, callback){
			BD.readTransaction(
				function(dbMagic){
					var sql = "SELECT id FROM " + tabela + " WHERE id = ?";

					dbMagic.executeSql(sql, [id], function(dbMagic, resultado){
						callback(resultado.rows.length > 0);
					});
				},
				self.erro
			);
		},

		erro: self.erro,

		db: BD
	}
});