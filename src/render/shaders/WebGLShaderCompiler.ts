/**
 * Manages WebGL shader compilation and program linking.
 * Handles vertex and fragment shader creation with error reporting.
 */
export class WebGLShaderCompiler {
  private gl: WebGL2RenderingContext;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
  }

  /**
   * Compile a shader from source code
   */
  public compileShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type);
    if (!shader) throw new Error('Failed to create shader');
    
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`Shader compilation failed: ${info}`);
    }
    
    return shader;
  }

  /**
   * Create and link a shader program from vertex and fragment shaders
   */
  public createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
    const program = this.gl.createProgram();
    if (!program) throw new Error('Failed to create WebGL program');
    
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const info = this.gl.getProgramInfoLog(program);
      this.gl.deleteProgram(program);
      throw new Error(`Program link failed: ${info}`);
    }
    
    return program;
  }

  /**
   * Compile and create a complete program from shader sources
   */
  public createProgramFromSources(vertexSource: string, fragmentSource: string): WebGLProgram {
    const vs = this.compileShader(this.gl.VERTEX_SHADER, vertexSource);
    const fs = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentSource);
    return this.createProgram(vs, fs);
  }
}
