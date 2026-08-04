/**
 * Reads a design token off the document. WebGL cannot resolve a CSS custom property, and the
 * palette must not be duplicated as a literal in a shader (CLAUDE.md 6.4), so the one place that
 * needs a real colour asks the stylesheet for it.
 */
export function readColorToken(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
