'use strict';

bombeiros.factory('VistoriaDAO', function(DAO) {
	var self = this;

	self.tabelas = {
		processoAnalise : function(callback){
			DAO.db.transaction(
				function(dbMagic){
					var sql =
	                    "CREATE TABLE IF NOT EXISTS ProcessoAnalise ( " +
	                    "id VARCHAR(255) PRIMARY KEY, " +
	                    "dataDistribuicao TIMESTAMP, " +
	                    "dataInicio TIMESTAMP, " +
	                    "numEntrada INTEGER, " +
	                    "situacao VARCHAR(50), " +
	                    "usuarioDistribuicao LONG, " +
	                    "vistoriador_id LONG, " + 
	                    "processo_id LONG, " + 
	                    "FOREIGN KEY(vistoriador_id) REFERENCES Vistoriador(id), " +
	                    "FOREIGN KEY(processo_id) REFERENCES Processo(id))";
			
					dbMagic.executeSql(sql);
				},
				DAO.erro
			);
		},

		imovel: function(callback){
			DAO.db.transaction(
				function(dbMagic){
					var sql =
	                    "CREATE TABLE IF NOT EXISTS Imovel ( " +
	                    "id LONG PRIMARY KEY, " +
	                    "area REAL, " +
	                    "areaCobranca REAL, " +
	                    "bairro VARCHAR(255), " +
	                    "cep VARCHAR(50), " +
	                    "cidade VARCHAR(255), " +
	                    "logradouro VARCHAR(255), " +
	                    "logradouroTipo VARCHAR(100), " +
	                    "nome VARCHAR(255), " +
	                    "numero VARCHAR(20), " +
	                    "ocupacao INTEGER, " +
	                    "publico INTEGER)";

					dbMagic.executeSql(sql);
				},
				DAO.erro
			);
		},

		processo : function(callback){
			DAO.db.transaction(
				function(dbMagic){
					var sql =
	                    "CREATE TABLE IF NOT EXISTS Processo ( " +
	                    "id LONG PRIMARY KEY, " +
	                    "numProtocolo INTEGER, " +
	                    "situacao INTEGER, " +
	                    "situacaoAnalise INTEGER, " +
	                    // "processoAnalise_id LONG, " +
	                    "imovel_id LONG, " +
	                    // "FOREIGN KEY(processoAnalise_id) REFERENCES ProcessoAnalise(id), " +
	                    "FOREIGN KEY(imovel_id) REFERENCES Imovel(id))";

					console.log("Criando processo");
					dbMagic.executeSql(sql);
				},
				DAO.erro
			);
		},

		equipamento: function(callback){
			DAO.db.transaction(
				function(dbMagic){
					var sql =
	                    "CREATE TABLE IF NOT EXISTS Equipamento ( " +
	                    "id LONG PRIMARY KEY, " +
	                    "ativo INTEGER, " +
	                    "nome VARCHAR(255), " +
	                    "tipo VARCHAR(255))";

					dbMagic.executeSql(sql);
				},
				DAO.erro
			);
		},

		processoEquipamento : function(callback){
			DAO.db.transaction(
				function(dbMagic){
					var sql =
	                    "CREATE TABLE IF NOT EXISTS ProcessoEquipamento ( " +
	                    // "id LONG PRIMARY KEY, " +
	                    "equipamento_id LONG, " +
	                    "processo_id LONG, " +
	                    "FOREIGN KEY(equipamento_id) REFERENCES Equipamento(id), " +
	                    "FOREIGN KEY(processo_id) REFERENCES Processo(id))";

					console.log("Criando processoEquipamento");
					dbMagic.executeSql(sql);
				},
				DAO.erro
			);
		},

		processoArquivo : function(callback){
			DAO.db.transaction(
				function(dbMagic){
					var sql =
	                    "CREATE TABLE IF NOT EXISTS ProcessoArquivo ( " +
	                    "id LONG PRIMARY KEY, " +
	                    "nome VARCHAR(255), " +
	                    "numEntrada INTEGER, " +
	                    "data TIMESTAMP, " +
	                    "tipoDocumento VARCHAR(255), " +
	                    "tipoArquivo VARCHAR(5), " +
	                    "processo_id LONG, " +
	                    "FOREIGN KEY(processo_id) REFERENCES Processo(id))";

					console.log("Criando processoArquivo");
					dbMagic.executeSql(sql);
				},
				DAO.erro
			);
		},

		erro : function(dbMagic){
			console.log("Erro ao criar a tabela: ", dbMagic.message);
		}
	};

	self.querys = {
	   criarTabelas : function(callback){
	    	DAO.bancoJaExiste(function(criado){
				if(!criado){
					self.tabelas.processoAnalise();
					self.tabelas.imovel();
					self.tabelas.processo();
					self.tabelas.equipamento();
					self.tabelas.processoEquipamento();
					self.tabelas.processoArquivo();
					callback(criado);
				}
				else
					callback(criado);
	    	});
		},

		buscar: {
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

			vistorias: function(idVistoriador, callback, idProcesso) {
				DAO.db.readTransaction(
					function(dbMagic){
						var sql = "SELECT p.id, p.numProtocolo, pa.datainicio AS 'data', i.nome AS 'imovelNome' " +
								  "FROM Processo p " + 
								  "INNER JOIN ProcessoAnalise pa ON pa.processo_id = p.id " +
								  "INNER JOIN Vistoriador v ON v.id = pa.vistoriador_id " +
								  "INNER JOIN Imovel i ON i.id = p.imovel_id " +
								  "WHERE v.id = ? " +
								  (idProcesso != undefined ? "AND p.id = ? " : '') +
								  "GROUP BY p.id, pa.datainicio, i.nome";

						var parametros = [idVistoriador];
						idProcesso != undefined ? parametros.push(idProcesso) : '';

						dbMagic.executeSql(sql, parametros, function(dbMagic, resultado){
							var vistorias = [];

							for (var i = 0; i < resultado.rows.length; i++){
								vistorias.push(resultado.rows.item(i));

								checarEstadoVistoria(i);
							}

							function checarEstadoVistoria(indice){
								self.querys.buscar.estadoVistoria(vistorias[indice].id, function(estado){
									vistorias[indice].estado = estado;

									if(indice == resultado.rows.length - 1)
										callback(vistorias);
								});
							}
						});
					},
					DAO.erro
				);
			},

			vistoria: function(idProcesso, callback) {
				this.imovel(idProcesso, function(imovel){
					DAO.db.readTransaction(
						function(dbMagic){
							var sql = "SELECT p.id, pa.id AS 'idProcessoAnalise'"
										+ " FROM Processo p "
										+ " INNER JOIN ProcessoAnalise pa ON pa.processo_id = p.id "
									  	+ " WHERE p.id = ?";

							dbMagic.executeSql(sql, [idProcesso], function(dbMagic, resultado){
								var vistoria = resultado.rows.item(0);
								vistoria.imovel = imovel;

								callback(vistoria);
							});
						},
						DAO.erro
					);
				});
			},

			equipamentos: function(idProcesso, callback){
				DAO.db.readTransaction(
					function(dbMagic){
						var sql = 
									"SELECT e.id, e.nome " +
								  	"FROM Processo p " +
								  	"INNER JOIN ProcessoEquipamento pe ON pe.processo_id = p.id " +
								  	"INNER JOIN Equipamento e ON e.id = pe.equipamento_id " +
								  	"WHERE p.id = ? GROUP BY e.id, e.nome";

						dbMagic.executeSql(sql, [idProcesso], function(dbMagic, resultado){
							var equipamentos = [];

							for (var i = 0; i < resultado.rows.length; i++){
								equipamentos.push(resultado.rows.item(i));
								checarEstadoEquipamento(i);
							}

							function checarEstadoEquipamento(indice){
								self.querys.buscar.estadoVistoriaEquipamento(idProcesso, equipamentos[indice].id, function(estado){
								   equipamentos[indice].estado = estado;

								   if(indice == resultado.rows.length - 1)
								   	callback(equipamentos);
								});
                     }
						});
					},
					DAO.erro
				);
			},

			imovel: function(idProcesso, callback){
				DAO.db.readTransaction(
					function(dbMagic){
						var sql = "SELECT i.id, i.nome, i.logradouroTipo, i.logradouro, i.numero, i.bairro, i.cidade, i.area " +
								  "FROM Processo p " +
								  "INNER JOIN imovel i ON i.id = p.imovel_id " +
								  "WHERE p.id = ?";

						dbMagic.executeSql(sql, [idProcesso], function(dbMagic, resultado){
							callback(resultado.rows.item(0));
						});
					},
					DAO.erro
				);
			},

			estadoVistoria: function(idProcesso, callback){
				DAO.db.readTransaction(
					function(dbMagic){
						var sql = "SELECT plc.id, plc.resultado1 " +
								  "FROM ProcessoListaChecagem plc " +
								  "WHERE plc.processo_id = ? ";

						dbMagic.executeSql(sql, [idProcesso], function(dbMagic, resultado){
							self.querys.buscar.checarEstado(resultado, callback);
						});
					},
					DAO.erro
				);
			},

			estadoVistoriaEquipamento: function(idProcesso, idEquipamento, callback){
				DAO.db.readTransaction(
					function(dbMagic){
						var sql = "SELECT plc.id, ic.equipamento_id, plc.resultado1 " +
								  "FROM ProcessoListaChecagem plc " +
								  "INNER JOIN ItemChecagem ic ON plc.itemChecagem_id = ic.id " +
								  "WHERE plc.processo_id = ? " +
								  "AND ic.equipamento_id = ? " +
								  "GROUP BY plc.id, plc.resultado1, ic.equipamento_id";

						dbMagic.executeSql(sql, [idProcesso, idEquipamento], function(dbMagic, resultado){
							self.querys.buscar.checarEstado(resultado, callback);
						});
					},
					DAO.erro
				);
			},

			// ¬¬, intruso..
			checarEstado: function(resultado, callback){
				var concluido = 'OK';

				for (var i = resultado.rows.length - 1; i >= 0; i--){
					if(resultado.rows.item(i).resultado1 == "undefined"){
						concluido = undefined;
						break;
					}
					else if(resultado.rows.item(i).resultado1 == "NAO_CONFORME")
						concluido = 'NAO_CONFORME';
				}

				callback(concluido);
			},
		},

		alterar: {
		},

		deletar: {
			vistoria: function(idVistoria, callback) {
				self.querys.buscar.vistoria(idVistoria, function(vistoria) {
					self.querys.deletar.imovel(vistoria.imovel.id);
					self.querys.deletar.processoArquivo_PorProcesso(idVistoria);
					self.querys.deletar.processo(idVistoria);
					self.querys.deletar.processoAnalise(vistoria.idProcessoAnalise, callback);
				});
			},

			processoAnalise: function(id, callback) {
				DAO.db.transaction(
					function(dbMagic) {
						var sql = 'DELETE FROM ProcessoAnalise ' +
								  'WHERE id = ?';

						console.log('[ProcessoAnalise] Deletando.. %s', id);
						dbMagic.executeSql(sql, [id], callback);
					}
				);
			},

			imovel: function(id, callback) {
				DAO.db.transaction(
					function(dbMagic) {
						var sql = 'DELETE FROM Imovel ' +
								  'WHERE id = ?';

						console.log('[Imovel] Deletando.. %s', id);
						dbMagic.executeSql(sql, [id], callback);
					}
				);
			},

			processo: function(id, callback) {
				DAO.db.transaction(
					function(dbMagic) {
						var sql = 'DELETE FROM Processo ' +
								  'WHERE id = ?';

						console.log('[Processo] Deletando.. %s', id);
						dbMagic.executeSql(sql, [id], callback);
					}
				);
			},

			processoArquivo_PorProcesso: function(id, callback) {
				DAO.db.transaction(
					function(dbMagic) {
						var sql = 'DELETE FROM ProcessoArquivo ' +
								  'WHERE processo_id = ?';

						console.log('[ProcessoArquivo] Deletando.. %s', id);
						dbMagic.executeSql(sql, [id], callback);
					}
				);
			}
		},

		inserir: {
			processoAnalise: function(processoAnalise, idVistoriador){
				DAO.db.transaction(
					function(dbMagic){
						var sql =
		                    	"INSERT INTO ProcessoAnalise (id, dataDistribuicao, dataInicio, numEntrada, situacao, " +
	                    		"usuarioDistribuicao, vistoriador_id, processo_id) " +
		                    	"VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

						dbMagic.executeSql(sql, [processoAnalise.id, processoAnalise.dataDistribuicao.time, processoAnalise.dataInicio.time, 
							processoAnalise.numEntrada, processoAnalise.situacao, processoAnalise.usuarioDistribuicao, idVistoriador, processoAnalise.processo.id]);
					},
					function(dbMagic){
						DAO.erro(dbMagic, 'Inserindo processo análise');
					}
				);
			},

			imovel: function(imovel){
				DAO.db.transaction(
					function(dbMagic){
						var sql =
		                    "INSERT INTO Imovel (id, area, areaCobranca, bairro, cep, cidade, logradouro, logradouroTipo, nome, " +
		                    "numero, ocupacao, publico) " +
		                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

						dbMagic.executeSql(sql, [imovel.id, imovel.area, imovel.areacobranca, imovel.bairro, imovel.cep, imovel.cidade,
							imovel.logradouro, imovel.logradourotipo, imovel.nome, imovel.numero, imovel.ocupacao, imovel.publico]);
					},
					function(dbMagic){
						DAO.erro(dbMagic, 'Inserindo imóvel');
					}
				);
			},

			processo: function(processo, idProcessoAnalise){
				DAO.db.transaction(
					function(dbMagic){
						var sql =
		                    "INSERT INTO Processo (id, numProtocolo, situacao, situacaoAnalise, imovel_id) " +
		                    "VALUES (?, ?, ?, ?, ?)";

						dbMagic.executeSql(sql, [processo.id, processo.numProtocolo, processo.situacao, processo.situacaoAnalise,
							/*idProcessoAnalise, */processo.imovel.id]);
					},
					function(dbMagic){
						DAO.erro(dbMagic, 'Inserindo processo');
					}
				);
			},

			equipamento: function(equipamento, callback){
				DAO.jaExiste('Equipamento', equipamento.id, function(existe){
					if(!existe){
						DAO.db.transaction(
							function(dbMagic){
								var sql =
				                    "INSERT INTO Equipamento (id, ativo, nome, tipo) " +
				                    "VALUES (?, ?, ?, ?)";
	
								dbMagic.executeSql(sql, [equipamento.id, equipamento.ativo, equipamento.nome, equipamento.tipo]);
							},
							function(dbMagic){
								DAO.erro(dbMagic, 'Inserindo equipamento');
							}
						);
					}
					
					if(callback)
						callback();
				});
			},

			processoEquipamento: function(equipamento, idProcesso){
				DAO.db.transaction(
					function(dbMagic){
						var sql =
		                    "INSERT INTO ProcessoEquipamento (equipamento_id, processo_id) " +
		                    "VALUES (?, ?)";

						dbMagic.executeSql(sql, [equipamento.id, idProcesso]);
					},
					function(dbMagic){
						DAO.erro(dbMagic, 'Inserindo processoEquipamento');
					}
				);
			},

			processoArquivo: function(processoArquivo, idProcesso) {
				DAO.db.transaction(
					function(dbMagic){
						var sql =
		                    "INSERT INTO ProcessoArquivo (id, nome, numEntrada, data, tipoDocumento, tipoArquivo, processo_id) " +
		                    "VALUES (?, ?, ?, ?, ?, ?, ?)";

						dbMagic.executeSql(sql, [processoArquivo.id, processoArquivo.nome, processoArquivo.numEntrada, processoArquivo.data,
							processoArquivo.tipoDocumento.nome, processoArquivo.tipoArquivo, idProcesso]);
					},
					function(dbMagic){
						DAO.erro(dbMagic, 'Inserindo processoArquivo');
					}
				);
			},
		}
	};

	return self.querys;
});