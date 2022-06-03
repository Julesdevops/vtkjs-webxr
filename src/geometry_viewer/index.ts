import vtkCellArray from "vtk.js/Sources/Common/Core/CellArray";
import vtkPoints from "vtk.js/Sources/Common/Core/Points";
import vtkPolyData from "vtk.js/Sources/Common/DataModel/PolyData";
import vtkTriangle from "vtk.js/Sources/Common/DataModel/Triangle";
import vtkXMLPolyDataReader from "vtk.js/Sources/IO/XML/XMLPolyDataReader";
import vtkActor from "vtk.js/Sources/Rendering/Core/Actor";
import vtkCellPicker from "vtk.js/Sources/Rendering/Core/CellPicker";
import vtkMapper from "vtk.js/Sources/Rendering/Core/Mapper";
import vtkRenderer from "vtk.js/Sources/Rendering/Core/Renderer";
import vtkRenderWindow from "vtk.js/Sources/Rendering/Core/RenderWindow";
import vtkTexture from "vtk.js/Sources/Rendering/Core/Texture";
import vtkFullScreenRenderWindow from "vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow";
import vtkMatrixBuilder from "vtk.js/Sources/Common/Core/MatrixBuilder";
import { setupViewerControls } from "./ui";
import { setState, setupRegularInteractions, setupVrInteractions } from "./interactions";
import { setupFullScreenRenderWindow } from "..";

let renderWindow: vtkRenderWindow | null = null;
let rotationMatrix = null;
export let renderer: vtkRenderer = null;

let fullScreenRenderWindow: vtkFullScreenRenderWindow | null = null;
const inputDatasetMapper: vtkMapper = vtkMapper.newInstance();
const inputDatasetActor: vtkActor = vtkActor.newInstance();
inputDatasetActor.setMapper(inputDatasetMapper);
let inputDataset: vtkPolyData | null = null;

// Setup picking
export const cellPicker: vtkCellPicker = vtkCellPicker.newInstance();
const pickMapper: vtkMapper = vtkMapper.newInstance(); 
pickMapper.setInputData(vtkPolyData.newInstance());
const pickActor: vtkActor = vtkActor.newInstance();
pickActor.setMapper(pickMapper);
pickActor.getProperty().setColor(255, 0, 0);
pickActor.getProperty().setLineWidth(3);
cellPicker.setPickFromList(1);
cellPicker.setTolerance(0);
cellPicker.initializePickList();
cellPicker.addPickList(inputDatasetActor);

export function setupViewer(container) {
  const renderingComponents = setupFullScreenRenderWindow(container);
  fullScreenRenderWindow = renderingComponents.fullScreenRenderWindow;
  renderWindow = renderingComponents.renderWindow;
  renderer = renderingComponents.renderer;

  setState(renderer);

  // Add all actors to the renderer
  renderer.addActor(pickActor);
  renderer.addActor(inputDatasetActor);

  const rwi = renderWindow.getInteractor();
  rwi.setDesiredUpdateRate(15);
  
  setupRegularInteractions(rwi);
  setupVrInteractions(rwi);

  // Expose some variables globally
  // @ts-ignore
  window.camera = renderer.getActiveCamera();
  // @ts-ignore
  window.rerender = renderWindow.render;
  // @ts-ignore
  window.renderer = renderer;

  setupViewerControls();
}

export function loadDataset(fileContent) {
  // Parse VTP data
  const vtpReader = vtkXMLPolyDataReader.newInstance();
  vtpReader.parseAsArrayBuffer(fileContent);
  inputDataset = vtpReader.getOutputData(0);

  // Load the input dataset into the mapper
  inputDatasetMapper.setInputData(inputDataset);

  // Rotate the dataset
  const rotationMatrixTransform = vtkMatrixBuilder.buildFromDegree().rotateX(-90);
  rotationMatrix = rotationMatrixTransform.getMatrix();
  inputDatasetActor.setUserMatrix(rotationMatrix);

  // First render
  renderer.resetCamera();
  renderWindow.render();
}

export function loadTexture(img: HTMLImageElement) {
  if (!inputDataset) {
    throw new Error("Load a dataset first before loading a texture.");
  }

  // Create and apply a new texture
  const texture = vtkTexture.newInstance();

  texture.setImage(img);
  texture.setInterpolate(true);
  
  inputDatasetActor.addTexture(texture);
  inputDataset.getPointData().setActiveTCoords("TCoords");
}

export function showCell(cellId: number) {
  const pickPd = vtkPolyData.newInstance();
  const cell = vtkTriangle.newInstance();
  const pickPdPoints = vtkPoints.newInstance();
  pickPdPoints.setNumberOfPoints(3);
  const pickPdLines = vtkCellArray.newInstance({
    numberOfComponents: 2,
    // @ts-ignore
    numberOfTuples: 3,
    size: 3 * 3
  });

  // Get the picked triangle
  inputDataset.getCell(cellId, cell);
  // Get the points of the picked triangle
  const cellPoints = cell.getPoints();

  let offset = 0;
  const pointIds = [[0, 1], [1, 2], [2, 0]];
  // Get the three points
  for (let i = 0; i < 3; ++i, offset += 3) {
    const tuple = cellPoints.getTuple(i);
    // @ts-ignore
    pickPdPoints.setPoint(i, ...tuple);
    pickPdLines.getData()[offset] = 2;
    pickPdLines.getData()[offset + 1] = pointIds[i][0];
    pickPdLines.getData()[offset + 2] = pointIds[i][1];
  }

  pickPd.setPoints(pickPdPoints);
  pickPd.setLines(pickPdLines);

  pickActor.setUserMatrix(rotationMatrix);
  pickMapper.setInputData(pickPd);
  renderWindow.render();
}