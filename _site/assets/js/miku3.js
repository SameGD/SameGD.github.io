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

      //videoElem.width = window.innerWidth;
      //videoElem.height = window.innerHeight;
      //center = null;
    }
    return needResize;
  }

  // Pose Detection Related Functions

  function detectPoseInRealTime(video, detector) {
    // since images are being fed from a webcam, we want to feed in the
    // original image and then just flip the keypoints' x coordinates. If instead
    // we flip the image, then correcting left-right keypoint pairs requires a
    // permutation on all the keypoints.

    async function poseDetectionFrame() {

        let poses = [];
        let minPoseConfidence;
        let minPartConfidence;
        let PosePositions = [];

        let timestamp = performance.now();

        const pose = await detector.estimatePoses(video, {
          flipHorizontal: true
        }, timestamp);
        poses = poses.concat(pose);
        minPartConfidence = 0.65;

        // For each pose (i.e. person) detected in an image, loop through the poses
        // and draw the resulting skeleton and keypoints if over certain confidence
        // scores

        poses.forEach(({score, keypoints3D}) => {
          if (score >= minPartConfidence) {

            PosePositions = [];

            // keypoints3D.forEach(({x,y,z}) => {
            //   PosePositions.push({
            //     x: x,
            //     y: y,
            //     z: z
            //   })
            // })


            keypoints3D.forEach(({x,y,z}) => {
              PosePositions.push([x,y,z])
            })

            // Uses index described in BlazePose documentation https://github.com/tensorflow/tfjs-models/tree/master/pose-detection

            const KeypointsDict = {
              nose: PosePositions[0],
              leftShoulder: PosePositions[11],
              rightShoulder: PosePositions[12],
              leftElbow: PosePositions[13],
              rightElbow: PosePositions[14],
              leftWrist: PosePositions[15],
              rightWrist: PosePositions[16],
            }

            // Add Neck Joint, which is the midpoint between the shoulders

            // let difference = KeypointsDict["leftShoulder"] - KeypointsDict["rightShoulder"];
            let difference = nj.divide(nj.subtract(KeypointsDict["leftShoulder"], KeypointsDict["rightShoulder"]), 2);
            //difference = difference / 2;

            //let neck = KeypointsDict["rightShoulder"] + difference;
            let neck = nj.add(KeypointsDict["rightShoulder"], difference);

            KeypointsDict["neck"] = neck.tolist();

            const hierarchy = {
              head: [],
              leftShoulder: ["head"],
              leftElbow: ["leftShoulder", "head"],
              rightShoulder: ["head"],
              rightElbow: ["rightShoulder", "head"]
            }

            // Set center of the screen

            if (!center) {
              center = PosePositions[0];
              console.log(PosePositions);
              console.log(KeypointsDict);
            }

            let RootRotation = GetRootRotation(KeypointsDict);

            // console.log(RootRotation);

            RotateJoint(bones["Head_Armature"], RootRotation);

            // let LeftShoulderRotation = getLeftShoulderRotation(KeypointsDict, RootRotation);

            // RotateJoint(bones["Leg_L_Armature"], LeftShoulderRotation);

            // moveHead(KeypointsDict["nose"]);

          //  moveTheJoint(keypoints[5].position, keypoints[7].position, bones["Leg_L_Armature"], 180, 360) //Left Leg -> Left Shoulder, Left Elbow
          //  moveTheJoint(keypoints[6].position, keypoints[8].position, bones["Leg_R_Armature"], 180, 360) //Right Leg -> Right Shoulder, Right Elbow

          //  moveTheJoint(keypoints[7].position, keypoints[9].position, bones["Knee_L_Armature"], 180, 0) // Left Ankle
          //  moveTheJoint(keypoints[8].position, keypoints[10].position, bones["Knee_R_Armature"], 180, 0) // Right Ankle

           // JointRotation(keypoints3D[12].position, keypoints3D[14].position, bones["Leg_L_Armature"], 180, 360) //Left Leg -> Left Shoulder, Left Elbow
           // JointRotation(keypoints3D[11].position, keypoints3D[13].position, bones["Leg_R_Armature"], 180, 360) //Right Leg -> Right Shoulder, Right Elbow
           //
           // JointRotation(keypoints3D[14].position, keypoints3D[16].position, bones["Knee_L_Armature"], 180, 0) // Left Ankle
           // JointRotation(keypoints3D[13].position, keypoints3D[21].position, bones["Knee_R_Armature"], 180, 0) // Right Ankle

           // JointRotation(PosePositions[12], PosePositions[14], bones["Leg_L_Armature"], 180, 360) //Left Leg -> Left Shoulder, Left Elbow
           // JointRotation(PosePositions[11], PosePositions[13], bones["Leg_R_Armature"], 180, 360) //Right Leg -> Right Shoulder, Right Elbow
           //
           // JointRotation(PosePositions[14], PosePositions[16], bones["Knee_L_Armature"], 180, 0) // Left Ankle
           // JointRotation(PosePositions[13], PosePositions[21], bones["Knee_R_Armature"], 180, 0) // Right Ankle

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

    videoElem.width = 640;
    videoElem.height = 480;

    const stream = await navigator.mediaDevices.getUserMedia({
      'audio': false,
      'video': {
        facingMode: 'user',
        width: 640,
        height:  480,
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

    const detectorConfig = {
      runtime: 'tfjs',
      enableSmoothing: true,
      modelType: 'full'
    };
    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.BlazePose, detectorConfig);

    let video;

    try {
      video = await InitVideo();
    } catch (e) {
      throw e;
    }

    detectPoseInRealTime(video, detector);
    loaderDiv.remove();
  }

  // I don't understand any of this math.

  function crossProduct(vectA, vectB) {

    let crossP = [];

    crossP[0] = vectA[1] * vectB[2] - vectA[2] * vectB[1];
    crossP[1] = vectA[2] * vectB[0] - vectA[0] * vectB[2];
    crossP[2] = vectA[0] * vectB[1] - vectA[1] * vectB[0];

    return crossP;
  }

  // These three functions do the opposite of the decompse function

  function getRx(theta) {
    let R = nj.array([
      [1, 0, 0],
      [0, Math.cos(theta), -Math.sin(theta)],
      [0, Math.sin(theta), Math.cos(theta)]
    ]);
    return R;
  }

  function getRy(theta) {
    let R = nj.array([
      [Math.cos(theta), 0, Math.sin(theta)],
      [0, 1, 0],
      [-Math.sin(theta), 0, Math.cos(theta)]
    ]);
    return R;
  }

  function getRz(theta) {
    let R = nj.array([
      [Math.cos(theta), -Math.sin(theta), 0],
      [Math.sin(theta), Math.cos(theta), 0],
      [0, 0, 1]
    ]);
    return R;
  }

  // function GetR(A, B) {
  //  // get unit vectors
  //  const uA = A/nj.sqrt(nj.sum(nj.square(A)));
  //  const uB = B/nj.sqrt(nj.sum(nj.square(B)));
  //
  //  let dotprod = nj.sum(uA * uB);
  //  let crossprod = nj.sqrt(nj.sum(nj.square(nj.cross(uA,uB)))); // Magnitude
  //
  //  // Get new unit vectors
  //
  //  let u = uA;
  //  let v = uB - dotprod*uA;
  //  v = v/nj.sqrt(nj.sum(nj.square(v)));
  //  let w = nj.cross(uA, uB);
  //  w = w/nj.sqrt(nj.sum(nj.square(w)));
  //
  //  // Get change of basis matrix
  //
  //  let C = nj.array([u, v, w]);
  //  let R_uvw = nj.array([
  //    [dotprod, -crossprod, 0],
  //    [crossprod, dotprod, 0],
  //    [0, 0, 1]
  //  ]);
  //
  //  let R = C.T
  //
  // }

  function Get_R2(A, B) {
    // Get unit vectors
    const uA = nj.divide(A, Math.sqrt(nj.sum(nj.power(A, 2))));
    const uB = nj.divide(B, Math.sqrt(nj.sum(nj.power(B, 2))));

    const v = nj.array(crossProduct(uA.tolist(), uB.tolist()));
    const s = Math.sqrt(nj.sum(nj.power(v, 2)));
    const c = nj.sum(nj.multiply(uA, uB));

    const vx = nj.array([[0, -v.get(2), v.get(1)],
                        [v.get(2), 0, -v.get(0)],
                        [-v.get(1), v.get(0), 0]]);

    // let eye = nj.array([
    //   [1, 0, 0],
    //   [0, 1, 0],
    //   [0, 0, 1]
    // ]);
    // nj.identity(3) does the same as np.eye(3)

    // const R = nj.add(nj.identity(3), nj.add(vx, nj.multiply(nj.multiply(vx, vx), nj.divide(nj.subtract(1, c), nj.power(s, 2)))));

    const R = nj.add(nj.add(nj.identity(3), vx), nj.multiply(nj.multiply(vx, vx), (1 - c) / Math.pow(s, 2)));

    return R;
  }

  function Decompose_R_ZYX(R) {
    // Decomposes as RzRyRx. Note the order: ZYX <- rotation by x first
    const thetaz = Math.atan2(R.get(1, 0), R.get(0, 0));
    const thetay = Math.atan2(-R.get(2, 0), Math.sqrt(Math.pow(R.get(2, 1), 2) + Math.pow(R.get(2, 2), 2)));
    const thetax = Math.atan2(R.get(2, 1), R.get(2, 2));

    return [thetaz, thetay, thetax];
  }

  function Decompose_R_ZXY(R) {
    // Decomposes as RzRXRy. Note the order: ZXY <- rotation by y first
    const thetaz = Math.atan2(-R.get(0, 1), R.get(1, 1));
    const thetay = Math.atan2(-R.get(2, 0), R.get(2, 2));
    const thetax = Math.atan2(R.get(2, 1), Math.sqrt(Math.pow(R.get(2, 0), 2) + Math.pow(R.get(2, 2), 2)));

    return [thetaz, thetax, thetay];
  }


  // horifying code that I copied from a random blog in python, and blindly pasted from ChatGPT to get it in Javascript
  // shout out to https://temugeb.github.io/python/motion_capture/2021/09/16/joint_rotations.html for doing maths

  // function GetR(A, B) {
  //   // get unit vectors
  //   const uA = A.map((val) => val / Math.sqrt(A.reduce((acc, curr) => acc + curr**2, 0)));
  //   const uB = B.map((val) => val / Math.sqrt(B.reduce((acc, curr) => acc + curr**2, 0)));
  //
  //   // get products
  //   const cos_t = uA.reduce((acc, curr, index) => acc + curr * uB[index], 0);
  //   const sin_t = Math.sqrt(uA.reduce((acc, curr, index) => acc + (curr * uB[(index + 1) % 3] - curr * uB[(index + 2) % 3])**2, 0));
  //
  //   // get new unit vectors
  //   const u = uA;
  //   let v = uB.map((val, index) => val - uA[index] * uB.reduce((acc, curr, i) => acc + uA[i] * curr, 0));
  //   v = v.map((val) => val / Math.sqrt(v.reduce((acc, curr) => acc + curr**2, 0)));
  //   const w = [
  //       uA[1] * uB[2] - uA[2] * uB[1],
  //       uA[2] * uB[0] - uA[0] * uB[2],
  //       uA[0] * uB[1] - uA[1] * uB[0]
  //   ].map((val) => val / Math.sqrt(uA.reduce((acc, curr) => acc + curr**2, 0)));
  //
  //   // get change of basis matrix
  //   const C = [u, v, w];
  //
  //   // get rotation matrix in new basis
  //   const R_uvw = [
  //       [cos_t, -sin_t, 0],
  //       [sin_t, cos_t, 0],
  //       [0, 0, 1]
  //   ];
  //
  //   // full rotation matrix
  //   const R = C.map((row) => row.map((val, i) => val * R_uvw[i][0] + val * R_uvw[i][1] + val * R_uvw[i][2]));
  //
  //   return R;
  // }
  //
  // // more horror
  //
  // function DecomposeRZXY(R) {
  //   // decomposes as RzRXRy. Note the order: ZXY <- rotation by y first
  //   const thetaz = Math.atan2(-R[0][1], R[1][1]);
  //   const thetay = Math.atan2(-R[2][0], R[2][2]);
  //   const thetax = Math.atan2(R[2][1], Math.sqrt(R[2][0]**2 + R[2][2]**2));
  //
  //   return [thetaz, thetay, thetax];
  // }

  function getLeftShoulderRotation(PositionDict, RootRotation) {

    // Empty rotation matrix for joint
    let _invR = nj.identity(3);
    // Reverses the decomposed angles to get the rotation matricies for ZXY, multiplies them together into a single rotational matrix
    //let R = nj.multiply(getRz(RootRotation[0]), nj.multiply(getRx(RootRotation[1]), getRz(RootRotation[2])));

    // Redundant for this test function, but you'd do this in a for loop to multiply the joints rotation matrix by the rotational matricies of each joint down the chain
  //  _invR = nj.multiply(_invR, nj.transpose(R));

    let R = nj.dot(getRz(RootRotation[0]), nj.dot(getRx(RootRotation[1]), getRz(RootRotation[2])));
    _invR = nj.dot(_invR, R.transpose(1,0));
    //

    let b = nj.dot(nj.array(PositionDict["leftShoulder"]), _invR);

    let _R = Get_R2(nj.array([1,0,0]), b);

    let LeftShoulderRotation = Decompose_R_ZXY(_R);

    return LeftShoulderRotation;

  }

  function GetRootRotation(PositionDict) {

    // Calculate unit vectors of root.
    // Trying the nose and lefShoulder. x axis is the vector pointing from the neck to the leftshoulder. y axis is the vector pointing from the neck to the nose

    //let RootU = PositionDict["leftShoulder"] - PositionDict["neck"];
    let RootU = nj.subtract(PositionDict["leftShoulder"], PositionDict["neck"]);
    RootU = nj.divide(RootU, Math.sqrt(nj.sum(nj.power(RootU, 2))));

    // let RootV = PositionDict["nose"] - PositionDict["neck"];
    let RootV = nj.subtract(PositionDict["nose"], PositionDict["neck"]);
    RootV = nj.divide(RootV, Math.sqrt(nj.sum(nj.power(RootV, 2))));

    let RootW = crossProduct(RootU.tolist(), RootV.tolist());
    // was doing .T, but in numpy, .T is to transpose the array
    let Co = nj.transpose(nj.array([RootU.tolist(), RootV.tolist(), RootW]));

    //console.log(Co);

    //let thetaz,thetay, thetax = Decompose_R_ZXY(Co);
    //let RootRotation = nj.array([thetaz, thetax, thetay]);
    //console.log(Decompose_R_ZXY(C));
    //console.log(RootRotation);

    let RootRotation = Decompose_R_ZXY(Co);
    //console.log(RootRotation);

    return RootRotation;

  }

  function GetJointRotation(PositionDict, hirearchy, joint) {

    // joint = leftShoulder


  }

  function RotateJoint(Joint, Rotation) {
    //console.log(Rotation);

    // x - pitch, y - roll, z- yaw

    // Joint.rotation.x = THREE.Math.degToRad(Rotation[1]);
    // Joint.rotation.y = THREE.Math.degToRad(Rotation[2]);
    // Joint.rotation.z = THREE.Math.degToRad(Rotation[0]);
    Joint.rotation.z = Rotation[0];
    Joint.rotation.x = Rotation[1];
    Joint.rotation.y = Rotation[2];


  }

  // Attempts at moving the joints

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
    let w = { x: 480/2, y: 640/2 };

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
     dy = ((60 * yPercentage) / 100) * -1;
     }

   // Down (Rotates head down between 0 and degreeLimit)
   if (y >= w.y / 2) {
     ydiff = y - w.y / 2;
     yPercentage = (ydiff / (w.y / 2)) * 100;
     dy = (60 * yPercentage) / 100;
   }

   head.rotation.y = THREE.Math.degToRad(dx);
   head.rotation.x = THREE.Math.degToRad(dy);

  }

  function JointRotation(RootPosition, JointPosition, Joint) {

    // Calculate the direction vector from the root joint to the current joint
    const direction = {
      x: JointPosition.x - RootPosition.x,
      y: JointPosition.y - RootPosition.y
    };

    const rotationX = Math.atan2(direction.y, direction.x);
    const rotationY = Math.atan2(-direction.x, direction.y);

    Joint.rotation.y = THREE.Math.degToRad(rotationY);
    Joint.rotation.x = THREE.Math.degToRad(rotationX);
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


// End Main Function
})(); // Don't add anything below this line
