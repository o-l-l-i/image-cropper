import { DOM } from './dom.js';
import {
    originalImageRef,
    naturalCropData,
} from './globals.js';

export function createCropUIValueUpdater() {

    return function updateCropUIValues()
    {
        if (!originalImageRef.current) return;

        DOM.inputX.value = Math.round(naturalCropData.x);
        DOM.inputY.value = Math.round(naturalCropData.y);
        DOM.inputWidth.value = Math.round(naturalCropData.width);
        DOM.inputHeight.value = Math.round(naturalCropData.height);
    }
}