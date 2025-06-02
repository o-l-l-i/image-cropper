import { DOM } from './dom.js';
import {
    originalImageRef,
    naturalCropData,
    screenCropData,
} from './globals.js'

export function createAppStateManager({
    setCropInputsDisabled,
    resetCropInputs,
}) {
    function resetAll() {
        originalImageRef.current = null;
        DOM.fileInput.value = '';
        Object.assign(naturalCropData, { x: 0, y: 0, width: 0, height: 0 });
        Object.assign(screenCropData, { x: 0, y: 0, width: 0, height: 0 });
        DOM.cropSelection.classList.add('hidden');
        DOM.previewImage.src = '';
        DOM.croppedImage.src = '';

        DOM.uploadArea.classList.remove('hidden');
        DOM.imageContainer.classList.add('hidden');
        DOM.controls.classList.add('hidden');
        DOM.resultContainer.classList.add('hidden');
        DOM.cropBtn.disabled = true;
        setCropInputsDisabled(true);
        resetCropInputs();
    }

    function setPreviewImageSource(img) {
        DOM.previewImage.src = img.src;
    }

    function configurePreviewImageStyle() {
        const maxWidth = 1024;
        const maxHeight = 1024;
        DOM.previewImage.style.maxWidth = `${maxWidth}px`;
        DOM.previewImage.style.maxHeight = `${maxHeight}px`;
    }

    function updateUIForImageLoad() {
        DOM.uploadArea.classList.add('hidden');
        DOM.imageContainer.classList.remove('hidden');
        DOM.controls.classList.remove('hidden');
        DOM.resultContainer.classList.add('hidden');
    }

    function initializeImageDisplay(img) {
        setPreviewImageSource(img);
        configurePreviewImageStyle();
        updateUIForImageLoad();
    }

    return {
        resetAll,
        initializeImageDisplay,
    }
}