// ephemeral.js
// scene where glitchy controls thrive
var QUARTER_CIRCLE_RADIANS = 1.57079633; // Math.PI / 2
var SCENE_HEIGHT = 1000;

// create scene, camera, one plane, light,
var camera, scene, renderer, deviceControls, ground;

var clock;

var lastBalloonReset = 0,
    balloons = [];

function init() {
  var light, groundTexture;

  clock = new THREE.Clock();

	scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );

  scene.add( new THREE.AmbientLight( 0x666666 ) );

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth /
      window.innerHeight, 1, 2000 );

  camera.position.set( 0, 100, 0 );
  // camera.lookAt(scene.position);

  deviceControls = new THREE.DeviceOrientationControls( camera );

  var light = new THREE.PointLight( 0xaaddaa, .5 );
  light.position.set( 50, 1200, -500 );
  scene.add( light );

  groundTexture = THREE.ImageUtils.loadTexture(
      "textures/Moon.png" );

  // groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
  // groundTexture.repeat.set( 432, 432 );
  groundTexture.anisotropy = 16;

  var groundMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff,
      specular: 0x111111, map: groundTexture } );

	ground = new THREE.Mesh( new THREE.PlaneBufferGeometry( 10000, 10000 ),
      groundMaterial );

	ground.position.y = -10;
	ground.rotation.x = -Math.PI / 2;
  camera.rotation.x = -Math.PI / 2;
	ground.receiveShadow = true;
	scene.add( ground );

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  startBalloons();
  makeHUD();
}

function animate() {

  requestAnimationFrame( animate );

  deviceControls.update();

  movementUpdate();

  TWEEN.update();

  renderer.render( scene, camera );

}

function startBalloons () {
  setInterval(function() {

    if (balloons.length < 50) {
      makeBalloon({
        x: 2000 * Math.random() - 1000,
        y: 0, //-200,
        z: 2000 * Math.random() - 1000
      });

    } else {
      resetBalloon();
    }

  }, 500);
}



/*
 *  make new balloon
 *  setBalloon()
 */
function makeBalloon (pos) {
  // make sphere
  var geometry = new THREE.SphereGeometry(15, 10, 10);

  var groundTexture = THREE.ImageUtils.loadTexture(
      "textures/Moon.png" );

  // TODO: random color
  var material = new THREE.MeshPhongMaterial({
    color: 0xaff00,
    map: groundTexture
  });

  var mesh = new THREE.Mesh( geometry, material );

  mesh.position.set(pos.x, pos.y, pos.z);

  balloons.push(mesh);

  scene.add(mesh);

  // tween up to top position
  var target = {
    x: pos.x,
    y: SCENE_HEIGHT,
    z: pos.z
  };

  doTween(pos, target, mesh, TWEEN.Easing.Cubic.Out, 25000)
}

function resetBalloon () {
  var b, pos, target;

  for (var i = lastBalloonReset; i < balloons.length; i++) {
    b = balloons[i];

    if (b.position.y === SCENE_HEIGHT) {
      target = {
        x: b.position.x,
        y: b.position.y,
        z: b.position.z
      };
      pos = {
        x: b.position.x,
        y: 0,
        z: b.position.z
      };

      doTween(pos, target, b, TWEEN.Easing.Cubic.In, 25000)
      break;
    }

    if (i + 1 === balloons.length) {
      lastBalloonReset = 0;
    }
  }
}

// animate item from start position, to target,
function doTween (position, target, obj, easing, time) {
  var tween = new TWEEN.Tween(position).to(target, time);

  tween.onUpdate(function(){
    obj.position.x = position.x;
    obj.position.y = position.y;
    obj.position.z = position.z;
  });

  tween.easing(easing);

  tween.start();
}

var move = {
  forward: false,
  back: false,
  left: false,
  right: false
};

function movementUpdate () {
  var delta = clock.getDelta(); // seconds.
	var moveDistance = 200 * delta; // 200 pixels / second
	var rotateAngle = Math.PI / 2 * delta;   // pi/2 radians (90 degrees) / second

  if (move.forward) {
    camera.translateZ( -moveDistance );
  }

  if (move.back) {
    camera.translateZ( moveDistance );
  }

  if (move.left) {
    camera.translateX( -moveDistance );
  }

  if (move.right) {
    camera.translateX( moveDistance );
  }

  if (move.up) {
    camera.translateY( moveDistance );
  }

  if (move.down) {
    camera.translateY( -moveDistance );
  }

}

function makeHUD () {
  var geometry = new THREE.SphereGeometry(15, 10, 10);

  var texture = THREE.ImageUtils.loadTexture(
      "textures/golfball.jpg" );

  var material = new THREE.MeshPhongMaterial({
    color: 0xaff00,
    map: texture
  });

  var huds = [];

  for (var i = 0; i < 6; i++) {
    huds[i] = new THREE.Mesh( geometry, material );
    huds[i].position.y =  100;
    scene.add(huds[i]);

  }

  var offset = 250;

  huds[0].position.z =  offset;
  huds[1].position.z = -offset;

  // huds[2].position.y =  100;
  // huds[3].position.y =  100;

  huds[4].position.x =  offset;
  huds[5].position.x = -offset;

  // huds.lookAt(camera.position);

  console.log("mesh", huds);
  console.log("camera", camera);
}

init();
animate();
