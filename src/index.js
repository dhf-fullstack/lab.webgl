import { vec3, mat4 } from 'gl-matrix'
import fragmentShaderSource from './fragmentShader.glsl'
import vertexShaderSource from './vertexShader.glsl'

function log(...args) {
  var div = document.createElement("div");
  div.textContent = [...args].join(" ");
  document.body.appendChild(div);
}

function initWebGL(canvas) {
  let gl = null
  let msg = `Your browser does not support WebGL, or it is not enabled by default.`
  try {
    gl = canvas.getContext("webgl")
  } catch (e) {
    msg = `Error creating WebGL Context!: ${e}`
  }
  if (!gl) {
    alert(msg);
    throw new Error(msg);
  }
  return gl;
}

function initViewport(gl, canvas) {
  gl.viewport(0, 0, canvas.width, canvas.height)
}

function createCube(gl) {
  const vertexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  const vertices = [
    // front face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,
    // back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,
     // top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,
     // bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,
     // right face
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,
     // left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0
  ]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

  // using texture instead of color
  // const colorBuffer = gl.createBuffer()
  // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
  // const faceColors = [
  //   [1.0, 0.0, 0.0, 1.0], // front face
  //   [0.0, 1.0, 0.0, 1.0], // back face
  //   [0.0, 0.0, 1.0, 1.0], // top face
  //   [1.0, 1.0, 0.0, 1.0], // bottom face
  //   [1.0, 0.0, 1.0, 1.0], // right face
  //   [0.0, 1.0, 1.0, 1.0], // left face
  // ]
  // const vertexColors = faceColors.reduce((l, c) => [...l, ...c, ...c, ...c, ...c], [])
  // // original code replaced by reduce above
  // // console.log(vertexColors1)
  // // var vertexColors = [];
  // // for (var i in faceColors) {
  // //     var color = faceColors[i];
  // //     for (var j=0; j < 4; j++) {
  // //       vertexColors = vertexColors.concat(color);
  // //     }
  // // }
  // // console.log(vertexColors)
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW)

  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  var textureCoords = [
    // front face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    // back face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    // top face
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,

    // bottom face
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,

    // right face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    // left face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);

  const cubeIndexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer)
  const cubeIndices = [
    0,   1,  2,     0,  2,  3,   // front face
    4,   5,  6,     4,  6,  7,   // back face
    8,   9, 10,     8, 10, 11,   // top face
    12, 13, 14,    12, 14, 15,   // bottom face
    16, 17, 18,    16, 18, 19,   // right face
    20, 21, 22,    20, 22, 23    // left face
  ]
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW)

  const cube = { buffer: vertexBuffer,
                 //colorBuffer: colorBuffer,
                 texCoordBuffer: texCoordBuffer,
                 indices: cubeIndexBuffer,
                 vertSize: 3,
                 nVerts: 24,
                 //colorSize: 4,
                 //nColors: 24,
                 texCoordSize: 2,
                 nTextCoords: 24,
                 nIndices: 36,
                 primtype: gl.TRIANGLES
                }
  return cube
}

function initMatrices(canvas) {
  const modelViewMatrix = mat4.create()
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -8])

  const projectionMatrix = mat4.create()
  mat4.perspective(projectionMatrix, Math.PI/4, canvas.width/canvas.height, 1, 10000)

  const rotationAxis = vec3.create();
  vec3.normalize(rotationAxis, [1, 1, 1]);

  return { modelViewMatrix, projectionMatrix, rotationAxis }
}

function createShader(gl, str, type) {
  let shader;
  if (type === 'fragment') {
    shader = gl.createShader(gl.FRAGMENT_SHADER)
  } else if (type === 'vertex') {
    shader = gl.createShader(gl.VERTEX_SHADER)
  } else {
    return null
  }
  gl.shaderSource(shader, str)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader))
    return null
  }
  return shader
}

function initShader(gl) {

  // load and compile the fragment and vertex shaders
  const fragmentShader = createShader(gl, fragmentShaderSource, 'fragment')
  const vertexShader = createShader(gl, vertexShaderSource, 'vertex')

  /* DEBUGGING - uncomment for shader creation errors
  log('frag')
  log(gl.getShaderInfoLog(fragmentShader))
  log('vert')
  log(gl.getShaderInfoLog(vertexShader))
  */

  // link them
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, fragmentShader)
  gl.attachShader(shaderProgram, vertexShader)
  gl.linkProgram(shaderProgram)
  
  /* DEBUGGING - uncomment for compilation & linking errors
  log('prog')
  log(gl.getProgramInfoLog(shaderProgram))
  */

  // get pointers to the shader params
  const shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'vertexPos')
  gl.enableVertexAttribArray(shaderVertexPositionAttribute)

  // replace color with texture
  //const shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, 'vertexColor')
  //gl.enableVertexAttribArray(shaderVertexColorAttribute)

  const shaderTexCoordAttribute = gl.getAttribLocation(shaderProgram, 'texCoord')
  gl.enableVertexAttribArray(shaderTexCoordAttribute)

  const shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, 'projectionMatrix')
  const shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, 'modelViewMatrix')
  const shaderSamplerUniform = gl.getUniformLocation(shaderProgram, 'uSampler')

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(`Could not initialise shaders`)
  }

  return { shaderProgram,
           shaderVertexPositionAttribute,
           //shaderVertexColorAttribute,
           shaderTexCoordAttribute,
           shaderProjectionMatrixUniform,
           shaderModelViewMatrixUniform,
           shaderSamplerUniform }
}

var texturesReady = false;

function handleTextureLoaded(gl, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

  // Prevents s-coordinate wrapping (repeating).
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  // Prevents t-coordinate wrapping (repeating).
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.bindTexture(gl.TEXTURE_2D, null);
  texturesReady = true;
}

var webGLTexture;

function initTexture(gl) {
  webGLTexture = gl.createTexture();
  webGLTexture.image = new Image();
  webGLTexture.image.onload = function () {
    handleTextureLoaded(gl, webGLTexture);
  }
  webGLTexture.image.src = 'dist/jo1.png';
}

function draw(gl, obj, shader, matrices) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.enable(gl.DEPTH_TEST)
  // eslint-disable-next-line no-bitwise
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  gl.useProgram(shader.shaderProgram)

  gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer)
  gl.vertexAttribPointer(shader.shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0)
 
  // replace color with texture
  //gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer)
  //gl.vertexAttribPointer(shader.shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoordBuffer)
  gl.vertexAttribPointer(shader.shaderTexCoordAttribute, obj.texCoordSize, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices)

  // connect the shader parms
  
  gl.uniformMatrix4fv(shader.shaderProjectionMatrixUniform, false, matrices.projectionMatrix)
  gl.uniformMatrix4fv(shader.shaderModelViewMatrixUniform, false, matrices.modelViewMatrix)

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, webGLTexture);
  gl.uniform1i(shader.shaderSamplerUniform, 0);

  gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0)
}

var currentTime = Date.now();
function animate(matrices, frameDuration) {
    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;
    var fract = deltat / frameDuration;
    var angle = Math.PI * 2 * fract;
    mat4.rotate(matrices.modelViewMatrix, matrices.modelViewMatrix, angle, matrices.rotationAxis);
}

function run(gl, cube, shader, matrices, frameDuration) {
  requestAnimationFrame(function() { run(gl, cube, shader, matrices, frameDuration); });
  if (texturesReady) {
    draw(gl, cube, shader, matrices);
    animate(matrices, frameDuration);
  }
}

const canvas = document.getElementById('canvas')
canvas.style.width = canvas.width = 640
canvas.style.height = canvas.height  = 480
canvas.style.border = "1px solid black"

const gl = initWebGL(canvas)
initViewport(gl, canvas)
const obj = createCube(gl)
const matrices = initMatrices(canvas)
const shader = initShader(gl)
initTexture(gl);
const frameDuration = 5000; // ms - 1500 is about as fast as can go without ripping on 2017 12" macbook

run(gl, obj, shader, matrices, frameDuration)

/* DEBUGGING
log("list of used attributes");
log("-----------------------");

var numAttribs = gl.getProgramParameter(shader.shaderProgram, gl.ACTIVE_ATTRIBUTES);
for (var ii = 0; ii < numAttribs; ++ii) {
  var attribInfo = gl.getActiveAttrib(shader.shaderProgram, ii);
  if (!attribInfo) {
    break;
  }
  log(gl.getAttribLocation(shader.shaderProgram, attribInfo.name), attribInfo.name);
}
*/
