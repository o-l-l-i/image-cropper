import { DOM } from './dom.js';
import { clamp } from './utils.js';
import {
    originalImageRef,
    naturalCropData,
    screenCropData,
    aspectRatioLockedRef,
    scaleFactorRef,
} from './globals.js'

export function createCropInputHandler({
    updateCropUI,
}) {
    function validateAndApplyInputCrop() {
        const naturalWidth = originalImageRef.current.naturalWidth;
        const naturalHeight = originalImageRef.current.naturalHeight;

        let x = parseInt(DOM.inputX.value, 10);
        let y = parseInt(DOM.inputY.value, 10);
        let width = parseInt(DOM.inputWidth.value, 10);
        let height = parseInt(DOM.inputHeight.value, 10);

        if (isNaN(x)) x = naturalCropData.x;
        if (isNaN(y)) y = naturalCropData.y;
        if (isNaN(width)) width = naturalCropData.width;
        if (isNaN(height)) height = naturalCropData.height;

        width = clamp(width, 1, naturalWidth);

        if (aspectRatioLockedRef.current) {
            height = width;
        } else {
            height = clamp(height, 1, naturalHeight);
        }

        x = clamp(x, 0, naturalWidth - width);
        y = clamp(y, 0, naturalHeight - height);

        naturalCropData.x = x;
        naturalCropData.y = y;
        naturalCropData.width = width;
        naturalCropData.height = height;

        screenCropData.x = x / scaleFactorRef.current;
        screenCropData.y = y / scaleFactorRef.current;
        screenCropData.width = width / scaleFactorRef.current;
        screenCropData.height = height / scaleFactorRef.current;

        updateCropUI();
    }

    function bindCropInputs() {
        const inputs = {
            x: DOM.inputX,
            y: DOM.inputY,
            width: DOM.inputWidth,
            height: DOM.inputHeight
        };

        for (const key in inputs) {
            inputs[key].addEventListener("change", () => {

                let newX = parseInt(inputs.x.value, 10);
                let newY = parseInt(inputs.y.value, 10);
                let newWidth = parseInt(inputs.width.value, 10);
                let newHeight = parseInt(inputs.height.value, 10);

                const maxWidth = originalImageRef.current.naturalWidth;
                const maxHeight = originalImageRef.current.naturalHeight;

                newX = clamp(newX, 0, maxWidth - 1);
                newY = clamp(newY, 0, maxHeight - 1);
                newWidth = clamp(newWidth, 1, maxWidth - newX);
                newHeight = clamp(newHeight, 1, maxHeight - newY);

                naturalCropData.x = newX;
                naturalCropData.y = newY;
                naturalCropData.width = newWidth;
                naturalCropData.height = newHeight;

                screenCropData.x = newX / scaleFactorRef.current;
                screenCropData.y = newY / scaleFactorRef.current;
                screenCropData.width = newWidth / scaleFactorRef.current;
                screenCropData.height = newHeight / scaleFactorRef.current;

                updateCropUI();
            });
        }
    }

    return {
        validateAndApplyInputCrop,
        bindCropInputs,
    }
}