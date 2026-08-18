declare module 'csg' {
  export class Vector {
    x: number;
    y: number;
    z: number;
    constructor(x: number, y: number, z: number);
    constructor(v: { x: number; y: number; z: number });
    constructor(v: [number, number, number]);
    clone(): Vector;
    negated(): Vector;
    plus(a: Vector): Vector;
    minus(a: Vector): Vector;
    times(a: number): Vector;
    divided(a: number): Vector;
    dot(a: Vector): number;
    lerp(a: Vector, t: number): Vector;
    unit(): Vector;
    lengthSquared(): number;
    length(): number;
    equals(a: Vector): boolean;
  }

  export class Vertex {
    pos: Vector;
    normal: Vector;
    constructor(pos: Vector, normal?: Vector);
    clone(): Vertex;
    flip(): Vertex;
    lerp(other: Vertex, t: number): Vertex;
  }

  export class Plane {
    w: number;
    normal: Vector;
    constructor(normal: Vector, w: number);
    clone(): Plane;
    flip(): void;
    splitPolygon(polygon: Polygon, coplanarFront: Polygon[], coplanarBack: Polygon[], front: Polygon[], back: Polygon[]): void;
    static fromPoints(a: Vector, b: Vector, c: Vector): Plane;
  }

  export class Polygon {
    vertices: Vertex[];
    shared: any;
    plane: Plane;
    constructor(vertices: Vertex[], shared?: any);
    clone(): Polygon;
    flip(): void;
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

  export class CSG {
    polygons: Polygon[];
    static fromPolygons(polygons: Polygon[]): CSG;
    static cube(options?: { center?: [number, number, number]; radius?: number | [number, number, number] }): CSG;
    static sphere(options?: { center?: [number, number, number]; radius?: number; slices?: number; stacks?: number }): CSG;
    static cylinder(options?: { start?: [number, number, number]; end?: [number, number, number]; radius?: number; slices?: number }): CSG;
    
    clone(): CSG;
    toPolygons(): Polygon[];
    union(csg: CSG): CSG;
    subtract(csg: CSG): CSG;
    intersect(csg: CSG): CSG;
    inverse(): CSG;
  }

  export default CSG;
}
