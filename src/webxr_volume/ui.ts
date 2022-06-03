import { startXr, stopXr } from "..";
import { rootControllerContainer, sessionType } from "../ui";
// @ts-ignore
import style from "../Global.module.css";

const bodyElement: HTMLBodyElement = document.querySelector('body');
const SESSION_IS_AR = false;
let xrSessionActive = false;

function toggleXR(event) {
  if (xrSessionActive) {
    // Exit the XR session
    stopXr();
    event.target.textContent = "Exit XR";
  } else {
    // start the XR session
    startXr();
    event.target.textContent = "Start XR";
  }
}

export function setupViewerControls() {
  const immersionSelector = document.createElement('button');

  const label = sessionType === "ar" ? "AR" : "VR";
  immersionSelector.innerHTML = `Start ${label} session`;

  const controlContainer = document.createElement('div');
  controlContainer.setAttribute('class', style.control);

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