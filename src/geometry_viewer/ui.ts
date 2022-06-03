import { loadTexture } from ".";
import { startXr, stopXr } from "..";
import { rootControllerContainer, sessionType } from "../ui";
// @ts-ignore
import style from './GeometryViewer.module.css';

const bodyElement: HTMLBodyElement = document.querySelector('body');
bodyElement.style.margin = '0';
bodyElement.style.padding = '0';

let xrSessionActive = false;

function toggleXR(event) {
  const label = sessionType === "ar" ? "AR" : "VR";
  if (xrSessionActive) {
    // Exit the XR session
    stopXr();
    event.target.textContent = `Exit ${label} session`;
  } else {
    // start the XR session
    startXr();
    event.target.textContent = `Start ${label} session`;
    xrSessionActive = true;
  }
}

function onTextureSelectorChange(e) {
  const imageTextureFile = e.target.files[0];
  const img = new Image();
  const objectUrl = URL.createObjectURL(imageTextureFile);
  img.addEventListener('load', () => {
    URL.revokeObjectURL(objectUrl);
  });
  img.src = objectUrl;
  loadTexture(img);
}

export function setupViewerControls() {
  const textureSelector = document.createElement('input');
  textureSelector.setAttribute('type', 'file');

  const immersionSelector = document.createElement('button');

  const label = sessionType === "ar" ? "AR" : "VR";
  immersionSelector.innerHTML = `Start ${label} session`;

  const controlContainer = document.createElement('div');
  controlContainer.setAttribute('class', style.control);
  controlContainer.appendChild(textureSelector);

  // Setup view controls listeners
  textureSelector.addEventListener('change', onTextureSelectorChange);

  if (
    navigator.xr !== undefined &&
    navigator.xr.isSessionSupported('immersive-vr')
  ) {
    controlContainer.appendChild(immersionSelector);
  }

  immersionSelector.addEventListener('click', toggleXR);

  rootControllerContainer.appendChild(controlContainer);

  bodyElement.appendChild(rootControllerContainer);
}