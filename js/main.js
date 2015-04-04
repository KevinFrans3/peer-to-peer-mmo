var keys = {
	left: false,
	right: false,
	up: false,
	down: false
}

var myId;
var friends = [];


var myFirebaseRef = new Firebase("https://peertopeermmo.firebaseio.com/");

var peer = new Peer({key: 'q6j1ayv7dyvz33di'});

peer.on('open', function(id) {
  console.log('My peer ID is: ' + id);
  myFirebaseRef.push({id: id});
  myId = id;
  peeridloaded();
});


peer.on('connection', function(conn) {
	console.log("recieved a conncetion");
	conn.on('data', function(data)
	{
  	    console.log('Received ' + data + " from id " + conn.peer);
  	    for(var i = 0; i < friends.length; i++)
  	    {
  	    	if(friends[i].id == conn.peer)
  	    	{
  	    		friends[i].cube.position.x = data.posx;
  	    		friends[i].cube.position.y = data.posy;
  	    		friends[i].cube.position.z = data.posz;
  	    		friends[i].cube.rotation.y = data.roty;
  	    	}
  	    }
	});
});


function peeridloaded()
{
	myFirebaseRef.on("child_added", function(snapshot) {
	  var newPost = snapshot.val();

	  if(newPost.id != myId)
	  {
	  	var friend = {};
	  	friend.id = newPost.id;
	  	friend.conn = peer.connect(newPost.id);
	  	var geometry = new THREE.BoxGeometry( 20, 20, 20 );
	  	var material = new THREE.MeshPhongMaterial( { color: 0x00ff00, specular: 0x050505 } );;
	  	friend.cube = new THREE.Mesh( geometry, material );
	  	friend.cube.castShadow = true;
	  	friend.cube.position.y = -33 + 10;
	  	friend.cube.receiveShadow = true;
	  	scene.add( friend.cube );
	  	friends.push(friend);

	  	friend.conn.on('open', function() {
	  		console.log("connected to " + newPost.id);

	  	  // Receive messages
	  	  friend.conn.on('data', function(data) {
	  	    console.log('Received', data);
	  	  });

	  	  // Send messages
	  	  // conn.send('Hello!');
	  	});
	  }
	});
}











var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 5000 );
camera.position.set( 0, 100, 250 );
camera.rotation.x = -100/360;

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry( 20, 20, 20 );
var material = new THREE.MeshPhongMaterial( { color: 0x00ff00, specular: 0x050505 } );;
var cube = new THREE.Mesh( geometry, material );
cube.castShadow = true;
cube.position.y = -33 + 10;
cube.receiveShadow = true;
scene.add( cube );
// cube.add(camera);

scene.fog = new THREE.Fog( 0xffffff, 1, 5000 );
scene.fog.color.setHSL( 0.6, 0, 1 );

hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
hemiLight.color.setHSL( 0.6, 1, 0.6 );
hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
hemiLight.position.set( 0, 500, 0 );
scene.add( hemiLight );

dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
dirLight.color.setHSL( 0.1, 1, 0.95 );
dirLight.position.set( -1, 1.75, 1 );
dirLight.position.multiplyScalar( 50 );
scene.add( dirLight );

dirLight.castShadow = true;

dirLight.shadowMapWidth = 2048;
dirLight.shadowMapHeight = 2048;

var d = 50;

dirLight.shadowCameraLeft = -d;
dirLight.shadowCameraRight = d;
dirLight.shadowCameraTop = d;
dirLight.shadowCameraBottom = -d;

dirLight.shadowCameraFar = 3500;
dirLight.shadowBias = -0.0001;
dirLight.shadowDarkness = 0.35;


var groundGeo = new THREE.PlaneBufferGeometry( 1000, 1000 );
var groundMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x050505 } );
groundMat.color.setHSL( 0.095, 1, 0.75 );

var ground = new THREE.Mesh( groundGeo, groundMat );
ground.rotation.x = -Math.PI/2;
ground.position.y = -33;
scene.add( ground );

ground.receiveShadow = true;

// SKYDOME

var vertexShader = document.getElementById( 'vertexShader' ).textContent;
var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
var uniforms = {
	topColor: 	 { type: "c", value: new THREE.Color( 0x0077ff ) },
	bottomColor: { type: "c", value: new THREE.Color( 0xffffff ) },
	offset:		 { type: "f", value: 33 },
	exponent:	 { type: "f", value: 0.6 }
}
uniforms.topColor.value.copy( hemiLight.color );

scene.fog.color.copy( uniforms.bottomColor.value );

var skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );
var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );

var sky = new THREE.Mesh( skyGeo, skyMat );
scene.add( sky );


renderer.setClearColor( scene.fog.color );
renderer.gammaInput = true;
renderer.gammaOutput = true;

renderer.shadowMapEnabled = true;
renderer.shadowMapCullFace = THREE.CullFaceBack;

function render() {
	requestAnimationFrame( render );
	renderer.render( scene, camera );

	calculateMovement(keys);

	// camera.position.y += 1;
	// cube.position.y -= 1;
}
render();









function calculateMovement(keysdown)
{
	if(keysdown.right)
	{
		cube.rotation.y += 15/360;
	}
	if(keysdown.left)
	{
		cube.rotation.y -= 15/360;
	}
	if(keysdown.up)
	{
		cube.translateZ( -3 );
	}
	if(keysdown.down)
	{
		cube.translateZ( 3 );
	}

	for(var i = 0; i < friends.length; i++)
	{
		var data = {
			posx: cube.position.x,
			posy: cube.position.y,
			posz: cube.position.z,
			roty: cube.rotation.y
		};
		friends[i].conn.send(data);
	}
}




$(document).keydown(function (evt) {
    if (evt.which == 16) {
        keys.shift = true;
    }
    if (evt.which == 37) {
        keys.left = true;
    }
    if (evt.which == 38) {
        keys.up = true;
    }
    if (evt.which == 39) {
        keys.right = true;
    }
    if (evt.which == 40) {
        keys.down = true;
    }
});

$(document).keyup(function (evt) {
    if (evt.which == 16) {
        keys.shift = false;
    }
    if (evt.which == 37) {
        keys.left = false;
    }
    if (evt.which == 38) {
        keys.up = false;
    }
    if (evt.which == 39) {
        keys.right = false;
    }
    if (evt.which == 40) {
        keys.down = false;
    }
});