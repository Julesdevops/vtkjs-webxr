import vtkXMLImageDataReader from "vtk.js/Sources/IO/XML/XMLImageDataReader";
import vtkVolumeMapper from "vtk.js/Sources/Rendering/Core/VolumeMapper";
import vtkFullScreenRenderWindow from "vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow";
import vtkImageData from "vtk.js/Sources/Common/DataModel/ImageData";
import vtkPiecewiseFunction from 'vtk.js/Sources/Common/DataModel/PiecewiseFunction';
import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';
import { setupFullScreenRenderWindow } from "..";
import vtkRenderWindow from "vtk.js/Sources/Rendering/Core/RenderWindow";
import vtkRenderer from "vtk.js/Sources/Rendering/Core/Renderer";
import vtkVolume from "vtk.js/Sources/Rendering/Core/Volume";
import { setupRegularInteractions } from "./interactions";
import { setupViewerControls } from "./ui";

let fullScreenRenderWindow: vtkFullScreenRenderWindow | null = null;
let renderWindow: vtkRenderWindow | null = null;
let renderer: vtkRenderer | null = null;

const vtiReader = vtkXMLImageDataReader.newInstance();
const inputDatasetActor: vtkVolume = vtkVolume.newInstance();
const volumeMapper = vtkVolumeMapper.newInstance();
volumeMapper.setInputConnection(vtiReader.getOutputPort());
inputDatasetActor.setMapper(volumeMapper);

let inputDataset: vtkImageData | null = null;

// create color and opacity transfer functions
const ctfun = vtkColorTransferFunction.newInstance();
const ofun = vtkPiecewiseFunction.newInstance();

export function setupViewer(container) {
  const renderingComponents = setupFullScreenRenderWindow(container);
  fullScreenRenderWindow = renderingComponents.fullScreenRenderWindow;
  renderWindow = renderingComponents.renderWindow;
  renderer = renderingComponents.renderer;
  renderer.addVolume(inputDatasetActor);

  // const interactor = renderWindow.getInteractor();
  setupViewerControls();
}

export function loadDataset(fileContent) {
  vtiReader.parseAsArrayBuffer(fileContent);
  inputDataset = vtiReader.getOutputData(0);
  const dataArray =
    inputDataset.getPointData().getScalars() || inputDataset.getPointData().getArrays()[0];
  const dataRange = dataArray.getRange();

  // Restyle visual appearance
  const sampleDistance =
    0.7 *
    Math.sqrt(
      inputDataset
        .getSpacing()
        .map((v) => v * v)
        .reduce((a, b) => a + b, 0)
    );
  volumeMapper.setSampleDistance(sampleDistance);

  ctfun.addRGBPoint(dataRange[0], 0.0, 0.3, 0.3);
  ctfun.addRGBPoint(dataRange[1], 1.0, 1.0, 1.0);
  ofun.addPoint(dataRange[0], 0.0);
  ofun.addPoint((dataRange[1] - dataRange[0]) / 4, 0.0);
  ofun.addPoint(dataRange[1], 0.5);

  // @ts-ignore
  inputDatasetActor.getProperty().setRGBTransferFunction(0, ctfun);
  // @ts-ignore
  inputDatasetActor.getProperty().setScalarOpacity(0, ofun);
  // @ts-ignore
  inputDatasetActor.getProperty().setInterpolationTypeToLinear();

  renderer.resetCamera();
  renderWindow.render();
  setupRegularInteractions(renderWindow.getInteractor());
}