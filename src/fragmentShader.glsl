precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D uSampler;

void main(void) {
    // Return the pixel color from sampling the texture
    gl_FragColor = texture2D(uSampler, vec2(vTexCoord.s, vTexCoord.t));
}
