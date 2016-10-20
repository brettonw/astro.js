attribute vec3 inputXYZ;
attribute vec3 inputABC;
attribute vec3 inputUV;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

varying vec4 vertexXYZ;
varying vec4 vertexABC;
varying vec4 vertexUV;

void main(void) {
    vec4 vertexPosition = vec4(inputXYZ, 1.0);
    vec4 modelPosition = modelMatrix * vertexPosition;
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
    color = modelPosition;
}
