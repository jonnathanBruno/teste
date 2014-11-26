'use strict';

/* Factories */

bombeiros.factory('rota', function($navigate, $location, $routeParams) {
	return{
		pagina: function(pagina) {
			$navigate.go('/' + pagina);
		},

		paginaAnterior: function(){
			if($navigate.current.path().indexOf("itemChecagem") > -1)
				$navigate.go($navigate.current.path().substr(0, $navigate.current.path().indexOf('/itemChecagem')));
			else if($navigate.current.path().indexOf("equipamento") > -1){
				$location.search('');
				$navigate.go($navigate.current.path().substr(0, $navigate.current.path().indexOf('/equipamento')));
			}
			else
				$navigate.go('/');
		},

		voltar: function(){
			history.back();
		},

		paginaVistoriadores: function() {
			$navigate.go('/vistoriadores');
		},

		paginaConfiguracoes: function() {
			$navigate.go('/configuracoes');
		},

		paginaVistorias: function(idVistoriador) {
			$navigate.go('/vistoriadores/' + idVistoriador + '/vistorias');
		},

		paginaEnviar: function(){
			$navigate.go('vistoriadores/' + $routeParams.idVistoriador + '/enviar');
		},
		
		paginaVistoria: function(idVistoria){
			$navigate.go($location.path() + '/' + idVistoria);
		},

		paginaImovel: function(){
			$navigate.go($location.path() + '/imovel');
		},

		paginaArquivos: function() {
			$navigate.go($location.path() + '/arquivos');
		},
		
		paginaEquipamento: function(idEquipamento, equipamento){
			$location.search('equipamento', equipamento);
			$navigate.go($location.path() + '/equipamento/' + idEquipamento);
		},
		
		paginaItemChecagem: function(idItemChecagem){
			$navigate.go($location.path() + '/itemChecagem/' + idItemChecagem);
		},

		parametros: $routeParams
	}
});

bombeiros.factory('metodosComuns', function() {
	return {
	
		data: function(timeStamp){
			var data = new Date(timeStamp);

			return data.getDate() + '/' + (data.getMonth() + 1) + '/' + data.getFullYear(); // toLocaleDateString toLocaleString toDateString
		},

		estadoVistoria: {
			undefined 		: 'naoConcluido',
			'OK' 			: 'concluidoConforme',
			'NAO_CONFORME' 	: 'concluidoNaoConforme'
		}
	};
});

bombeiros.factory('mensagens', function() {
	var self = this;

	self.ePlural = function(palavra){
		var ultimaLetra = palavra.charAt(palavra.length - 1);

		return ultimaLetra == 's';
	}

	self.transferencia = {
		carregando: function(operacao, elemento) {
			if (!operacao) operacao = 'Carregando';
			if (elemento) operacao += ' ' + baixando;

			return operacao + '..';
		},

		noFim: function(operacao, elemento) {
			if (!operacao) operacao = 'Carregamento completo';
			else if (elemento) operacao = elemento + ' ' + operacao;

			return operacao;
		},

		erro: function(operacao, elemento) {
			if (!operacao) operacao = 'Erro';
			else if (elemento)
				operacao = 'Erro ao ' + operacao + 'a' + (self.ePlurar(elemento) ? 's ' : ' ') + elemento;

			return operacao;
		}
	}

	return{
		conexao: function(estado) {
			return estado ? 'Conectado' : 'Sem sinal de rede';
		},

		transferencia: {
			baixar : {
				carregando: function(elemento) {
					return self.transferencia.carregando('baixando', elemento);
				},

				noFim: function(elemento, m) {
					var operacao;

					if(elemento){
						operacao = 'baixada';

						if(m) operacao = 'baixado';
						if(self.ePlural(elemento)) operacao += 's';
					}

					return self.transferencia.noFim(operacao, elemento);
				},

				erro: function(elemento) {
					if(self.ePlural(elemento)) operacao += 's';

					self.transferencia.erro('baixar', elemento);
				}
			},

			enviar : {
				carregando: function(elemento) {
					return self.transferencia.carregando('enviando', elemento);
				},

				noFim: function(elemento, m) {
					var operacao;

					if(elemento){
						operacao = 'enviada';

						if(m) operacao = 'enviado';
						if(self.ePlural(elemento)) operacao += 's';
					}

					return self.transferencia.noFim(operacao, elemento);
				},

				erro: function(elemento) {
					if(self.ePlural(elemento)) operacao += 's';

					self.transferencia.erro('enviar', elemento);
				}
			}
		}
	}
});

bombeiros.factory('teclado', function($rootScope){
   this.fechar = function(){ window.plugins.softkeyboard.hide(); }

   this.estaAberto = function(callback) {
      window.plugins.softkeyboard.isShowing(function(aberto){
         callback(aberto === 'true');
      });
   }   

   $rootScope.$on('eventoVoltar', this.fechar);

   return this;
});

bombeiros.factory('VistoriadorJSON', function($resource, $http, EnderecoHost, SistemaDeArquivo){
	var self = this;

	self.getChave = function(hash){
		var indiceS = hash.lastIndexOf("e"),
			posicao = parseInt(hash.substring(indiceS - 2, indiceS)),
			tamanho = parseInt(hash.substring(indiceS + 1, hash.length)),
			chave = parseInt(hash.substring(posicao, posicao + tamanho));

			return chave;
	}

	self.criarChave = function(palavra, chave){
		var hash = sha256_digest(chave),
			posicaoC = Math.floor((Math.random() * 54) + 1),
			posicaoS = Math.floor((Math.random() * 54) + 1);

			palavra += chave;

			while(posicaoC + palavra.toString().length >= hash.length - 4)
				posicaoC = Math.floor((Math.random() * 54) + 1);

			while(posicaoS + chave.toString().length >= hash.length - 4 || (posicaoS + chave.toString().length >= posicaoC &&
				posicaoS + chave.toString().length <= posicaoC + palavra.toString().length)){
				posicaoS = Math.floor((Math.random() * 54) + 1);
			}

			console.log("[C] Chave: %s - Posicao: %s - Tamanho: %s", palavra, posicaoC, palavra.toString().length);
			console.log("[S] Chave: %s - Posicao: %s - Tamanho: %s", chave, posicaoS, chave.toString().length);
			console.log(hash);
			hash = hash.replace(hash.substring(posicaoS, posicaoS + chave.toString().length), chave);
			console.log(hash);
			hash = hash.replace(hash.substring(hash.length - 6), chave.toString().length + "e" + posicaoS);
			console.log(hash);
			hash = hash.replace(hash.substring(posicaoC, posicaoC + palavra.toString().length), palavra);
			console.log(hash);
			hash = hash.concat(palavra.toString().length + "c" + posicaoC)
			console.log(hash);
			return hash;
	}

	return {
		login: function(matricula, senha, callback){
			matricula = 1695886;
			delete $http.defaults.headers.common['X-Requested-With'];
			$http.get(EnderecoHost + ':9000/ws/chave').success(function(chave){
				console.log('Chave');
				delete $http.defaults.headers.common['X-Requested-With'];
				return $http({
					method 		: 'POST',
		         	url 		: EnderecoHost + ":9000/ws/vistoriador/login",
		         	data 		: 'senha=' + sha256_digest(senha) + '&matricula=' + self.criarChave(matricula, self.getChave(chave)),
				   	headers 	: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }
				}).success(function(resposta, status) {
					console.log('Login');
					callback(resposta, status);
				}).error(function (resposta, status) {
					callback(resposta, status);
				});
			});
		},

		baixarVistoriadores: function(){
			delete $http.defaults.headers.common['X-Requested-With'];
			return $resource(EnderecoHost.get() + '\\:9000/ws/vistoriadores');
		},
		
		baixarVistorias: function(){
			delete $http.defaults.headers.common['X-Requested-With'];
			return $resource(EnderecoHost.get() + '\\:9000/ws/vistoriadores/:idVistoriador/vistorias');
		},

		baixarArquivo: function(idVistoriador, matriculaVistoriador, idVistoria, arquivo) {
			SistemaDeArquivo.baixarArquivo(
				EnderecoHost.get() + ':9000/ws/vistoriadores/' + idVistoriador + '/vistorias/' + idVistoria + '/arquivos/' + arquivo.id,
				matriculaVistoriador + '/' + idVistoria,
				null,
				arquivo.tipoDocumento.nome + '_' + arquivo.id + '.' + arquivo.tipoArquivo.toLowerCase()
			);
		},

		salvarVistoria: function(idVistoriador, vistoria){
			var vistoriaJSON = 'vistoria=\{"processo":' + JSON.stringify(vistoria) + '\}';

			delete $http.defaults.headers.common['X-Requested-With'];
			return $http({
	        	method 		: 'POST',
	         	url 		: EnderecoHost.get() + ":9000/ws/vistoriadores/" + idVistoriador + "/vistorias/" + vistoria.id,
	         	data 		: vistoriaJSON,
			   	headers 	: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }
			});
		}
	}
});

bombeiros.factory('SistemaDeArquivo', function() {
	var self = this;

	self.getFileSystemRoot = (function() {
        var root;
        
        var init = function() {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
                function(fileSystem) {
                    root = fileSystem.root;

                    root.getDirectory('vip', {create: true, exclusive: false});
                });
        };
        document.addEventListener("deviceready", init, true); 

        return function() {
            return root;
        };
    }());

    self.erro = function(msg, erro){
		console.log("[Erro] " + msg + ": " + erro.target.error.code);
	}

    return{
    	criarPasta 		: function(nome, callback) {
    		self.getFileSystemRoot().getDirectory('vip/' + nome, {create: true, exclusive: false}, function(dir) {
    			callback ? callback() : '';
    		}, function (erro) {
    			self.erro('[Erro] Ao criar a pasta ' + nome, erro);
    		});
    	},

    	removerPasta 	: function(pasta) {
    		self.getFileSystemRoot().getDirectory('vip/' + pasta, {}, function(dir) {
    			dir.removeRecursively(function() {
    				console.log('Pasta removida? ' + pasta);
    			}, function (erro) {
    				console.log('[Erro] Ao deletar a pasta ' + pasta);
    			});
    		}, function (erro) {
    			self.erro('[Erro] Ao abrir a pasta ' + erro);
    		});
    	},

    	baixarArquivo 	: function(url, pastaDestino, callback, nomeArquivo){
    		if(!nomeArquivo) nomeArquivo = url.substring(url.lastIndexOf('/') + 1);
		   
		   nomeArquivo = 'vip/' + pastaDestino + '/' + nomeArquivo;

	        self.getFileSystemRoot().getFile(nomeArquivo, {create: true, exclusive: false}, function(fileEntry) {
	            var pasta = fileEntry.fullPath;
	            var ft = new FileTransfer();

	            if (device.platform === "Android" && pasta.indexOf("file://") === 0)
	                pasta = pasta.substring(7);

	            ft.download(encodeURI(url), pasta, function(arquivo) {
	            	console.log('Baixou de boa.. ' + arquivo.fullPath);
	            }, function(erro) {
	            	console.log("[Erro] Na hora de baixar lá: " + erro.target + ' - ' + erro.source + ' - ' + erro.code);
	            }, true);

	            if(callback)
	            	callback();
	        }, function(erro){
	        	self.erro('Ao criar o arquivo ' + nomeArquivo, erro);
	        });
    	},

    	listarArquivos 	: function(pasta, callback) {
    		self.getFileSystemRoot().getDirectory('vip/' + pasta, {}, function(dir) {
    			var dirReader = dir.createReader();

    			dirReader.readEntries(function(nomeArquivos) {
    				var arquivos = [];

    				for (var i = nomeArquivos.length - 1; i >= 0; i--) {
    					dir.getFile(nomeArquivos[i].name, {create: false}, function(entradaArquivo) {
    						entradaArquivo.file(function(arquivo) {
	    						arquivos.push({
	    							nome 	: arquivo.name,
	    							tamanho : arquivo.size,
	    						});

	    						if(arquivos.length == nomeArquivos.length)
									callback(arquivos, dir.fullPath);
    						});
    					});
    				}
    			});
    		}, function (erro) {
    			self.erro('[Erro] Ao abrir a pasta ' + pasta, erro);
    		});
    	},

    	abrirArquivo 	: function(caminhoArquivo) {
    		var extensao = caminhoArquivo.substring(caminhoArquivo.lastIndexOf('.') + 1, caminhoArquivo.length),
			tipoArquivo = 'application/' + extensao;

			if(extensao == 'jpg' || extensao == 'png' || extensao == 'bmp' || extensao == 'tiff')
				tipoArquivo = tipoArquivo.replace('application', 'image');

			// caminhoArquivo = caminhoArquivo.replace('mnt/', '');

			window.plugins.webintent.startActivity({
				    action 	: window.plugins.webintent.ACTION_VIEW,
				    type 	: tipoArquivo,
				    url 	: caminhoArquivo
				},
				function() {},
				function() {
					console.log('[Erro] Ao abrir o arquivo: ' + caminhoArquivo);
				}
			);
    	}
    }
});

// bombeiros.factory('ArquivoTosco', function() {
// 	var self = this;

// 	self.getFileSystemRoot = (function() {
// 		console.log("Função tosca lá..");
//         // private
//         var root;
        
//         // one-time retrieval of the root file system entry
//         var init = function() {
//             window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
//                 function(fileSystem) {
//                     root = fileSystem.root;

//                     console.log('Root ' + root.fullPath)
//                     root.getDirectory('/data/data/org.ifrn.bombeirosMobile', {create: false, exclusive: false}, function(dir) {
//                     	console.log(dir.name);
//                     	console.log(dir.fullPath);
//                     }, function(erro) {
//                     	console.log('Erro.. =\\');
//                     	console.log(erro.code);
//                     });
//                 });
//         };
//         document.addEventListener("deviceready", init, true); 

//         // public function returns private root entry
//         return function() {
//             return root;
//         };
//     }());

//     return{
//     	salvar: 	function(nome, conteudo){
//     		console.log("Salvar..");

//     		var root = self.getFileSystemRoot(),
            
//             // writes a file
//             write_file = function(writer) {
//                 // write to file
//                 writer.write(conteudo);

//                 writer.onwrite = function(evt) {
//                 	console.log('Salvou..');
// 		            console.log(evt);
// 		        };
//             },
            
//             // creates a FileWriter object
//             create_writer = function(fileEntry) {
//                 fileEntry.createWriter(write_file, onFileSystemError);
//             },

//             onFileSystemError = function(){
//             	console.log('Erro');
//             };
            
//             // create a file and write to it
//             root.getFile(nome, {create: true}, create_writer, onFileSystemError);
//     	}
//     }
// });