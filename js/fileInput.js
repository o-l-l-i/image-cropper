import { DOM } from './dom.js';
import {
    originalImageRef,
    originalFilename,
} from './globals.js'
import { waitForLayoutStabilization } from './utils.js'

export function createFileHandler({
    startCropAuto,
    setCropInputsDisabled,
    resetAll,
    initializeImageDisplay,
    showSpinner,
    hideSpinner,
    resetCropSelection,
    recalculateScaleAndOverlay
}) {

    const supportedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'];

    function beginFileRead(file) {
        DOM.previewImage.addEventListener('load', () => {
            DOM.previewImage.classList.add('loaded');
            setCropInputsDisabled(false);
        }, { once: true });

        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                originalImageRef.current = img;
                initializeImageDisplay(img);
                waitForLayoutStabilization(() => {

                    hideSpinner();
                    resetCropSelection();
                    startCropAuto();
                    recalculateScaleAndOverlay();
                    DOM.fileInput.disabled = false;
                }, 50);
            };

            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    }

    function handleFile(file) {
        const isSupportedMime = supportedTypes.includes(file.type);
        const isSupportedExt = /\.(png|jpe?g|webp|gif|avif)$/i.test(file.name);

        if (!isSupportedMime && !isSupportedExt) {
            alert('Unsupported image format. Please use PNG, JPEG, WebP, GIF or AVIF');
            return;
        }

        if (!file.type.startsWith('image/')) return;

        originalFilename.current = file.name;
        DOM.fileInput.disabled = true;
        resetAll();
        DOM.previewImage.classList.remove('loaded');
        showSpinner();

        beginFileRead(file);
    }

    function openFileInput(e) {
        e.stopPropagation();
        DOM.fileInput.click();
    }

    return { handleFile, openFileInput };
}
