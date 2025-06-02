import { DOM } from './dom.js';
import { aspectRatioLockedRef } from './globals.js';

export function createCropUIController() {

    function setCropInputsDisabled(state) {
        [DOM.inputX, DOM.inputY, DOM.inputWidth, DOM.inputHeight].forEach(input => {
            input.disabled = state;
        });
        DOM.aspectRatioToggle.disabled = state;
    }

    function resetCropInputs() {
        [DOM.inputX, DOM.inputY, DOM.inputWidth, DOM.inputHeight].forEach(input => {
            input.value = '';
        });
        DOM.aspectRatioToggle.checked = false;
        aspectRatioLockedRef.current = false;
    }

    return {
        setCropInputsDisabled,
        resetCropInputs,
    }
}