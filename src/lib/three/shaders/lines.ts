export const LINES_VERTEX = /* glsl */ `
attribute float alpha;

varying float vAlpha;

void main() {
  vAlpha = alpha;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const LINES_FRAGMENT = /* glsl */ `
uniform vec3 uColor;

varying float vAlpha;

void main() {
  gl_FragColor = vec4(uColor, vAlpha);
}
`;
