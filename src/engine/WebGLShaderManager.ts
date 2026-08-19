// SRC/engine/WebGLShaderManager.ts
// Manages WebGL shader compilation, program linking, and uniform/attribute handling

export class WebGLShaderManager {
  private gl: WebGLRenderingContext;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }

  /**
   * Create and compile a shader from source code
   */
  createShader(type: number, source: string): WebGLShader | null {
    const shader = this.gl.createShader(type);
    if (!shader) {
      console.warn(`[WebGLShaderManager] Failed to create shader object for type ${type}`);
      return null;
    }

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const errorLog = this.gl.getShaderInfoLog(shader);
      console.warn(`[WebGLShaderManager] Shader compile error: ${errorLog}`);
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  /**
   * Create and link a shader program from vertex and fragment shaders
   */
  createProgram(vs: WebGLShader, fs: WebGLShader): WebGLProgram | null {
    const program = this.gl.createProgram();
    if (!program) {
      console.warn('[WebGLShaderManager] Failed to create program object');
      return null;
    }

    this.gl.attachShader(program, vs);
    this.gl.attachShader(program, fs);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const errorLog = this.gl.getProgramInfoLog(program);
      console.warn(`[WebGLShaderManager] Program link error: ${errorLog}`);
      this.gl.deleteProgram(program);
      return null;
    }

    return program;
  }

  /**
   * Create a complete shader program from vertex and fragment source code
   */
  createProgramFromSource(vsSource: string, fsSource: string): WebGLProgram | null {
    const vs = this.createShader(this.gl.VERTEX_SHADER, vsSource);
    const fs = this.createShader(this.gl.FRAGMENT_SHADER, fsSource);

    if (!vs || !fs) {
      if (vs) this.gl.deleteShader(vs);
      if (fs) this.gl.deleteShader(fs);
      return null;
    }

    const program = this.createProgram(vs, fs);
    
    // Clean up shaders after linking (they're now part of the program)
    this.gl.detachShader(program!, vs);
    this.gl.detachShader(program!, fs);
    this.gl.deleteShader(vs);
    this.gl.deleteShader(fs);

    return program;
  }

  /**
   * Get attribute location with error logging
   */
  getAttribLocation(program: WebGLProgram, name: string): number {
    const location = this.gl.getAttribLocation(program, name);
    if (location < 0) {
      console.warn(`[WebGLShaderManager] Attribute '${name}' not found or inactive`);
    }
    return location;
  }

  /**
   * Get uniform location with error logging
   */
  getUniformLocation(program: WebGLProgram, name: string): WebGLUniformLocation | null {
    const location = this.gl.getUniformLocation(program, name);
    if (!location) {
      console.warn(`[WebGLShaderManager] Uniform '${name}' not found or inactive`);
    }
    return location;
  }

  /**
   * Validate program and log any warnings
   */
  validateProgram(program: WebGLProgram): boolean {
    this.gl.validateProgram(program);
    if (!this.gl.getProgramParameter(program, this.gl.VALIDATE_STATUS)) {
      const errorLog = this.gl.getProgramInfoLog(program);
      console.warn(`[WebGLShaderManager] Program validation warning: ${errorLog}`);
      return false;
    }
    return true;
  }
}

/**
 * Default shader sources for 3D map rendering
 */
export const MapRendererShaders = {
  vertex: `
    attribute vec3 a_position;
    attribute vec3 a_normal;
    uniform mat4 u_matrix;
    uniform mat4 u_normalMatrix;
    varying vec3 v_normal;
    void main() {
      gl_Position = u_matrix * vec4(a_position, 1.0);
      v_normal = (u_normalMatrix * vec4(a_normal, 0.0)).xyz;
    }
  `,

  fragment: `
    precision mediump float;
    varying vec3 v_normal;
    uniform vec3 u_lightDir;
    uniform vec4 u_color;
    uniform bool u_useLighting;
    void main() {
      if (u_useLighting) {
        vec3 normal = normalize(v_normal);
        float light = max(dot(normal, u_lightDir), 0.2);
        gl_FragColor = u_color * light;
      } else {
        // Emissive mode - no lighting, pure glow
        gl_FragColor = u_color;
      }
    }
  `
};
