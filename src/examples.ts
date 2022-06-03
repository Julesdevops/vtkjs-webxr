import { setupFileLoader } from "./ui";
import { setupViewer as setupWebXRVolumeViewer, loadDataset as loadVti } from "./webxr_volume/index";
import { setupViewer as setupGeometryViewer, loadDataset as loadVtp } from "./geometry_viewer/index";

const bodyElement: HTMLBodyElement = document.querySelector('body');

const loadWebXRVolume = (file) => {
  setupWebXRVolumeViewer(bodyElement);
  loadVti(file);
};

const loadGeometryViewer = (file) => {
  setupGeometryViewer(bodyElement);
  loadVtp(file);
};

const examplesMapping = {
  "webxr-volume": setupFileLoader.bind(null, loadWebXRVolume),
  "geometry-viewer": setupFileLoader.bind(null, loadGeometryViewer)
}

export default examplesMapping;