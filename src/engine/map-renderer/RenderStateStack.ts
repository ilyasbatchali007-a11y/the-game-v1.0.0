// SRC/engine/map-renderer/RenderStateStack.ts
// Manages WebGL render state push/pop operations

export interface RenderStateSnapshot {
  depthTest: boolean;
  depthMask: boolean;
  cullFace: boolean;
  blend: boolean;
  blendFuncSrc: number;
  blendFuncDst: number;
}

export class RenderStateStack {
  private stack: RenderStateSnapshot[] = [];
  private gl: WebGLRenderingContext;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }

  public push(): void {
    const snapshot: RenderStateSnapshot = {
      depthTest: this.gl.isEnabled(this.gl.DEPTH_TEST),
      depthMask: this.gl.getParameter(this.gl.DEPTH_WRITEMASK),
      cullFace: this.gl.isEnabled(this.gl.CULL_FACE),
      blend: this.gl.isEnabled(this.gl.BLEND),
      blendFuncSrc: this.gl.getParameter(this.gl.BLEND_SRC_RGB),
      blendFuncDst: this.gl.getParameter(this.gl.BLEND_DST_RGB)
    };
    this.stack.push(snapshot);
  }

  public pop(): void {
    const snapshot = this.stack.pop();
    if (!snapshot) return;

    if (snapshot.depthTest) this.gl.enable(this.gl.DEPTH_TEST);
    else this.gl.disable(this.gl.DEPTH_TEST);

    this.gl.depthMask(snapshot.depthMask);

    if (snapshot.cullFace) this.gl.enable(this.gl.CULL_FACE);
    else this.gl.disable(this.gl.CULL_FACE);

    if (snapshot.blend) this.gl.enable(this.gl.BLEND);
    else this.gl.disable(this.gl.BLEND);

    this.gl.blendFunc(snapshot.blendFuncSrc, snapshot.blendFuncDst);
  }

  public configureForXRay(): void {
    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.depthMask(false);
    this.gl.disable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
  }

  public restoreFromXRay(): void {
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthMask(true);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.disable(this.gl.BLEND);
  }
}
