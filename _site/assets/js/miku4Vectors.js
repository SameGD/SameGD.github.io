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

  const OffsetDirections = {
    Hairband_L_Armature: new THREE.Vector3(1, 0, 0),
    Leg_L_Armature: new THREE.Vector3(1, 0, 0),
    Leg_R_Armature: new THREE.Vector3(-1, 0, 0),
    Hairband_R_Armature: new THREE.Vector3(1, 0, 0),
    Knee_L_Armature: new THREE.Vector3(1, 0, 0),
    Knee_R_Armature: new THREE.Vector3(-1, 0, 0)
  };

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
          flipHorizontal: false
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

            // Positions are stored as a Vector3 Object in Three.js, that represent a space in xyz

            keypoints3D.forEach(({x,y,z}) => {

              const a = new THREE.Vector3(x, y, z);
              PosePositions.push(a);
            })

            // Uses index described in BlazePose documentation https://github.com/tensorflow/tfjs-models/tree/master/pose-detection

            const KeypointsDict = {
              nose: PosePositions[0],
              leftEar: PosePositions[7],
              leftShoulder: PosePositions[11],
              rightShoulder: PosePositions[12],
              leftElbow: PosePositions[13],
              rightElbow: PosePositions[14],
              leftWrist: PosePositions[15],
              rightWrist: PosePositions[16],
            }

            // Add Neck Joint, which is the midpoint between the shoulders

            let neck = KeypointsDict["leftShoulder"].clone();
            neck.sub(KeypointsDict["rightShoulder"]);
            neck.divideScalar(2);
            neck.add(KeypointsDict["rightShoulder"]);

            KeypointsDict["neck"] = neck;

            const hierarchy = {
              head: [],
              leftShoulder: ["head"],
              leftElbow: ["leftShoulder", "head"],
              rightShoulder: ["head"],
              rightElbow: ["rightShoulder", "head"]
            };

            // Set center of the screen

            if (!center) {
              center = PosePositions[0];
              console.log(PosePositions);
              console.log(KeypointsDict);
            }

            // Returns rotation matrix as THREE.Matrix4();
            let RootRotation = GetRootRotation(KeypointsDict);

            // console.log(RootRotation);

            //RotateJoint(bones["Head_Armature"], RootRotation);
            bones["Head_Armature"].setRotationFromMatrix(RootRotation);

            //getLeftShoulderRotation(KeypointsDict, RootRotation);
            //getRightShoulderRotation(KeypointsDict, RootRotation);
            //rotateJointly(KeypointsDict["leftShoulder"], KeypointsDict["leftElbow"], "Hairband_L_Armature");
            rotateJointly(KeypointsDict["leftShoulder"], KeypointsDict["leftElbow"], "Leg_L_Armature");
            rotateJointly(KeypointsDict["leftElbow"], KeypointsDict["leftWrist"], "Knee_L_Armature");
            //rotateJointly(KeypointsDict["leftShoulder"], KeypointsDict["leftElbow"], "Hairband_R_Armature");
            rotateJointly(KeypointsDict["rightShoulder"], KeypointsDict["rightElbow"], "Leg_R_Armature");
            rotateJointly(KeypointsDict["rightElbow"], KeypointsDict["rightWrist"], "Knee_R_Armature");


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

  function GetRootRotation(PositionDict) {

    let RootU = new THREE.Vector3();
    RootU.subVectors(PositionDict["leftShoulder"], PositionDict["neck"]).normalize();
    //RootU.subVectors(PositionDict["neck"], PositionDict["rightShoulder"]).normalize();
    //RootU.subVectors(PositionDict["leftEar"], PositionDict["nose"]).normalize();
    //RootU.subVectors(PositionDict["leftShoulder"], PositionDict["rightShoulder"]).normalize();

    let RootV = new THREE.Vector3();
    RootV.subVectors(PositionDict["nose"], PositionDict["neck"]).normalize();

    let RootW = new THREE.Vector3();
    RootW.crossVectors(RootU, RootV);

    // If these are the direction / unit vectors that define the xyz axis respectively, I think we can use .makeBasis to create our rotation matrix
    // Either that or .lookAt somehow

    const m = new THREE.Matrix4();
    m.makeBasis(RootU, RootV, RootW);

    return m;

  }

  function rotateJointly(Point1, Point2, Joint) {
    let OldDirection = OffsetDirections[Joint];
    //OldDirection.applyMatrix4(Joint.matrix).normalize();

    let NewDirection = new THREE.Vector3();
    NewDirection.subVectors(Point2, Point1).normalize();

    let Quaternion = new THREE.Quaternion();

    // Sets this quaternion to the rotation required to rotate direction vector vFrom to direction vector vTo.
    // vFrom is being defined by the OffsetDirections, which has something to do with T posing I think? This just magically worked so idk.
    Quaternion.setFromUnitVectors(OldDirection, NewDirection);

    bones[Joint].setRotationFromQuaternion(Quaternion);

  }

  // Old functions I'm too scared to throw away right now

  function getLeftShoulderRotationOld(PositionDict, RootRotation) {

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

  function getLeftShoulderRotation(PositionDict, RootRotation) {

    let OldDirection = new THREE.Vector3(0, 0, 1);
    OldDirection.applyMatrix4(RootRotation).normalize();

    let NewDirection = new THREE.Vector3();
    NewDirection.subVectors(PositionDict["leftElbow"], PositionDict["leftShoulder"]).normalize();

    let VectorAngle = OldDirection.angleTo(NewDirection);

    bones["Leg_L_Armature"].setRotationFromAxisAngle(OldDirection, VectorAngle);

  }

  function getRightShoulderRotation(PositionDict, RootRotation) {

    let OldDirection = new THREE.Vector3(0, 0, 1);
    OldDirection.applyMatrix4(RootRotation).normalize();

    let NewDirection = new THREE.Vector3();
    NewDirection.subVectors(PositionDict["rightElbow"], PositionDict["rightShoulder"]).normalize();

    let VectorAngle = OldDirection.angleTo(NewDirection);

    bones["Leg_R_Armature"].setRotationFromAxisAngle(OldDirection, VectorAngle);

    let RotationMatrix = new THREE.Matrix4();

  }

  function rotateJointlyOld(Point1, Point2, Joint) {
    let OldDirection = new THREE.Vector3(0, 0, 1);
    OldDirection.applyMatrix4(Joint.matrix).normalize();

    let NewDirection = new THREE.Vector3();
    NewDirection.subVectors(Point2, Point1).normalize();

    let VectorAngle = OldDirection.angleTo(NewDirection);

    Joint.setRotationFromAxisAngle(OldDirection, VectorAngle);
  }

  function GetRootRotationOld(PositionDict) {

    // Calculate unit vectors of root.
    // Trying the nose and lefShoulder. x axis is the vector pointing from the neck to the leftshoulder. y axis is the vector pointing from the neck to the nose

    //let RootU = PositionDict["leftShoulder"] - PositionDict["neck"];
    let RootU = nj.subtract(PositionDict["leftShoulder"], PositionDict["neck"]);
    RootU = nj.divide(RootU, Math.sqrt(nj.sum(nj.power(RootU, 2))));

    // let RootV = PositionDict["nose"] - PositionDict["neck"];
    let RootV = nj.subtract(PositionDict["nose"], PositionDict["neck"]);
    RootV = nj.divide(RootV, Math.sqrt(nj.sum(nj.power(RootV, 2))));

    let RootW = crossProduct(RootU.tolist(), RootV.tolist());
    // was doing .T, but in numpy, .T is to transpose (invert) the array
    let Co = nj.transpose(nj.array([RootU.tolist(), RootV.tolist(), RootW]));

    // Co is an array [[1,2,3], [1,2,3], [1,2,3]]

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

  function RotateJoint(Joint, RotationMatrix) {
    //console.log(Rotation);

    // x - pitch, y - roll, z- yaw

    // Joint.rotation.x = THREE.Math.degToRad(Rotation[1]);
    // Joint.rotation.y = THREE.Math.degToRad(Rotation[2]);
    // Joint.rotation.z = THREE.Math.degToRad(Rotation[0]);
    // Joint.rotation.z = Rotation[0];
    // Joint.rotation.x = Rotation[1];
    // Joint.rotation.y = Rotation[2];

    Joint.setRotationFromMatrix(RotationMatrix);


  }





// End Main Function
})(); // Don't add anything below this line
