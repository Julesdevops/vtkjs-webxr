import examplesMapping from './examples';
// @ts-ignore
import style from "./Global.module.css";

const bodyElement: HTMLBodyElement = document.querySelector('body');

let selectedExample = null;
let fileContainer = null;
export let rootControllerContainer = null;

export let sessionType = null;

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function emptyContainer(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

function handleFile(e, onFileLoaded) {
  preventDefaults(e);
  const file = e.target.files[0];
  bodyElement.removeChild(fileContainer);
  emptyContainer(bodyElement);

  const reader = new FileReader();
  reader.onload = () => {
    onFileLoaded(reader.result);
  };
  reader.readAsArrayBuffer(file);
}

export function setupFileLoader(onFileLoaded: () => void) {
  rootControllerContainer = document.createElement('div');
  rootControllerContainer.setAttribute('class', style.rootController);

  const addDataSetButton = document.createElement('img');
  addDataSetButton.setAttribute('class', style.button);
  addDataSetButton.addEventListener('click', () => {
    const isVisible = rootControllerContainer.style.display !== 'none';
    rootControllerContainer.style.display = isVisible ? 'none' : 'flex';
  });

  bodyElement.classList.add(style.fullScreen);

  fileContainer = document.createElement('div');
  fileContainer.innerHTML = `<div class="${style.bigFileDrop}"/><input type="file" multiple accept=".vtp,.vti" style="display: none;"/>`;
  bodyElement.appendChild(fileContainer);

  const fileInput = fileContainer.querySelector('input');

  // Setup file loader listeners
  fileInput.addEventListener('change', (e) => {
    handleFile(e, onFileLoaded);
  });
  fileContainer.addEventListener('drop', (e) => {
    handleFile(e, onFileLoaded);
  });
  fileContainer.addEventListener('click', () => fileInput.click());
  fileContainer.addEventListener('dragover', preventDefaults);
}

const launchSelectedExample = () => examplesMapping[selectedExample]();

async function checkXr(arOption: HTMLOptionElement, vrOption: HTMLOptionElement) {
  const isXrSupported = navigator.xr !== undefined;

  if (!isXrSupported) {
    return {
      xr: false,
      ar: false,
      vr: false
    };
  }

  const isArSupported = await navigator.xr.isSessionSupported('immersive-ar');
  const isVrSupported = await navigator.xr.isSessionSupported('immersive-vr');

  if (!isXrSupported) {
    alert("WebXR is not supported!");
  }
  
  if (isVrSupported) {
    vrOption.textContent = "VR - SUPPORTED";
  } else {
    vrOption.textContent = "VR - NOT SUPPORTED"
  }
  
  if (isArSupported) {
    arOption.textContent = "AR - SUPPORTED";
  } else {
    arOption.textContent = "AR - NOT SUPPORTED";
  }
}

export async function setupExamplesSelection() {
  const exampleSelect = document.getElementById("examples-select");
  const xrSelect = document.getElementById("xr-select");
  const arOption = document.querySelector("#xr-select > option[value=ar]") as HTMLOptionElement;
  const vrOption = document.querySelector("#xr-select > option[value=vr]") as HTMLOptionElement;
  document.getElementById("check-webxr-btn").addEventListener('click', checkXr.bind(null, arOption, vrOption));

  await checkXr(arOption, vrOption);

  // @ts-expect-error
  selectedExample = exampleSelect.value;
  // @ts-expect-error
  sessionType = xrSelect.value;

  exampleSelect.addEventListener('change', (e) => {
    // @ts-ignore
    selectedExample = e.target.value;
  });

  xrSelect.addEventListener('change', async (e) => {
    await checkXr(arOption, vrOption);
    // @ts-expect-error
    sessionType = e.target.value;
  });

  document.getElementById("launch-example-btn").addEventListener('click', launchSelectedExample);
}