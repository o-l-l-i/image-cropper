import {
  initDOMEvents,
  initUploadAreaEvents,
  initCropEvents,
  initInputEvents,
} from './js/events.js';
import { createAppStateManager } from './js/appState.js';
import { createFileHandler } from './js/fileInput.js';
import { createCropController } from './js/cropController.js';
import { createCropUIController } from './js/cropUI.js';
import { createCropUIValueUpdater } from './js/cropUIValueUpdater.js'
import { createCropInputHandler } from './js/cropInputs.js';
import { createMaskUpdater } from './js/mask.js';
import { createSpinnerController } from './js/spinner.js';

initApp();

export function initApp() {

  const updateMasks = createMaskUpdater();

  const updateCropUIValues = createCropUIValueUpdater();

  const { showSpinner, hideSpinner } = createSpinnerController();

  const cropController = createCropController({
    updateMasks,
    updateCropUIValues,
    showSpinner,
    hideSpinner
  });
  const {
    resetCropSelection,
    startCropAuto,
    onMouseDownStartCrop,
    onMouseMoveUpdateCrop,
    onMouseUpEndCrop,
    performCrop,
    updateCropUI,
    recalculateScaleAndOverlay
  } = cropController;

  const cropUI = createCropUIController();
  const {
    setCropInputsDisabled,
    resetCropInputs
  } = cropUI;

  const appState = createAppStateManager({
    setCropInputsDisabled,
    resetCropInputs
  });
  const { resetAll, initializeImageDisplay,
  } = appState;

  const { handleFile, openFileInput } = createFileHandler({
    startCropAuto,
    setCropInputsDisabled,
    resetAll,
    initializeImageDisplay,
    showSpinner,
    hideSpinner,
    resetCropSelection,
    recalculateScaleAndOverlay,
  });

  const { validateAndApplyInputCrop, bindCropInputs } = createCropInputHandler({
    updateCropUI,
  });

  document.getElementById('uploadArea').addEventListener('click', openFileInput);

  initUploadAreaEvents(handleFile);

  initCropEvents({
    updateCropUI,
    recalculateScaleAndOverlay
  });

  initInputEvents({
    validateAndApplyInputCrop,
    onMouseDownStartCrop,
    onMouseMoveUpdateCrop,
    onMouseUpEndCrop,
    performCrop,
    resetAll
  });

  initDOMEvents(bindCropInputs);
}