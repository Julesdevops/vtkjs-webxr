import vtkRenderWindowInteractor from "vtk.js/Sources/Rendering/Core/RenderWindowInteractor";

export function setupRegularInteractions(interactor: vtkRenderWindowInteractor) {
  interactor.setPreventDefaultOnPointerDown(true);
}