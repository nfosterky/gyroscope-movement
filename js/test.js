var elmAlpha = document.getElementById("alpha"),
  elmBeta = document.getElementById("beta"),
  elmGamma = document.getElementById("gamma");

function initGyro () {
  var move = {};

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

      if (move.right) {
        elmBeta.innerText  = "right";

      } else if (move.left) {
        elmBeta.innerText  = "left";

      } else {
        elmBeta.innerText  = "hover";
      }

      if (move.back) {
        elmGamma.innerText = "back";

      } else if (move.forward) {
        elmGamma.innerText = "forward";

      } else {
        elmGamma.innerText = "hover";
      }

      // if (beta < 175 && beta > 5) {
      //   elmBeta.innerText  = "right";
      //
      // } else if (beta > -175 && beta < -5) {
      //   elmBeta.innerText  = "left";
      //
      // } else {
      //   elmBeta.innerText = "hover";
      // }
      //
      //
      // if (gamma > 0 && gamma < 80) {
      //   elmGamma.innerText = "back";
      //
      // } else if (gamma < 0 && gamma > -80) {
      //   elmGamma.innerText = "forward";
      //
      // } else {
      //   elmGamma.innerText = "hover";
      // }
    }
  });
}

initGyro();
