import vtkRenderer from 'vtk.js/Sources/Rendering/Core/Renderer';
import vtkRenderWindowInteractor from "vtk.js/Sources/Rendering/Core/RenderWindowInteractor";
import { Device } from "vtk.js/Sources/Rendering/Core/RenderWindowInteractor/Constants";
import { Vector3, Vector4 } from "vtk.js/Sources/types";
import { cellPicker } from '.';
import { VRRay } from '../vrRay/vrRay';

// Camera focal plane
let renderer: vtkRenderer | null = null;
let vrRay: VRRay | null = null;

function handleMove3D(event) {
  if (event.device === Device.LeftController) {
    vrRay.render(event.targetRayPose);
  }
}

function handleButton3D(event) {
  if (event.device === Device.LeftController) {
    const { targetRayPose } = event;
    console.log(targetRayPose);
    const rayPoseOrientation = targetRayPose.transform.orientation;
    const rayPosePosition = targetRayPose.transform.position;
    console.log("trying to pick");
    const pos: Vector3 = [rayPosePosition.x, rayPosePosition.y, rayPosePosition.z];
    const wori: Vector4 = [0, rayPoseOrientation.x, rayPoseOrientation.y, rayPoseOrientation.z];
    // const wori: Vector4 = [0, 0, 0, 1];
    console.log({pos, wori });
    cellPicker.pick3DRay(pos, wori, renderer);
  
    const pickedPoint = cellPicker.getPickPosition();
    const cellId = cellPicker.getCellId();
    console.log({ pickedPoint, cellId});
    // showCell(cellId);
  }
}

export function setState(rendererToUse: vtkRenderer) {
  renderer = rendererToUse;
  const openGlRenderWindow = rendererToUse.getRenderWindow().getViews()[0]
  vrRay = new VRRay(renderer, openGlRenderWindow);
}

export function setupVrInteractions(interactor: vtkRenderWindowInteractor) {
  interactor.onMove3D(handleMove3D);
  interactor.onButton3D(handleButton3D);
}

export function setupRegularInteractions(interactor: vtkRenderWindowInteractor) {
  interactor.onRightButtonPress(({ position }) => {
    const cameraPosition = renderer.getActiveCamera().getPosition();
    // cellPicker.pick3DRay([position.x, position.y, position.z], [0, 0, 1], renderer);
    // cellPicker.pick([position.x, position.y, 1.0], renderer);
    const cellId = cellPicker.getCellId();
    const pickedPosition = cellPicker.getPickPosition();
    console.log({ cellId, pickedPosition });
    // showCell(cellId);
  });
}