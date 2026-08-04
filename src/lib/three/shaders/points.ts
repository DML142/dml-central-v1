export const POINTS_VERTEX = /* glsl */ `
uniform float uHalfDepth;
uniform float uSizeNear;
uniform float uSizeFar;
uniform float uAlphaNear;
uniform float uAlphaFar;
uniform float uSoftNear;
uniform float uSoftFar;
uniform float uPixelRatio;

varying float vAlpha;
varying float vSoftness;

void main() {
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewPosition;

  // Depth reads as focus, not as perspective: the far end of the volume is bigger and softer,
  // which is what the static SVG field draws (tech.md 5.1).
  float farness = clamp((uHalfDepth - position.z) / (uHalfDepth * 2.0), 0.0, 1.0);

  gl_PointSize = mix(uSizeNear, uSizeFar, farness) * uPixelRatio;
  vAlpha = mix(uAlphaNear, uAlphaFar, farness);
  vSoftness = mix(uSoftNear, uSoftFar, farness);
}
`;

export const POINTS_FRAGMENT = /* glsl */ `
uniform vec3 uColor;

varying float vAlpha;
varying float vSoftness;

void main() {
  float distanceFromCentre = length(gl_PointCoord - 0.5);
  float mask = smoothstep(0.5, 0.5 - vSoftness, distanceFromCentre);

  if (mask <= 0.0) discard;

  gl_FragColor = vec4(uColor, mask * vAlpha);
}
`;
