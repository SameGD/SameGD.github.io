(function() {

  // Three.js Variables
  let loaderDiv = document.getElementById('js-loader');

  const canvas = document.querySelector('#c');
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  let model;
  const MODEL_PATH = '/assets/miku/miku.gltf';

  // Rigging Variables
  let bones = {};
  const videoElem = document.getElementById('video');

  // Pose Detection Variables
  const QuantBytes = 2;

  const MobileNetMultiplier = 0.50;
  const MobileNetStride = 16;
  const MobileNetInputResolution = 500;

  const ResNetMultiplier = 1.0;
  const ResNetStride = 32;
  const ResNetInputResolution = 250;

  let center;

  // Initialises Everything
  Init();

  function Init() {

    // Three.js Initialisation
    InitScene();
    InitRenderer();
    InitCamera();
    InitModel();
    InitLights();
    InitEnvironment();

    // Pose Detection Initalisation
    //InitVideo();
    InitPoseDetection();

  }

  // Three.js Initialisation Functions

  function InitScene() {

    // Set Scene properties
    let backgroundColor = 0xf1f1f1;
    scene.background = new THREE.Color(backgroundColor);
    scene.fog = new THREE.Fog(backgroundColor, 60, 100);

  }

  function InitRenderer() {

    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

  }

  function InitCamera() {

    // Set Camera Position
    camera.position.z = 30
    camera.position.x = 0;
    camera.position.y = -3

  }

  function InitModel() {

    // Initialise Model Loader
    let loader = new THREE.GLTFLoader()

    loader.load(MODEL_PATH, function(gltf) {

      // Sets the model to be the file we're loading in (Miku)
      model = gltf.scene;

      // Goes through the model, adding the bones to a dictionary (to be used for rigging), and setting the properties of the mesh
      model.traverse(o => {
        if (o.isBone) {
         console.log(o.name);
         bones[o.name] = o;
        }
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });

      // Set the models initial scale
      model.scale.set(2, 2, 2);
      model.position.y = -11;

      scene.add(model);
    },
    undefined, // We don't need this function
    function(error) {
      console.error(error);
    });

  }

  function InitLights() {

    let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    hemiLight.position.set(0, 50, 0);
    // Add hemisphere light to scene
    scene.add(hemiLight);

    let d = 8.25;
    let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
    dirLight.position.set(-8, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 1500;
    dirLight.shadow.camera.left = d * -1;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = d * -1;
    // Add directional Light to scene
    scene.add(dirLight);

  }

  function InitEnvironment() {

    // Floor
    let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
    let floorMaterial = new THREE.MeshPhongMaterial({
      color: 0xeeeeee,
      shininess: 0,
    });

    let floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -0.5 * Math.PI; // This is 90 degrees by the way
    floor.receiveShadow = true;
    floor.position.y = -11;
    scene.add(floor);

    // Pretty background sphere
    let geometry = new THREE.SphereGeometry(8, 32, 32);
    let material = new THREE.MeshBasicMaterial({ color: window.getComputedStyle(document.getElementsByTagName('nav')[0]).backgroundColor}); // 0xf2ce2e
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.z = -15;
    sphere.position.y = -2.5;
    sphere.position.x = -0.25;
    scene.add(sphere);

  }
  // Updates the renderer as things change
  function update() {

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(update);

  }

  update();

  // Lets the canvas / scene change as the page size changes
  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    let width = window.innerWidth;
    let height = window.innerHeight;

    let canvasPixelWidth = canvas.width / window.devicePixelRatio;
    let canvasPixelHeight = canvas.height / window.devicePixelRatio;

    const needResize =
      canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {
      renderer.setSize(width, height, false);

      // Resize the video element,

      videoElem.width = window.innerWidth;
      videoElem.height = window.innerHeight;
      center = null;
    }
    return needResize;
  }

  // Pose Detection Related Functions

  function detectPoseInRealTime(video, net) {
    // since images are being fed from a webcam, we want to feed in the
    // original image and then just flip the keypoints' x coordinates. If instead
    // we flip the image, then correcting left-right keypoint pairs requires a
    // permutation on all the keypoints.
    const flipPoseHorizontal = true;

    async function poseDetectionFrame() {

        let poses = [];
        let minPoseConfidence;
        let minPartConfidence;

        const pose = await net.estimatePoses(video, {
          flipHorizontal: flipPoseHorizontal,
          decodingMethod: 'single-person'
        });
        poses = poses.concat(pose);
        minPartConfidence = 0.6;

        // For each pose (i.e. person) detected in an image, loop through the poses
        // and draw the resulting skeleton and keypoints if over certain confidence
        // scores
        poses.forEach(({score, keypoints}) => {
          if (score >= minPartConfidence) {

            // Set center of the screen

            if (!center) {
              center = keypoints[0].position;
              console.log(center);
            }


            moveHead(keypoints[0].position);

            //moveLeftJoint(keypoints[5].position, keypoints[7].position, bones["Hairband_L_Armature"], ) //Left Leg -> Left Shoulder, Left Elbow
            //moveRightJoint(keypoints[6].position, keypoints[8].position, bones["Hairband_R_Armature"]) //Right Leg -> Right Shoulder, Right Elbow


            moveTheJoint(keypoints[5].position, keypoints[7].position, bones["Leg_L_Armature"], 180, 360) //Left Leg -> Left Shoulder, Left Elbow
            moveTheJoint(keypoints[6].position, keypoints[8].position, bones["Leg_R_Armature"], 180, 360) //Right Leg -> Right Shoulder, Right Elbow

            moveTheJoint(keypoints[7].position, keypoints[9].position, bones["Knee_L_Armature"], 180, 0) // Left Ankle
            moveTheJoint(keypoints[8].position, keypoints[10].position, bones["Knee_R_Armature"], 180, 0) // Right Ankle

            //moveLimb(keypoints[5].position, bones["Hairband_L_Armature"]);
            // moveLimb(keypoints[6].position, bones["Hairband_R_Armature"]);

            //moveLimb(keypoints[5].position, bones["Root_L_Armature"]); // Left Shoulder
            //moveLimb(keypoints[6].position, bones["Root_R_Armature"]); // Right Shoulder

            //moveLimb(keypoints[7].position, bones["Leg_L_Armature"]) // Left Elbow
            //moveLimb(keypoints[8].position, bones["Leg_R_Armature"]) // Right Elbow

            //moveLimb(keypoints[9].position, bones["Knee_L_Armature"]) // Left Knee
            //moveLimb(keypoints[10].position, bones["Knee_R_Armature"]) // Right Knee

            //moveJoint(keypoints[0].position, bones["Head_Armature"], 360) // Nose

            //moveJoint(keypoints[5].position, bones["Hairband_L_Armature"], 360) // Left Shoulder
            //moveJoint(keypoints[6].position, bones["Hairband_R_Armature"], 360) // Right Shoulder

            //moveJoint(keypoints[5].position, bones["Root_L_Armature"], 360) // Left Shoulder
            //moveJoint(keypoints[6].position, bones["Root_R_Armature"], 360) // Right Shoulder

            // moveJoint(keypoints[7].position, bones["Leg_L_Armature"], 360) // Left Elbow
            // moveJoint(keypoints[8].position, bones["Leg_R_Armature"], 360) // Right Elbow
            //
            // moveJoint(keypoints[9].position, bones["Knee_L_Armature"], 360) // Left Knee
            // moveJoint(keypoints[10].position, bones["Knee_R_Armature"], 360) // Right Knee


          }
        });

        requestAnimationFrame(poseDetectionFrame);
      }

      poseDetectionFrame();
  }

  async function InitVideo() {

    navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
          'Browser API navigator.mediaDevices.getUserMedia not available');
    }

    videoElem.width = window.innerWidth;
    videoElem.height = window.innerHeight;

    const stream = await navigator.mediaDevices.getUserMedia({
      'audio': false,
      'video': {
        facingMode: 'user',
        width: window.innerWidth,
        height:  window.innerHeight,
      },
    });

    videoElem.srcObject = stream;

    return new Promise((resolve) => {
      videoElem.onloadedmetadata = () => {
        resolve(videoElem);
      };
    });
  }

  async function InitPoseDetection() {
    const net = await posenet.load({
      architecture: 'ResNet50',
      outputStride: 32,
      inputResolution: { width: 257, height: 200 },
      quantBytes: 2
    });

    let video;

    try {
      video = await InitVideo();
    } catch (e) {
      throw e;
    }

    detectPoseInRealTime(video, net);
    loaderDiv.remove();
  }

  function moveJoint(position, joint, degreeLimit) {
    //let degrees = getMouseDegrees(mouse.x * 0.2, mouse.y * 0.2, degreeLimit);

    //degreeX = (position.x - joint.position.x)
    //degreeY = (position.y - joint.position.y)
    //console.log("X: " + joint.position.x);
    //console.log("Y: " + degreeY);

    //joint.rotation.y = THREE.Math.degToRad(degreeX);
    //joint.rotation.x = THREE.Math.degToRad(degreeY);

    //joint.position.x = position.y * 0.002
    //joint.position.y = position.x * 0.002

    let w = { x: window.innerWidth, y: window.innerHeight };

  }

  function moveHead(position) {
    let head = bones["Head_Armature"];
    let dx = 0,
        dy = 0,
        xdiff,
        xPercentage,
        ydiff,
        yPercentage;
    let x = position.x;
    let y = position.y;
    let w = { x: window.innerWidth, y: window.innerHeight };

    // 1. If head is in the left half of screen
   if (x <= w.x / 2) {
     // 2. Get the difference between middle of screen and head position
     xdiff = w.x / 2 - x;
     // 3. Find the percentage of that difference (percentage toward edge of screen)
     xPercentage = (xdiff / (w.x / 2)) * 100;
     // 4. Convert that to a percentage of the maximum rotation we allow for the head
     dx = ((90 * xPercentage) / 100) * -1; }

 // Right (Rotates head right between 0 and degreeLimit)
   if (x >= w.x / 2) {
     xdiff = x - w.x / 2;
     xPercentage = (xdiff / (w.x / 2)) * 100;
     dx = (90 * xPercentage) / 100;
   }
   // Up (Rotates head up between 0 and -degreeLimit)
   if (y <= w.y / 2) {
     ydiff = w.y / 2 - y;
     yPercentage = (ydiff / (w.y / 2)) * 100;
     dy = ((360 * yPercentage) / 100) * -1;
     }

   // Down (Rotates head down between 0 and degreeLimit)
   if (y >= w.y / 2) {
     ydiff = y - w.y / 2;
     yPercentage = (ydiff / (w.y / 2)) * 100;
     dy = (360 * yPercentage) / 100;
   }

   head.rotation.y = THREE.Math.degToRad(dx);
   head.rotation.x = THREE.Math.degToRad(dy);

  }

  function moveTheJoint(Point1, Point2, Joint, XRotLim, YRotLim) {
    let dx = 0,
        dy = 0,
        xdiff,
        xPercentage,
        ydiff,
        yPercentage;
    let x = Point2.x;
    let y = Point2.y;
    let w = { x: Point1.x, y: Point1.y };

    // 1. If limb is in on the left
   if (x <= w.x) {
     // 2. Get the difference between two positions
     xdiff = w.x - x;
     // 3. Find the percentage of that difference
     xPercentage = (xdiff / (w.x)) * 100;
     // 4. Convert that to a percentage of the maximum rotation we allow for the joint
     dx = ((YRotLim * xPercentage) / 100) * -1;
   }

  // Right (Rotates limb right between 0 and degreeLimit)
   if (x >= w.x) {
     xdiff = x - w.x;
     xPercentage = (xdiff / (w.x)) * 100;
     dx = ((YRotLim * xPercentage) / 100);
   }

   // Up (Rotates leg up between 0 and -degreeLimit)
   if (y <= w.y) {
     ydiff = w.y - y;
     yPercentage = (ydiff / (w.y)) * 100;
     dy = ((XRotLim * yPercentage) / 100) * -1;
     }

   // Down (Rotates leg down between 0 and degreeLimit)
   if (y >= w.y) {
     ydiff = y - w.y;
     yPercentage = (ydiff / (w.y)) * 100;
     dy = ((XRotLim * yPercentage) / 100);
   }

   Joint.rotation.y = THREE.Math.degToRad(dx);
   Joint.rotation.x = THREE.Math.degToRad(dy);
  }

  function moveLeftJoint(Point1, Point2, Joint, XRotLim, YRotLim) {
    let dx = 0,
        dy = 0,
        xdiff,
        xPercentage,
        ydiff,
        yPercentage;
    let x = Point2.x;
    let y = Point2.y;
    let w = { x: Point1.x, y: Point1.y };


   // 1. Get the difference between two positions
   xdiff = w.x - x;
   // 2. Find the percentage of that difference
   xPercentage = (xdiff / (w.x)) * 100;
   // 3. Convert that to a percentage of the maximum rotation we allow for the joint
   dx = ((YRotLim * xPercentage) / 100);

   // Up (Rotates leg up between 0 and -degreeLimit)
   if (y <= w.y) {
     ydiff = w.y - y;
     yPercentage = (ydiff / (w.y)) * 100;
     dy = ((XRotLim * yPercentage) / 100) * -1;
     }

   // Down (Rotates leg down between 0 and degreeLimit)
   if (y >= w.y) {
     ydiff = y - w.y;
     yPercentage = (ydiff / (w.y)) * 100;
     dy = ((XRotLim * yPercentage) / 100);
   }

   Joint.rotation.y = THREE.Math.degToRad(dx);
   Joint.rotation.x = THREE.Math.degToRad(dy);
  }

  function moveRightJoint(Point1, Point2, Joint, XRotLim, YRotLim) {
    let dx = 0,
        dy = 0,
        xdiff,
        xPercentage,
        ydiff,
        yPercentage;
    let x = Point2.x;
    let y = Point2.y;
    let w = { x: Point1.x, y: Point1.y };

    xdiff = x - w.x;
    xPercentage = (xdiff / (w.x)) * 100;
    dx = (YRotLim * xPercentage) / 100;

   // Up (Rotates up between 0 and -degreeLimit)
   if (y <= w.y) {
     ydiff = w.y - y;
     yPercentage = (ydiff / (w.y)) * 100;
     dy = ((XRotLim * yPercentage) / 100) * -1;
     }

   // Down (Rotates down between 0 and degreeLimit)
   if (y >= w.y) {
     ydiff = y - w.y;
     yPercentage = (ydiff / (w.y)) * 100;
     dy = ((XRotLim * yPercentage) / 100);
   }

   Joint.rotation.y = THREE.Math.degToRad(dx);
   Joint.rotation.x = THREE.Math.degToRad(dy);
  }

  function moveLimb(position, limb) {
    let dx = 0,
        dy = 0,
        xdiff,
        xPercentage,
        ydiff,
        yPercentage;
    let x = position.x;
    let y = position.y;
    let w = { x: center.x, y: center.y };

    // 1. If limb is in the left half of screen
   if (x <= w.x / 2) {
     // 2. Get the difference between middle of screen and head position
     xdiff = w.x / 2 - x;
     // 3. Find the percentage of that difference (percentage toward edge of screen)
     xPercentage = (xdiff / (w.x / 2)) * 100;
     // 4. Convert that to a percentage of the maximum rotation we allow for the head
     dx = ((180 * xPercentage) / 100) * -1; }

 // Right (Rotates head right between 0 and degreeLimit)
   if (x >= w.x / 2) {
     xdiff = x - w.x / 2;
     xPercentage = (xdiff / (w.x / 2)) * 100;
     dx = (180 * xPercentage) / 100;
   }
   // Up (Rotates head up between 0 and -degreeLimit)
   if (y <= w.y / 2) {
     ydiff = w.y / 2 - y;
     yPercentage = (ydiff / (w.y / 2)) * 100;
     dy = ((180 * yPercentage) / 100) * -1;
     }

   // Down (Rotates head down between 0 and degreeLimit)
   if (y >= w.y / 2) {
     ydiff = y - w.y / 2;
     yPercentage = (ydiff / (w.y / 2)) * 100;
     dy = (180 * yPercentage) / 100;
   }

   limb.rotation.y = THREE.Math.degToRad(dx);
   limb.rotation.x = THREE.Math.degToRad(dy);
  }

  function getMouseDegrees(x, y, degreeLimit) {
    let dx = 0,
        dy = 0,
        xdiff,
        xPercentage,
        ydiff,
        yPercentage;

    let w = { x: window.innerWidth, y: window.innerHeight };

    // Left (Rotates neck left between 0 and -degreeLimit)

     // 1. If cursor is in the left half of screen
    if (x <= w.x / 2) {
      // 2. Get the difference between middle of screen and cursor position
      xdiff = w.x / 2 - x;
      // 3. Find the percentage of that difference (percentage toward edge of screen)
      xPercentage = (xdiff / (w.x / 2)) * 100;
      // 4. Convert that to a percentage of the maximum rotation we allow for the neck
      dx = ((degreeLimit * xPercentage) / 100) * -1; }
  // Right (Rotates neck right between 0 and degreeLimit)
    if (x >= w.x / 2) {
      xdiff = x - w.x / 2;
      xPercentage = (xdiff / (w.x / 2)) * 100;
      dx = (degreeLimit * xPercentage) / 100;
    }
    // Up (Rotates neck up between 0 and -degreeLimit)
    if (y <= w.y / 2) {
      ydiff = w.y / 2 - y;
      yPercentage = (ydiff / (w.y / 2)) * 100;
      // Note that I cut degreeLimit in half when she looks up
      dy = (((degreeLimit * 0.5) * yPercentage) / 100) * -1;
      }

    // Down (Rotates neck down between 0 and degreeLimit)
    if (y >= w.y / 2) {
      ydiff = y - w.y / 2;
      yPercentage = (ydiff / (w.y / 2)) * 100;
      dy = (degreeLimit * yPercentage) / 100;
    }
    return { x: dx, y: dy };
  }

// End Main Function
})(); // Don't add anything below this line
