'use strict';

bombeiros.factory('ListaChecagemDAO', function(DAO) {
	var self = this;

	self.tabelas = {
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

		itemChecagem: function(callback){
			DAO.db.transaction(
				function(dbMagic){
					var sql =
	                    "CREATE TABLE IF NOT EXISTS ItemChecagem ( " +
	                    "id LONG PRIMARY KEY, " +
	                    "ativo INTEGER, " +
	                    "nome VARCHAR(255), " +
	                    "equipamento_id LONG, " +
	                    "FOREIGN KEY(equipamento_id) REFERENCES Equipamento(id))";

					dbMagic.executeSql(sql);
				},
				DAO.erro
			);
		},

		naoConformidade: function(callback){
			DAO.db.transaction(
				function(dbMagic){
					var sql =
	                    "CREATE TABLE IF NOT EXISTS NaoConformidade ( " +
	                    "id LONG PRIMARY KEY, " +
	                    "nome VARCHAR(255), " +
	                    "parecer VARCHAR(255), " +
	                    "itemChecagem_id LONG, " +
	                    "FOREIGN KEY(itemChecagem_id) REFERENCES ItemChecagem(id))";

					dbMagic.executeSql(sql);
				},
				DAO.erro
			);
		},

		processoListaChecagem: function(){
			DAO.db.transaction(
				function(dbMagic){
					var sql =
	                    "CREATE TABLE IF NOT EXISTS ProcessoListaChecagem  ( " +
	                    "id LONG PRIMARY KEY, " +
	                    "nomeItemChecagem VARCHAR(255), " +
	                    "resultado1 VARCHAR(50), " +
	                    "resultado2 VARCHAR(50), " +
	                    "observacao VARCHAR(250), " +
	                    "parecer TEXT, " +
	                    "itemChecagem_id LONG, " +
	                    "equipamento_id LONG, " +
	                    "processo_id LONG, " +
	                    "FOREIGN KEY(itemChecagem_id) REFERENCES ItemChecagem(id), " +
	                    "FOREIGN KEY(equipamento_id) REFERENCES Equipamento(id), " +
	                    "FOREIGN KEY(processo_id) REFERENCES Processo(id))";

					dbMagic.executeSql(sql);
				},
				DAO.erro
			);
		},

		processoListaChecagem_naoConformidade: function(callback){
			DAO.db.transaction(
				function(dbMagic){
					var sql =
	                    "CREATE TABLE IF NOT EXISTS ProcessoListaChecagem_NaoConformidade ( " +
	                    "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
	                    "numeroNaoConformidade INTEGER, " +
	                    "processoListaChecagem_id LONG, " +
	                    "naoConformidade_id LONG, " +
	                    "FOREIGN KEY(processoListaChecagem_id) REFERENCES ProcessoListaChecagem(id), " +
	                    "FOREIGN KEY(naoConformidade_id) REFERENCES NaoConformidade(id))";

					dbMagic.executeSql(sql);
					console.log("Última tabela lá..");
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
					// self.tabelas.equipamento();
					self.tabelas.itemChecagem();
					self.tabelas.naoConformidade();
					self.tabelas.processoListaChecagem();
					self.tabelas.processoListaChecagem_naoConformidade();
					callback(criado);
				}
				else
					callback(criado);
	    	});
		},

		buscar: {
			listaChecagemFormatoEnviar: function(idProcesso, callback){
				this.resultadosListasChecagem(idProcesso, function(resultadoItensChecagem){
					DAO.db.readTransaction(
						function(dbMagic){
							var sql = "SELECT plc.id, plc_nc.naoConformidade_id, plc_nc.numeroNaoConformidade " +
									  "FROM ProcessoListaChecagem plc " +
									  "INNER JOIN ProcessoListaChecagem_NaoConformidade plc_nc ON plc_nc.processoListaChecagem_id = plc.id " +
									  "WHERE plc.processo_id = ? " +
									  "GROUP BY plc.id, plc_nc.naoConformidade_id, plc_nc.numeroNaoConformidade";

							dbMagic.executeSql(sql, [idProcesso], function(dbMagic, resultado){
								for (var i = 0; i < resultadoItensChecagem.length; i++){
									for (var j = 0; j < resultado.rows.length; j++){
										if(resultado.rows.item(j).id == resultadoItensChecagem[i].id){
											resultadoItensChecagem[i]['naoConformidade' + resultado.rows.item(j).numeroNaoConformidade] = 
											{ id: resultado.rows.item(j).naoConformidade_id};
										}
									}
								}

								callback({
									id 				: idProcesso,
									listaChecagem 	: resultadoItensChecagem
								});
							});
						},
						DAO.erro
					);
				});
			},

			itemChecagem: function(idProcesso, idItemChecagem, callback){
				this.resultadoItemChecagem(idProcesso, idItemChecagem, function(listaChecagem){
					self.querys.buscar.listaChecagem_naoConformidades(listaChecagem.id, function(naoConformidades){
						callback(listaChecagem, naoConformidades);
					});
				});
			},

			equipamentos: function(idProcesso, callback){
				DAO.db.readTransaction(
					function(dbMagic){
						var sql = "SELECT e.id, e.nome " +
								  "FROM Processo p " +
								  "INNER JOIN ProcessoListaChecagem plc ON plc.processo_id = p.id " +
								  "INNER JOIN ItemChecagem ic ON ic.id = plc.itemChecagem_id " +
								  "INNER JOIN Equipamento e ON e.id = ic.equipamento_id " +
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

			listasChecagem: function(idProcesso, callback){
				DAO.db.readTransaction(
					function(dbMagic){
						var sql = "SELECT plc.id, e.id AS 'idEquipamento', " + 
								  "e.nome AS 'nomeEquipamento', plc.resultado1 AS 'estado' " +
								  "FROM ProcessoListaChecagem plc " +
								  "INNER JOIN Processo p ON p.id = plc.processo_id " +
								  "INNER JOIN ItemChecagem ic ON ic.id = plc.itemChecagem_id " +
								  "INNER JOIN Equipamento e ON e.id = ic.equipamento_id " +
								  "WHERE p.id = ? GROUP BY plc.id, e.id";

						dbMagic.executeSql(sql, [idProcesso], function(dbMagic, resultado){
							var listasChecagem = [];

							for (var i = 0; i < resultado.rows.length; i++){
								listasChecagem.push(resultado.rows.item(i));

								if(listasChecagem[i].estado == 'undefined')
									listasChecagem[i].estado = undefined; 
							}

							callback(listasChecagem);

							function checarEstadoListaChecagem(indice){
								self.querys.buscar.checarEstado(listasChecagem[indice].resultado1, function(estado){
									listasChecagem[indice].estado = estado;

									if(indice == resultado.rows.length - 1)
										callback(listasChecagem);
								});
							}
						});
					},
					DAO.erro
				);
			},

			itensChecagem: function(idProcesso, idEquipamento, callback){
				DAO.db.readTransaction(
					function(dbMagic){
						var sql = "SELECT ic.id, ic.nome, plc.resultado1 " +
								  "FROM ProcessoListaChecagem plc " +
								  "INNER JOIN ItemChecagem ic ON ic.id = plc.itemChecagem_id " +
								  "WHERE plc.processo_id = ? " + 
								  "AND plc.equipamento_id = ? " +
								  "GROUP BY ic.id, ic.nome, plc.resultado1";

						dbMagic.executeSql(sql, [idProcesso, idEquipamento], function(dbMagic, resultado){
							var itensChecagem = [];

							for (var i = resultado.rows.length - 1; i >= 0; i--){
								itensChecagem.push({
									id 		: resultado.rows.item(i).id,
									nome 	: resultado.rows.item(i).nome,
									estado  : resultado.rows.item(i).resultado1
								});
							}
							callback(itensChecagem);
						});
					},
					DAO.erro
				);
			},

			listaChecagem_naoConformidades: function(idListaChecagem, callback){
				DAO.db.readTransaction(
					function(dbMagic){
						var sql = "SELECT nc.id, nc.nome, nc.parecer, ( " +
									"SELECT numeroNaoConformidade FROM ProcessoListaChecagem_NaoConformidade " +
									"WHERE naoConformidade_id = nc.id AND processoListaChecagem_id = plc.id " +
								  ") AS 'numeroNaoConformidade', " +
									"(" +
										"SELECT id FROM ProcessoListaChecagem_NaoConformidade " +
										"WHERE naoConformidade_id = nc.id AND processoListaChecagem_id = plc.id " +
									") AS 'idNaoConformidadeSelecionada' " + 
								  "FROM NaoConformidade nc " +
								  "INNER JOIN ProcessoListaChecagem plc ON plc.itemChecagem_id = nc.itemChecagem_id " +
								  "WHERE plc.id = ?";

						console.log('Buscando %s', idListaChecagem);
						dbMagic.executeSql(sql, [idListaChecagem], function(dbMagic, resultado){
							var naoConformidades = [];

							for (var i = resultado.rows.length - 1; i >= 0; i--)
								naoConformidades.push(resultado.rows.item(i));

							callback(naoConformidades);
						});
					},
					DAO.erro
				);
			},

			resultadoItemChecagem: function(idProcesso, idItemChecagem, callback){
				DAO.db.readTransaction(
					function(dbMagic){
						var sql = "SELECT plc.id, plc.nomeItemChecagem AS 'nome', plc.resultado1, plc.observacao, plc.parecer " +
							  	  "FROM ProcessoListaChecagem plc " +
								  "WHERE plc.processo_id = ? " +
								  "AND plc.itemChecagem_id = ?";

						dbMagic.executeSql(sql, [idProcesso, idItemChecagem], function(dbMagic, resultado){
							callback(resultado.rows.item(0));
						});
					},
					DAO.erro
				);
			},

			resultadosListasChecagem: function(idProcesso, callback){
				DAO.db.readTransaction(
					function(dbMagic){
						var parametros = [idProcesso],
						sql = "SELECT plc.id, plc.nomeItemChecagem AS 'nome', plc.resultado1, plc.observacao, plc.parecer " +
							  "FROM ProcessoListaChecagem plc " +
							  "WHERE plc.processo_id = ? " +
							  "GROUP BY plc.id, plc.processo_id, plc.nomeItemChecagem, plc.resultado1, plc.observacao";

						dbMagic.executeSql(sql, parametros, function(dbMagic, resultado){
							var itensChecagem = [];

							for (var i = 0; i < resultado.rows.length; i++)
								itensChecagem.push(resultado.rows.item(i));
							
							callback(itensChecagem);
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
			resultadoVistoria: function(idListaChecagem, resultado, callback){
				DAO.db.transaction(
					function(dbMagic){
						var sql = "UPDATE ProcessoListaChecagem SET resultado1 = ? " +
	                    		  "WHERE id = ?";

	                    console.log("Alterando.. %s - %s", idListaChecagem, resultado);
						dbMagic.executeSql(sql, [resultado, idListaChecagem], callback);
					},
					DAO.erro
				);
			},

			observacaoVistoria: function(idVistoria, observacao, callback){
				DAO.db.transaction(
					function(dbMagic){
						var sql = "UPDATE ProcessoListaChecagem SET observacao = ? " +
	                    		  "WHERE id = ?";

						dbMagic.executeSql(sql, [observacao, idVistoria], callback);
					},
					DAO.erro
				);
			},

			parecerVistoria: function(idVistoria, parecer, callback){
				DAO.db.transaction(
					function(dbMagic){
						var sql = "UPDATE ProcessoListaChecagem SET parecer = ? " +
	                    		  "WHERE id = ?";

	               console.log('[%s] Alterando parecer: %s', idVistoria, parecer);

						dbMagic.executeSql(sql, [parecer, idVistoria], callback);
					},
					DAO.erro
				);
			}
		},

		deletar: {
			processoListaChecagem : function(id, callback){
				DAO.db.transaction(
					function(dbMagic){
						var sql = "DELETE FROM ProcessoListaChecagem " +
	                    		  "WHERE id = ?";

	                    console.log("[ProcessoListaChecagem] Deletando.. %s", id);
						dbMagic.executeSql(sql, [id], callback);
					},
					DAO.erro
				);
			},

			processoListaChecagem_PorProcesso : function(id, callback){
				DAO.db.transaction(
					function(dbMagic){
						var sql = "DELETE FROM ProcessoListaChecagem " +
	                    		  "WHERE processo_id = ?";

	                    console.log("[ProcessoListaChecagem] Deletando com processo_id.. %s", id);
						dbMagic.executeSql(sql, [id], callback);
					},
					DAO.erro
				);
			},

			processoListaChecagem_naoConformidade : function(id, callback){
				DAO.db.transaction(
					function(dbMagic){
						var sql = "DELETE FROM ProcessoListaChecagem_NaoConformidade " +
	                    		  "WHERE id = ?";

	                    console.log("[ProcessoListaChecagem_NaoConformidade] Deletando.. %s", id);
						dbMagic.executeSql(sql, [id]);
					},
					DAO.erro
				);
			},

			processoListaChecagem_naoConformidade_PorProcessoListaChecagem : function(id, callback){
				DAO.db.transaction(
					function(dbMagic){
						var sql = "DELETE FROM ProcessoListaChecagem_NaoConformidade " +
	                    		  "WHERE processoListaChecagem_id = ?";

	                    console.log("[ProcessoListaChecagem_NaoConformidade] Deletando com idProcessoListaChecagem.. %s", id);
						dbMagic.executeSql(sql, [id], callback);
					},
					DAO.erro
				);
			},

			processoListaChecagem_naoConformidade_PorProcesso : function(id, callback){
				DAO.db.transaction(
					function(dbMagic){
						var sql = "DELETE FROM ProcessoListaChecagem_NaoConformidade " +
	                    		  "WHERE processoListaChecagem_id IN " +
	                    		  "(SELECT id FROM ProcessoListaChecagem WHERE processo_id = ?)";

	                    console.log("[ProcessoListaChecagem_NaoConformidade] Deletando com idProcesso.. %s", id);
						dbMagic.executeSql(sql, [id], callback);
					},
					DAO.erro
				);
			}
		},

		inserir: {
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
					
					callback();
				});
			},

			itemChecagem: function(itemChecagem, callback){
				DAO.jaExiste('ItemChecagem', itemChecagem.id, function(existe){
					if(!existe){
						DAO.db.transaction(
							function(dbMagic){
								var sql =
				                    "INSERT INTO ItemChecagem (id, ativo, nome, equipamento_id) " +
				                    "VALUES (?, ?, ?, ?)";

								dbMagic.executeSql(sql, [itemChecagem.id, itemChecagem.ativo, itemChecagem.nome, itemChecagem.equipamento.id]);
							},
							function(dbMagic){
								DAO.erro(dbMagic, 'Inserindo item checagem');
							}
						);
					}

					callback();
				});
			},

			naoConformidade: function(naoConformidade, idItemChecagem){
				DAO.jaExiste('NaoConformidade', naoConformidade.id, function(existe){
					if(!existe){
						DAO.db.transaction(
							function(dbMagic){
								var sql =
				                    "INSERT INTO NaoConformidade (id, nome, parecer, itemChecagem_id) " +
				                    "VALUES (?, ?, ?, ?)";

								dbMagic.executeSql(sql, [naoConformidade.id, naoConformidade.nome, naoConformidade.parecer, idItemChecagem]);
							},
							function(dbMagic){
								DAO.erro(dbMagic, 'Inserindo não conformidade');
							}
						);
					}
				});
			},

			processoListaChecagem: function(processoListaChecagem, idProcesso){
				DAO.db.transaction(
					function(dbMagic){
						var sql =
		                    "INSERT INTO ProcessoListaChecagem (id, nomeItemChecagem, resultado1, resultado2, observacao, parecer, itemChecagem_id, equipamento_id, processo_id) " +
		                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

		            	processoListaChecagem.observacao = processoListaChecagem.observacao ? processoListaChecagem.observacao : '';
		            	processoListaChecagem.parecer = processoListaChecagem.parecer ? processoListaChecagem.parecer : '';

						dbMagic.executeSql(sql, [
							processoListaChecagem.id, processoListaChecagem.nomeItemChecagem, processoListaChecagem.resultado1,
							processoListaChecagem.resultado2, processoListaChecagem.observacao, processoListaChecagem.parecer,
							processoListaChecagem.itemChecagem.id, processoListaChecagem.CODEQUIPAMENTO, idProcesso
						]);
					},
					function(dbMagic){
						DAO.erro(dbMagic, 'Inserindo processo lista checagem');
					}
				);
			},

			processoListaChecagem_naoConformidade: function(idProcessoListaChecagem, idNaoConformidade, numeroNaoConformidade, callback){
				DAO.db.transaction(
					function(dbMagic){
						var sql =
		                    "INSERT INTO ProcessoListaChecagem_NaoConformidade (numeroNaoConformidade, processoListaChecagem_id, naoConformidade_id) " +
		                    "VALUES (?, ?, ?)";

						dbMagic.executeSql(sql, [numeroNaoConformidade, idProcessoListaChecagem, idNaoConformidade], function(dbMagic, resultado){
							if(callback)
								callback(resultado.insertId);
						});
					},
					function(dbMagic){
						DAO.erro(dbMagic, 'Inserindo processo lista checagem - não conformidade');
					}
				);
			}
		}
	};

	return self.querys;
});