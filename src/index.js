import { mat4 } from 'gl-matrix'
import fragmentShaderSource from './fragmentShader.glsl'
import vertexShaderSource from './vertexShader.glsl'

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

function createSquare(gl) {
  const vertexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  const vertices = [
     .5,  .5,  0.0,
    -.5,  .5,  0.0,
     .5, -.5,  0.0,
    -.5, -.5,  0.0
  ]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
  const square = { buffer: vertexBuffer,
                   vertSize: 3,
                   nVerts: 4,
                   primtype: gl.TRIANGLE_STRIP
                 }
  return square
}

function initMatrices(canvas) {
  const modelViewMatrix = mat4.create()
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -3.333])
  const projectionMatrix = mat4.create()
  mat4.perspective(projectionMatrix, Math.PI/4, canvas.width/canvas.height, 1, 10000)
  return { modelViewMatrix, projectionMatrix }
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
  // link them
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, fragmentShader)
  gl.attachShader(shaderProgram, vertexShader)
  gl.linkProgram(shaderProgram)
  // get pointers to the shader params
  const shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'vertexPos')
  gl.enableVertexAttribArray(shaderVertexPositionAttribute)
  const shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, 'projectionMatrix')
  const shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, 'modelViewMatrix')
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(`Could not initialise shaders`)
  }
  return { shaderProgram,
           shaderVertexPositionAttribute,
           shaderProjectionMatrixUniform,
           shaderModelViewMatrixUniform }
}

function draw(gl, obj, shader, matrices) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer)

  gl.useProgram(shader.shaderProgram)

  // connect the shader parms
  gl.vertexAttribPointer(shader.shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0)
  gl.uniformMatrix4fv(shader.shaderProjectionMatrixUniform, false, matrices.projectionMatrix)
  gl.uniformMatrix4fv(shader.shaderModelViewMatrixUniform, false, matrices.modelViewMatrix)

  gl.drawArrays(obj.primtype, 0, obj.nVerts)
}

const canvas = document.getElementById('canvas')
canvas.style.width = canvas.width = 640
canvas.style.height = canvas.height  = 480
canvas.style.border = "1px solid black"

const gl = initWebGL(canvas)
initViewport(gl, canvas)
const obj = createSquare(gl)
const matrices  = initMatrices(canvas)
const shader = initShader(gl)
draw(gl, obj, shader, matrices)
