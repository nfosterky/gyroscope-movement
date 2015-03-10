var SECOND = 1000;

// multiply by second = hundred microseconds
var dt = 0.1,
    period = dt * SECOND;

var top = 0;

var alphaR, betaR, gammaR;

function convertDegreesToRadians (degrees) {
  return degrees * (Math.PI / 180);
}

function initGyro() {
  var x, y, z;

  var xaxis = 0;

  // set frequency of measurements in milliseconds
  gyro.frequency = period;

  gyro.startTracking(function(o) {
    var u_k,
        accelWithoutGravity,
        position,
        linearVelocity,
        angularVelocity,
        linearAccel,
        lvX, lvY, lvZ, avX, avY, avZ

    // if zero-velocity constraint is applicable
    var tol = 0.15,
        sigma2velUpdate = 0.0001;

    var z_k, R_k, H_k;

    if (o.x !== null) {
      ax = parseFloat(o.x.toFixed(5));
      ay = parseFloat(o.y.toFixed(5));
      az = parseFloat(o.z.toFixed(5));

      // angular rotation velocity

      alphaR = convertDegreesToRadians(
        parseFloat(o.alphaR.toFixed(5))
      ); // Z

      betaR = convertDegreesToRadians(
        parseFloat(o.betaR.toFixed(5))
      );  // X

      gammaR = convertDegreesToRadians(
        parseFloat(o.gammaR.toFixed(5))
      ); // Y

      // update changes to F matrix
      F_k.elements[3][4] = dt *  alphaR;
      F_k.elements[3][5] = dt * -gammaR;

      F_k.elements[4][3] = dt * -alphaR;
      F_k.elements[4][5] = dt *  betaR;

      F_k.elements[5][3] = dt *  gammaR;
      F_k.elements[5][4] = dt * -betaR;

      KM.F_k = F_k;

      // needs comment
      u_k = $V([ax, ay, az]);

      KM.predict(u_k);

      accelWithoutGravity = u_k;
      position = $V(KM.x_k.elements.slice(0,3));

      linearVelocity = $V(KM.x_k.elements.slice(3,6));
      lvX = linearVelocity.elements[0];
      lvY = linearVelocity.elements[1];
      lvZ = linearVelocity.elements[2];

      // if angular velocity is predictable, it could be used to prevent
      // false positive linear movement
      angularVelocity = $V([betaR, gammaR, alphaR]);
      // avX = angularVelocity.elements[0];
      // avY = angularVelocity.elements[1];
      // avZ = angularVelocity.elements[2];

      // z movement
      if (lvZ > 0.5) {
        move.forward = true;

      } else {
        move.forward = false;
      }

      if (lvZ < -0.5) {
        move.back = true;

      } else {
        move.back = false;
      }

      // y movement
      if (lvX > 0.5) {
        move.up = true;

      } else {
        move.up = false;
      }

      if (lvX < -0.5) {
        console.log("down");
        move.down = true;

      } else {
        move.down = false;
      }

      // x movement
      // if (lvY > 0.5) {
      //   move.right = true;
      //
      // } else {
      //   move.right = false;
      // }
      //
      // if (lvY < -0.5) {
      //   move.left = true;
      //
      // } else {
      //   move.left = false;
      // }

      linearAccel = accelWithoutGravity.subtract(
        angularVelocity.cross(linearVelocity)
      );

      // if not much accel
      if (Math.abs(u_k.modulus()) < tol) {

        // apply zero-velocity constraint through an 'observation' of 0
        z_k = $V([0,0,0]);

        H_k = Matrix.Zero(3,3)
                .augment(Matrix.I(3))
                .augment(Matrix.Zero(3,3));

        R_k = Matrix.Diagonal([
          sigma2velUpdate, sigma2velUpdate, sigma2velUpdate
        ]);

        KM.update(new KalmanObservation(z_k, H_k, R_k));
      }
    }
  });
}

// State (3 initial velocities, 3 initial accl biases)
var x_0 = $V([0, 0, 0, 0, 0, 0, 0, 0, 0]);

// Covariance Matrix - uncertainity of state (initial error?)
var initPositionVariance = 0.001,
    initVelocityVariance = 0.001,
    initBiasVariance = 0;

var P_0 = Matrix.Diagonal([
  initPositionVariance, initPositionVariance, initPositionVariance,
  initVelocityVariance, initVelocityVariance, initVelocityVariance,
  initBiasVariance, initBiasVariance, initBiasVariance
]);

// Transition Matrix - how each variable is updated, update each timestep
var numStateVars = 9,
    numInputVars = 3;

F_k = Matrix.I(numStateVars);

F_k.elements[0][3] = dt;
F_k.elements[1][4] = dt;
F_k.elements[2][5] = dt;

F_k.elements[3][6] = dt;
F_k.elements[4][7] = dt;
F_k.elements[5][8] = dt;

// ~ Control Matrix - converts external inputs for updating state
var B_k = Matrix.Zero(numStateVars, numInputVars); //$M([[0]]);

B_k.elements[3][0] = dt;
B_k.elements[4][1] = dt;
B_k.elements[5][2] = dt;

// Prediction Noise Matrix, weights for prediction step, previous matrices
var pSigmaSquared = .00005,    // change later ?
    vSigmaSquared = .00005,    // change later ?
    bSigmaSquared = .00005;    // change later ?

var Q_k = Matrix.Diagonal([
  pSigmaSquared, pSigmaSquared, pSigmaSquared,
  vSigmaSquared, vSigmaSquared, vSigmaSquared,
  bSigmaSquared, bSigmaSquared, bSigmaSquared
]);

var KM = new KalmanModel(x_0, P_0, F_k, B_k, Q_k);

initGyro();
