attribute vec3 vertexPos;
attribute vec2 texCoord;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
varying vec2 vTexCoord;

void main(void) {
    // Return the transformed and projected vertex value
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPos, 1.0);
    // Output the texture coordinate in vTexCoord
    vTexCoord = texCoord;
}
