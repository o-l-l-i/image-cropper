import { DOM } from './dom.js';
import {
    originalImageRef,
    naturalCropData,
    screenCropData,
    fixedRatioRef,
    aspectRatioLockedRef,
} from './globals.js'

export function initDOMEvents(bindCropInputs) {
    window.addEventListener("DOMContentLoaded", function () {
        bindCropInputs();
    }, false);

}

export function initUploadAreaEvents(handleFile) {
    DOM.uploadArea.addEventListener('click', () => {
        if (!DOM.fileInput) DOM.fileInput.click();
    });

    DOM.fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFile(e.target.files[0]);
    });

    DOM.uploadArea.addEventListener('dragenter', (e) => {
        e.preventDefault();
        DOM.uploadArea.classList.add('dragover');
    });

    DOM.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        DOM.uploadArea.classList.add('dragover');
    });

    DOM.uploadArea.addEventListener('dragleave', () => {
        DOM.uploadArea.classList.remove('dragover');
    });

    DOM.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        DOM.uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFile(files[0]);
    });
}

export function initInputEvents({
    validateAndApplyInputCrop,
    onMouseDownStartCrop,
    onMouseMoveUpdateCrop,
    onMouseUpEndCrop,
    performCrop,
    resetAll,
}) {
    DOM.cropBtn.addEventListener('click', performCrop);
    DOM.resetBtn.addEventListener('click', resetAll);

    DOM.cropOverlay.addEventListener('mousedown', onMouseDownStartCrop);
    document.addEventListener('mousemove', onMouseMoveUpdateCrop);
    document.addEventListener('mouseup', onMouseUpEndCrop);

    [DOM.inputX, DOM.inputY, DOM.inputWidth, DOM.inputHeight].forEach(input => {
        input.addEventListener('change', validateAndApplyInputCrop);
    });

    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });
}

export function initCropEvents({
    updateCropUI,
    recalculateScaleAndOverlay,
}) {
    DOM.aspectRatioToggle.addEventListener('change', () => {
        aspectRatioLockedRef.current = DOM.aspectRatioToggle.checked;
        if (aspectRatioLockedRef.current) {

            if (naturalCropData.width && naturalCropData.height) {

                naturalCropData.height = naturalCropData.width / fixedRatioRef.current;
                screenCropData.height = screenCropData.width / fixedRatioRef.current;
                updateCropUI();
            }
        }
    });

    function onWindowResize() {
        if (!originalImageRef.current) return;
        recalculateScaleAndOverlay();
    }

    window.addEventListener('resize', onWindowResize);
}