import vtkRenderer from 'vtk.js/Sources/Rendering/Core/Renderer';
import vtkRenderWindow from 'vtk.js/Sources/Rendering/Core/RenderWindow';
import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import 'vtk.js/Sources/Rendering/Profiles/Geometry';
import 'vtk.js/Sources/Rendering/Profiles/Volume';
import { RGBColor } from 'vtk.js/Sources/types';

import { sessionType, setupExamplesSelection } from './ui';

let fullScreenRenderWindow: vtkFullScreenRenderWindow | null = null;
let renderer: vtkRenderer | null = null;
let renderWindow: vtkRenderWindow | null = null;
let background: RGBColor = [0, 0, 0];

export function setupFullScreenRenderWindow(container) {
  fullScreenRenderWindow = vtkFullScreenRenderWindow.newInstance({
    background,
    // @ts-expect-error rootContainer
    rootContainer: container,
    containerStyle: { height: '100%', width: '100%', position: 'absolute' },
  });
  renderer = fullScreenRenderWindow.getRenderer();
  renderWindow = fullScreenRenderWindow.getRenderWindow();

  return {
    fullScreenRenderWindow,
    renderer,
    renderWindow
  };
}

export function startXr() {
  const sessionIsAr = sessionType === "ar";
  fullScreenRenderWindow.setBackground([...background, 0]);
  fullScreenRenderWindow.getApiSpecificRenderWindow().startXR(sessionIsAr);
}

export function stopXr() {
  const sessionIsAr = sessionType === "ar";
  fullScreenRenderWindow.setBackground([...background, 255]);
  fullScreenRenderWindow.getApiSpecificRenderWindow().stopXR(sessionIsAr);
}

setupExamplesSelection();
