export class MiniMap3D {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private vertexBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;
  private normalBuffer: WebGLBuffer | null = null;
  private vertices: Float32Array = new Float32Array(0);
  private normals: Float32Array = new Float32Array(0);
  private indices: Uint16Array = new Uint16Array(0);
  private cubePositions: Float32Array = new Float32Array(300);
  private cubeCount: number = 0;
  private currentFloor: number = 0;
  private cameraDistance: number = 35;
  private cameraAngleX: number = Math.PI / 6;
  private cameraAngleY: number = Math.PI / 4;
  private isDragging: boolean = false;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;
  private autoRotate: boolean = true;
  private time: number = 0;

  constructor(canvasId: string) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) throw new Error(`Canvas "${canvasId}" not found`);
    this.canvas = canvas;
    this.setupWebGL();
    this.setupInputs();
    this.loadOBJFile();
  }

  private setupWebGL(): void {
    const gl = this.canvas.getContext('webgl2', { alpha: false, antialias: true });
    if (!gl) { console.error('WebGL2 not supported'); return; }
    this.gl = gl;
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    const vs = `#version 300 es
      in vec3 a_position; in vec3 a_normal;
      uniform mat4 u_mvp, u_cubeTransform;
      out vec3 v_normal, v_worldPos;
      void main() {
        vec4 worldPos = u_cubeTransform * vec4(a_position, 1.0);
        v_worldPos = worldPos.xyz;
        gl_Position = u_mvp * worldPos;
        v_normal = mat3(u_mvp) * a_normal;
      }`;
    const fs = `#version 300 es
      precision mediump float;
      in vec3 v_normal, v_worldPos;
      uniform vec3 u_camPos; uniform float u_time;
      uniform int u_floor; uniform vec3 u_positions[100];
      out vec4 color;
      void main() {
        int idx = -1; float minD = 999.0;
        for(int i=0;i<100;i++){float d=distance(v_worldPos.xz,u_positions[i].xz);if(d<2.0&&d<minD){minD=d;idx=i;}}
        vec3 light = normalize(vec3(0.5,1.0,0.3));
        float diff = max(dot(normalize(v_normal),light),0.4);
        vec3 base = vec3(0.25,0.25,0.3);
        if(idx==u_floor){
          float pulse = 0.8+0.2*sin(u_time*4.0);
          vec3 glow = vec3(1.0,0.15,0.15)*pulse;
          vec3 viewDir = normalize(u_camPos-v_worldPos);
          float edge = pow(1.0-abs(dot(normalize(v_normal),viewDir)),2.5)*1.8;
          color = vec4(mix(glow*diff,glow,0.6*edge+0.4),1.0);
        }else{color=vec4(base*diff,1.0);}
      }`;
    const vsShader = gl.createShader(gl.VERTEX_SHADER)!;
    const fsShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(vsShader,vs); gl.compileShader(vsShader);
    gl.shaderSource(fsShader,fs); gl.compileShader(fsShader);
    const prog = gl.createProgram()!;
    gl.attachShader(prog,vsShader); gl.attachShader(prog,fsShader);
    gl.linkProgram(prog);
    this.program = prog;
  }

  private loadOBJFile(): void {
    fetch('root_dungeon_single_mesh.obj').then(r=>r.text()).then(d=>this.parseOBJ(d)).catch(e=>console.error(e));
  }

  private parseOBJ(data:string):void {
    const lines=data.split('\n');
    const verts:number[] = [];
    const inds:number[] = [];
    const centers:{x:number,y:number,z:number}[] = [];
    let curVerts:{x:number,y:number,z:number}[] = [];
    let faces = 0;
    for(const ln of lines){
      const t=ln.trim();
      if(!t||t[0]==='#') continue;
      const p=t.split(/\s+/);
      if(p[0]==='v'){
        const x=parseFloat(p[1]),y=parseFloat(p[2]),z=parseFloat(p[3]);
        verts.push(x,y,z);
        curVerts.push({x,y,z});
      } else if(p[0]==='f'){
        const vi=(s:string)=>parseInt(s.split('/')[0])-1;
        inds.push(vi(p[1]),vi(p[2]),vi(p[3]));
        if(p.length>4) inds.push(vi(p[1]),vi(p[3]),vi(p[4]));
        faces++;
        if(faces>=12 && curVerts.length>0){
          let cx=0,cy=0,cz=0;
          for(const v of curVerts){cx+=v.x;cy+=v.y;cz+=v.z;}
          cx/=curVerts.length; cy/=curVerts.length; cz/=curVerts.length;
          centers.push({x:cx,y:cy,z:cz});
          curVerts = [];
          faces = 0;
        }
      }
    }
    this.cubeCount = Math.min(centers.length, 100);
    for(let i=0;i<this.cubeCount;i++){
      this.cubePositions[i*3]=centers[i].x;
      this.cubePositions[i*3+1]=centers[i].y;
      this.cubePositions[i*3+2]=centers[i].z;
    }
    console.log('Loaded',this.cubeCount,'cubes');
    this.vertices = new Float32Array(verts);
    this.indices = new Uint16Array(inds);
    const norms:number[] = new Array(verts.length).fill(0);
    for(let i=0;i<inds.length;i+=3){
      const i0=inds[i]*3, i1=inds[i+1]*3, i2=inds[i+2]*3;
      const ax=verts[i1]-verts[i0], ay=verts[i1+1]-verts[i0+1], az=verts[i1+2]-verts[i0+2];
      const bx=verts[i2]-verts[i0], by=verts[i2+1]-verts[i0+1], bz=verts[i2+2]-verts[i0+2];
      const nx=ay*bz-az*by, ny=az*bx-ax*bz, nz=ax*by-ay*bx;
      norms[i0]+=nx; norms[i0+1]+=ny; norms[i0+2]+=nz;
      norms[i1]+=nx; norms[i1+1]+=ny; norms[i1+2]+=nz;
      norms[i2]+=nx; norms[i2+1]+=ny; norms[i2+2]+=nz;
    }
    for(let i=0;i<norms.length;i+=3){
      const l=Math.sqrt(norms[i]*norms[i]+norms[i+1]*norms[i+1]+norms[i+2]*norms[i+2])||1;
      norms[i]/=l; norms[i+1]/=l; norms[i+2]/=l;
    }
    this.normals = new Float32Array(norms);
    this.createBuffers();
  }

  private createBuffers():void{
    if(!this.gl||!this.program) return;
    const gl=this.gl;
    this.vertexBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,this.vertices,gl.STATIC_DRAW);
    this.normalBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,this.normals,gl.STATIC_DRAW);
    this.indexBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.indices,gl.STATIC_DRAW);
  }

  private setupInputs():void{
    this.canvas.onmousedown=e=>{this.isDragging=true;this.lastMouseX=e.clientX;this.lastMouseY=e.clientY;this.autoRotate=false;};
    window.onmouseup=()=>{this.isDragging=false;};
    window.onmousemove=e=>{
      if(!this.isDragging)return;
      this.cameraAngleY+=(e.clientX-this.lastMouseX)*0.01;
      this.cameraAngleX+=(e.clientY-this.lastMouseY)*0.01;
      this.cameraAngleX=Math.max(0.1,Math.min(Math.PI/2-0.1,this.cameraAngleX));
      this.lastMouseX=e.clientX;this.lastMouseY=e.clientY;
    };
    this.canvas.onwheel=e=>{e.preventDefault();this.cameraDistance+=e.deltaY*0.05;this.cameraDistance=Math.max(15,Math.min(60,this.cameraDistance));};
  }

  public setCurrentFloor(f:number):void{this.currentFloor=Math.max(0,Math.min(99,f));}

  public render():void{
    if(!this.gl||!this.program||this.cubeCount===0)return;
    const gl=this.gl,prog=this.program;
    this.time+=0.016;
    if(this.autoRotate)this.cameraAngleY+=0.003;
    gl.viewport(0,0,this.canvas.width,this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.useProgram(prog);
    const aspect=this.canvas.width/this.canvas.height;
    const fov=Math.PI/4,near=0.1,far=100;
    const proj=new Float32Array([1/(aspect*Math.tan(fov/2)),0,0,0,0,1/Math.tan(fov/2),0,0,0,0,-(far+near)/(far-near),-1,0,0,-2*far*near/(far-near),0]);
    const cx=Math.sin(this.cameraAngleY)*Math.cos(this.cameraAngleX)*this.cameraDistance;
    const cy=Math.sin(this.cameraAngleX)*this.cameraDistance;
    const cz=Math.cos(this.cameraAngleY)*Math.cos(this.cameraAngleX)*this.cameraDistance;
    const ex=cx,ey=cy+10,ez=cz;
    const fLen=1/Math.sqrt(ex*ex+ey*ey+ez*ez);
    const fx=-ex*fLen,fy=-ey*fLen,fz=-ez*fLen;
    const sx=fz,sy=0,sz=-fx;
    const sLen=1/Math.sqrt(sx*sx+sy*sy+sz*sz)||1;
    const ux=fy*sz-fz*sy,uy=fz*sx-fx*sz,uz=fx*sy-fy*sx;
    const view=new Float32Array([sx,ux,-fx,0,sy,uy,-fy,0,sz,uz,-fz,0,-(sx*ex+sy*ey+sz*ez),-(ux*ex+uy*ey+uz*ez),fx*ex+fy*ey+fz*ez,1]);
    const mvp=new Float32Array(16);
    for(let r=0;r<4;r++)for(let c=0;c<4;c++){let sum=0;for(let k=0;k<4;k++)sum+=view[r*4+k]*proj[k*4+c];mvp[r*4+c]=sum;}
    gl.uniformMatrix4fv(gl.getUniformLocation(prog,'u_mvp'),false,mvp);
    gl.uniform3f(gl.getUniformLocation(prog,'u_camPos'),ex,ey,ez);
    gl.uniform1f(gl.getUniformLocation(prog,'u_time'),this.time);
    gl.uniform1i(gl.getUniformLocation(prog,'u_floor'),this.currentFloor);
    gl.uniform3fv(gl.getUniformLocation(prog,'u_positions'),this.cubePositions);
    const posLoc=gl.getAttribLocation(prog,'a_position'),normLoc=gl.getAttribLocation(prog,'a_normal');
    gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
    gl.enableVertexAttribArray(posLoc); gl.vertexAttribPointer(posLoc,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,this.normalBuffer);
    gl.enableVertexAttribArray(normLoc); gl.vertexAttribPointer(normLoc,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
    for(let i=0;i<this.cubeCount;i++){
      const tx=this.cubePositions[i*3],ty=this.cubePositions[i*3+1],tz=this.cubePositions[i*3+2];
      const transform=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,tx,ty,tz,1]);
      gl.uniformMatrix4fv(gl.getUniformLocation(prog,'u_cubeTransform'),false,transform);
      gl.drawElements(gl.TRIANGLES,this.indices.length,gl.UNSIGNED_SHORT,0);
    }
  }
}
