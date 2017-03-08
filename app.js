process.env.GOPATH = __dirname;

var fs = require('fs');
var Ibc1 = require('ibm-blockchain-js'); // doc https://github.com/IBM-Blockchain/ibm-blockchain-js#ibcjs
var ibc = new Ibc1();

var peers;
var users;
var chaincode = null;

init();
//despliegaUObtieneChaincode(prefer_type1_users(users));
consultaPersona(prefer_type1_users(users));
//registraPersona(prefer_type1_users(users));
//creaNodo(prefer_type1_users(users));
//obtieneNodo(prefer_type1_users(users));

//Lee los peers y los usuarios especificados en ServiceCredentials.json
function init() {
	var manual = JSON.parse(fs.readFileSync(__dirname + '/ServiceCredentials.json', 'utf8'));
	peers = manual.peers;
	console.log('Cargando Peers...');
	if(manual.users) users = manual.users;
	console.log('Cargando Usuarios...');
}

//Despliega chaincode en blockchain
function despliegaUObtieneChaincode(serviceCredentials, cb){

	options = 	{
					network:{
						peers: [peers[0]], //Peer a utilizar para ejecutar el despliegue del chaincode
						users: serviceCredentials, //Credenciales a utilizar para ejecutar el despliegue del chaincode
						options: {
									quiet: true,
									tls: detect_tls_or_not(peers),
									maxRetry: 1
								 }
					},
					chaincode:{
						zip_url: 'https://github.com/papash/demoblockchain/raw/master/ejemploServicioRegistraNodo.zip',
						unzip_dir: 'src/chaincode',
						git_url: 'https://github.com/papash/demoblockchain',
						deployed_name: '3f703b6a087a478b8a8790f5abcf7d0bdeebfa9c218860ae6fe835ce28255fb3fb66dd728be63281faa484b13bdf924a90121d85dbc05426cf42d4c7089fa029'
					}
				};

	//Desplegamos el chaincode
	ibc.load(options, function (err, cc){
		if(err != null){
			console.log('No se pudo desplegar el chaincode.\n', err);
			if(!process.error) process.error = {type: 'load', msg: err.details};
		}
		else{
			chaincode = cc;

			//Si se especifico 'deployed_name' en 'options' se asume que ya tenemos un chaincode desplegado,
			//de lo contrario desplegamos el chaincode.
			if(!cc.details.deployed_name || cc.details.deployed_name === ''){
				cc.deploy('init', ["ful123","{\"nombre\":\"Fulanito\",\"ap_pat\":\"Perengano\",\"comp_dom\":\"Base64 del documento\"}"], {delay_ms: 60000}, function(e){
					console.log("Revisar en bluemix si se desplego el chaincode...")
				});
			}
			else{
				console.log('Chaincode ya se ha desplegado anteriormente...');
			}

			//Mandamos a llamar a la funcion de callback, si aplica.
			if(cb){
				cb();
			}
		}
	});
}

//Consulta la informacion de una persona
function consultaPersona(serviceCredentials){
	despliegaUObtieneChaincode(serviceCredentials, function (){
		console.log('Consultando...');

		//TODO - Autenticar al nodo que quiere hacer la consulta
		//var pass = obtieneNodo("ban123")
		//if(passNodo = pass){

		chaincode.query.read(["jma123"], function(e, persona) {
			if(e != null) console.log('No se pudo obtener la persona:', e);
			else {
				if(persona) console.log(persona);
			}
		});

		//}
		//else{
		//   console.log('Usuario / Password incorrectos...');
		//}
	});
}

//Registra la informacion de una persona
function registraPersona(serviceCredentials){
	despliegaUObtieneChaincode(serviceCredentials, function (){
		console.log('Registrando Persona...');

		//TODO - Autenticar al nodo que quiere hacer la consulta
		//var pass = obtieneNodo("ban123")
		//if(passNodo = pass){

			chaincode.invoke.nuevo(["jma123","{\"nombre\":\"Jorge\",\"ap_pat\":\"Miramontes\",\"comp_dom\":\"Base64 del documento\"}"], function(e, persona) {
						if(e != null) console.log('No se pudo obtener la persona:', e);
						else {
							if(persona) console.log(persona);
						}
			});

		//}
		//else{
		//   console.log('Usuario / Password incorrectos...');
		//}
	});
}

//Registra nodos en la red de blockchain.
function creaNodo(serviceCredentials) {
	despliegaUObtieneChaincode(serviceCredentials, function (){
		console.log('Registrando Nodo...');
		chaincode.invoke.nuevo(["ban123","{\"password\":\"bano789\"}"], function(e, nodo) {
					if(e != null) console.log('No se pudo obtener el nodo:', e);
					else {
						if(nodo) console.log(nodo);
					}
		});
	});
}

//Consulta la informacion de una persona
function obtieneNodo(serviceCredentials){
	despliegaUObtieneChaincode(serviceCredentials, function (){
		console.log('Consultando Nodo...');
		chaincode.query.read(["ban123"], function(e, nodo) {
					if(e != null) console.log('No se pudo obtener el nodo:', e);
					else {
						if(nodo) console.log(nodo);
					}
		});
	});
}


// ============================================================================================================================
// Funciones de Utileria
// ============================================================================================================================


//filter for type1 users if we have any
function prefer_type1_users(user_array){
	var ret = [];
	for(var i in users){
		if(users[i].enrollId.indexOf('type1') >= 0) {	//gather the type1 users
			console.log("users[i]: " + JSON.stringify(users[i]));
			ret.push(users[i]);
		}
	}

	if(ret.length === 0) ret = user_array;				//if no users found, just use what we have
	return ret;
}

//see if peer 0 wants tls or no tls
function detect_tls_or_not(peer_array){
	var tls = false;
	if(peer_array[0] && peer_array[0].api_port_tls){
		if(!isNaN(peer_array[0].api_port_tls)) tls = true;
	}
	return tls;
}

function getArgs(request) {
    var args = [];
    for (var i = 0; i < request.args.length; i++) {
        args.push(request.args[i]);
    }
    return args;
}