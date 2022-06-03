import { mat4 } from 'gl-matrix';
import * as vtkMath from 'vtk.js/Sources/Common/Core/Math';
import vtkOpenGLVertexArrayObject from 'vtk.js/Sources/Rendering/OpenGL/VertexArrayObject';
import vtkCamera from "vtk.js/Sources/Rendering/Core/Camera";
import vtkRenderer from "vtk.js/Sources/Rendering/Core/Renderer";
import { RGBColor, Vector4 } from 'vtk.js/Sources/types';
import { ObjectType } from 'vtk.js/Sources/Rendering/OpenGL/BufferObject/Constants';
import vtkOpenGLBufferObject from 'vtk.js/Sources/Rendering/OpenGL/BufferObject';

const vertexShader = `//VTK::System::Dec
  uniform mat4 matrix;
  uniform float scale;
  in vec3 position;
  void main()
  {
    gl_Position =  matrix * vec4(scale * position, 1.0);
  }
`;

const fragmentShader = `//VTK::System::Dec
  //VTK::Output::Dec
  uniform vec3 color;
  void main()
  {
    gl_FragData[0] = vec4(color, 1.0);
  }
`;

export class VRRay {
  visible: boolean;
  #length: number;
  #camera: vtkCamera;
  #program: object;
  #openGlRenderWindow: object;
  #color: RGBColor;
  #loaded: boolean;
  #gl: WebGL2RenderingContext;
  #rayVbo: object;
  #vao: object;

  constructor(renderer: vtkRenderer, openGlRenderWindow: object, color: RGBColor = [1, 0, 0], visible: boolean = true) {
    this.visible = visible;
    this.#length = 20;
    this.#camera = renderer.getActiveCamera();
    this.#openGlRenderWindow = openGlRenderWindow;
    this.#color = color;
    // @ts-ignore
    this.#gl = openGlRenderWindow.getContext();
    this.#rayVbo = vtkOpenGLBufferObject.newInstance();
    // @ts-ignore
    this.#rayVbo.setOpenGLRenderWindow(this.#openGlRenderWindow);
    this.#loaded = false;

    // vertex array object
    this.#vao = vtkOpenGLVertexArrayObject.newInstance();
    // @ts-ignore
    this.#vao.setOpenGLRenderWindow(this.#openGlRenderWindow);
  }

  build() {
    const vert = Float32Array.from([0, 0, 0, 0, 0, -1]);

    // @ts-ignore
    this.#rayVbo.upload(vert, ObjectType.ARRAY_BUFFER);

    // @ts-expect-error
    this.#program = this.#openGlRenderWindow.getShaderCache().readyShaderProgramArray(
      vertexShader,
      fragmentShader,
      ""
    );

    // @ts-ignore
    this.#vao.bind();

    // @ts-ignore
    this.#vao.addAttributeArray(
      this.#program, 
      this.#rayVbo,
      "position", // name
      0, // offset 
      3 * 4, // stride (a float is four bytes)
      this.#gl.FLOAT, // type
      3, // tuple size 
      false // do not normalize
    );
  }

  render(inputSourcePose: XRPose) {
    if (!this.#loaded) {
      this.build();
      this.#loaded = true;
    }
    this.#gl.depthMask(true);
    // @ts-expect-error
    this.#openGlRenderWindow.getShaderCache().readyShaderProgram(this.#program);

    // @ts-ignore
    this.#vao.bind();
    
    const unitV: Vector4 = [0, 0, 0, 1];
    
    // todo transpose physical to projection
    const initialMatrix = inputSourcePose.transform.matrix;
    const projectionMatrix = this.#camera.getProjectionMatrix(1, -1, 1);
    const multipliedMatrix = new Float32Array(16);
    mat4.multiply(multipliedMatrix, projectionMatrix, initialMatrix);

    const poseMatrix = new Float32Array(16);
    mat4.transpose(poseMatrix, multipliedMatrix);

    const scaleFactor = vtkMath.norm(this.#multiplyPoint(poseMatrix, unitV), 4);

    // @ts-ignore
    this.#program.setUniformf("scale", this.#length / scaleFactor);
    // this.#program.setUniformf("scale", 1);

    // @ts-ignore
    this.#program.setUniform3fArray("color", this.#color);
    // @ts-ignore
    this.#program.setUniformMatrix("matrix", poseMatrix);

    // 2 or 6 ?
    this.#gl.drawArrays(this.#gl.LINES, 0, 2);
  }
  
  #multiplyPoint(poseMatrix: mat4, point: Vector4): Vector4 {
    // @ts-ignore
    const out: Vector4 = [];
    out[0] = point[0] * poseMatrix[0] + point[1] * poseMatrix[1] + point[2] * poseMatrix[2] + point[3] * poseMatrix[3];
    out[1] = point[0] * poseMatrix[4] + point[1] * poseMatrix[5] + point[2] * poseMatrix[6] + point[3] * poseMatrix[7];
    out[2] = point[0] * poseMatrix[8] + point[1] * poseMatrix[9] + point[2] * poseMatrix[10] + point[3] * poseMatrix[11];
    out[3] = point[0] * poseMatrix[12] + point[1] * poseMatrix[13] + point[2] * poseMatrix[14] + point[3] * poseMatrix[15];
    return out;
  }
}