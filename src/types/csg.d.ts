declare module 'csg' {
  export class Vector {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    constructor(vec: { x: number; y: number; z: number });
    constructor(arr: [number, number, number]);
    clone(): Vector;
    negated(): Vector;
    plus(a: Vector): Vector;
    minus(a: Vector): Vector;
    times(n: number): Vector;
    divided(n: number): Vector;
    dot(a: Vector): number;
    lerp(a: Vector, t: number): Vector;
    length(): number;
    unit(): Vector;
    cross(a: Vector): Vector;
  }

  export class Vertex {
    pos: Vector;
    normal: Vector;
    constructor(pos: Vector, normal: Vector);
    clone(): Vertex;
    flip(): Vertex;
    interpolate(other: Vertex, t: number): Vertex;
  }

  export class Polygon {
    vertices: Vertex[];
    shared: any;
    plane: Plane;
    constructor(vertices: Vertex[], shared?: any);
    clone(): Polygon;
    flip(): void;
  }

  export class Plane {
    normal: Vector;
    w: number;
    static EPSILON: number;
    constructor(normal: Vector, w: number);
    static fromPoints(a: Vector, b: Vector, c: Vector): Plane;
    clone(): Plane;
    flip(): void;
    splitPolygon(polygon: Polygon, coplanarFront: Polygon[], coplanarBack: Polygon[], front: Polygon[], back: Polygon[]): void;
  }

  export class Node {
    plane: Plane | null;
    front: Node | null;
    back: Node | null;
    polygons: Polygon[];
    constructor(polygons?: Polygon[]);
    clone(): Node;
    invert(): void;
    clipPolygons(polygons: Polygon[]): Polygon[];
    clipTo(bsp: Node): void;
    allPolygons(): Polygon[];
    build(polygons: Polygon[]): void;
  }

  export interface CubeOptions {
    center?: [number, number, number] | Vector;
    radius?: number | [number, number, number];
  }

  export interface SphereOptions {
    center?: [number, number, number] | Vector;
    radius?: number;
    slices?: number;
    stacks?: number;
  }

  export interface CylinderOptions {
    start?: [number, number, number] | Vector;
    end?: [number, number, number] | Vector;
    radius?: number;
    slices?: number;
  }

  export default class CSG {
    polygons: Polygon[];
    static fromPolygons(polygons: Polygon[]): CSG;
    static cube(options?: CubeOptions): CSG;
    static sphere(options?: SphereOptions): CSG;
    static cylinder(options?: CylinderOptions): CSG;
    
    clone(): CSG;
    toPolygons(): Polygon[];
    union(csg: CSG): CSG;
    subtract(csg: CSG): CSG;
    intersect(csg: CSG): CSG;
    inverse(): CSG;
  }
}
