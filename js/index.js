var camera, scene, renderer, deviceControls, ground, clock;

var move = {
  right: false,
  left: false,
  forward: false,
  back: false
};

function initScene () {
  /*
   *  add landscape background
   *  src: http://www.charliedwyer.com/?p=543
   *  img: http://www.charliedwyer.com/wp-content/uploads/2012/02/
   *      360-degree-1st-day-xs.jpg
   */

  clock = new THREE.Clock();

  // create scene
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );

  // add light
  scene.add( new THREE.AmbientLight( 0x666666 ) );

  // create cylinder

  // CylinderGeometry(radiusTop, radiusBottom, height, radiusSegments,
  //     heightSegments, openEnded)
  var geometry = new THREE.CylinderGeometry( 500, 500, 237, 32, 1, true ),
    texture	= THREE.ImageUtils.loadTexture( "img/360-degree-1st-day-xxs.jpg" );

  var material = new THREE.MeshLambertMaterial({
    color : 0xFFFFFF,
    map : texture,
    side: THREE.BackSide
  });

  var cylinder = new THREE.Mesh( geometry, material );

  scene.add( cylinder );

   // add camera
   camera = new THREE.PerspectiveCamera( 45, window.innerWidth /
       window.innerHeight, 1, 2200 );

   camera.position.set( 0, 50, 0 );

   scene.add( camera );

   deviceControls = new THREE.DeviceOrientationControls( camera );

   var light = new THREE.PointLight( 0xaaddaa, .5 );
   light.position.set( 50, 1200, -500 );
   scene.add( light );

   groundTexture = THREE.ImageUtils.loadTexture(
       "img/moon.png" );

   groundTexture.anisotropy = 16;

   var groundMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff,
       specular: 0x111111, map: groundTexture } );

   ground = new THREE.Mesh( new THREE.PlaneBufferGeometry( 10000, 10000 ),
       groundMaterial );

   ground.position.y = -70;
   ground.rotation.x = -Math.PI / 2;
   camera.rotation.x = -Math.PI / 2;
   ground.receiveShadow = true;
   scene.add( ground );

   // add scene renderer
   renderer = new THREE.WebGLRenderer();
   renderer.setPixelRatio( window.devicePixelRatio );
   renderer.setSize( window.innerWidth, window.innerHeight );
   document.body.appendChild( renderer.domElement );

   animate();
}

function animate() {

  requestAnimationFrame( animate );

  deviceControls.update();

  movementUpdate();

  // TWEEN.update();

  renderer.render( scene, camera );

}

function movementUpdate () {
  var delta = clock.getDelta(); // seconds.
	var moveDistance = 200 * delta; // 200 pixels / second
	var rotateAngle = Math.PI / 2 * delta;   // pi/2 radians (90 degrees) / second

  if (move.forward) {
    camera.translateZ( -moveDistance );
  }

  if (move.back) {
    camera.translateZ( moveDistance );
    camera.translateY( moveDistance / 2 );
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

function initGyro () {

  // period in ms at which gyro should be updated
  gyro.frequency = 100;

  gyro.startTracking(function(o) {
    var gamma, beta;

    if (o.alpha && o.beta && o.gamma) {
      gamma = o.gamma.toFixed(2);   // X rotation
      beta = o.beta.toFixed(2);     // Z rotation

      move.right = beta <  175 && beta >  5;
      move.left  = beta > -175 && beta < -5;

      move.forward  = gamma < 0 && gamma > -80
      move.back     = gamma > 0 && gamma <  80;
    }
  });
}

initGyro();
initScene();
