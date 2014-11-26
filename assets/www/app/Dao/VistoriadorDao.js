'use strict';

bombeiros.factory('VistoriadorDAO', function(DAO) {
	var self = this;

	self.tabelas = {
		vistoriador : function(callback){
			DAO.db.transaction(
				function(dbMagic){
					var sql =
	                    "CREATE TABLE IF NOT EXISTS Vistoriador ( " +
	                    "id LONG PRIMARY KEY, " +
	                    "login VARCHAR(50), " +
	                    "matricula VARCHAR(100), " +
	                    "nome VARCHAR(50))";

					dbMagic.executeSql(sql, [], callback);
				},
				DAO.erro
			);
		}
	};

	self.querys = {
		criarTabelas : function(callback){
	    	DAO.bancoJaExiste(function(criado){
				if(!criado){
					self.tabelas.vistoriador(function() {
						if(callback) callback(criado);
					});
				}
				else
					if(callback) callback(criado);
	    	});
		},

		buscar: {
			vistoriador: function(idVistoriador, callback) {
				DAO.db.readTransaction(
					function(dbMagic) {
						var sql = "SELECT v.id, v.nome, v.matricula " +
								   "FROM Vistoriador v " + 
								   "WHERe v.id = ?";

						dbMagic.executeSql(sql, [idVistoriador], function(dbMagic, resultado) {
							callback(resultado.rows.item(0));
						});
					},
					DAO.erro
				);
			},
			
			vistoriadoresJaBaixados: function(callback) {
				DAO.db.readTransaction(
					function(dbMagic) {
						var sql = "SELECT id FROM Vistoriador";

						dbMagic.executeSql(sql, [], function(dbMagic, resultado) {
							var vistoriadoresJaBaixados = [];

							for (var i = resultado.rows.length - 1; i >= 0; i--)
								vistoriadoresJaBaixados.push(resultado.rows.item(i).id);

							callback(vistoriadoresJaBaixados);
						});
					},
					DAO.erro
				);
			},

			vistoriadores: function(callback) {
				DAO.db.readTransaction(
					function(dbMagic) {
						var sql = "SELECT v.id, v.nome, v.matricula FROM Vistoriador v";

						dbMagic.executeSql(sql, [], function(dbMagic, resultado) {
							var vistoriadores = [];

							for (var i = resultado.rows.length - 1; i >= 0; i--)
								vistoriadores.push(resultado.rows.item(i));

							callback(vistoriadores);
						});
					},
					DAO.erro
				);
			},

			vistoriasJaBaixadas: function(idVistoriador, callback){
				DAO.bancoJaExiste(function(criado){
					if(criado){
						DAO.db.readTransaction(
							function(dbMagic){
								var sql = "SELECT p.id FROM Processo p " +
										  "INNER JOIN ProcessoAnalise pa ON pa.processo_id = p.id " +
										  "WHERE pa.vistoriador_id = ?";

								dbMagic.executeSql(sql, [idVistoriador], function(dbMagic, resultado){
									var vistoriasJaBaixadas = [];

									for (var i = resultado.rows.length - 1; i >= 0; i--)
										vistoriasJaBaixadas.push(resultado.rows.item(i).id);

									callback(vistoriasJaBaixadas);
								});
							},
							DAO.erro
						);
					}
				});
			},
		},

		inserir: {
			vistoriador: function(vistoriador){
				DAO.db.transaction(
					function(dbMagic){
						var sql =
		                    "INSERT INTO Vistoriador (id, login, matricula, nome) " +
		                    "VALUES (?, ?, ?, ?)";

						dbMagic.executeSql(sql, [vistoriador.id, vistoriador.login, vistoriador.matricula, vistoriador.nome]);
					},
					function(dbMagic){
						DAO.erro(dbMagic, 'Inserindo vistoriador');
					}
				);
			}
		}
	};

	return self.querys;
});