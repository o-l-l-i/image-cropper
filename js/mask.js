import { DOM } from './dom.js';
import { clamp } from './utils.js';

export function createMaskUpdater() {

    return function updateMasks() {
        const cropRect = DOM.cropSelection.getBoundingClientRect();
        const overlayRect = DOM.cropOverlay.getBoundingClientRect();

        const top = clamp(Math.round(cropRect.top - overlayRect.top), 0, overlayRect.height);
        const bottom = clamp(Math.round(cropRect.bottom - overlayRect.top), 0, overlayRect.height);
        const left = clamp(Math.round(cropRect.left - overlayRect.left), 0, overlayRect.width);
        const right = clamp(Math.round(cropRect.right - overlayRect.left), 0, overlayRect.width);

        DOM.topMask.style.top = '0px';
        DOM.topMask.style.left = '0px';
        DOM.topMask.style.width = overlayRect.width + 'px';
        DOM.topMask.style.height = top + 'px';

        DOM.bottomMask.style.top = bottom + 'px';
        DOM.bottomMask.style.left = '0px';
        DOM.bottomMask.style.width = overlayRect.width + 'px';
        DOM.bottomMask.style.height = (overlayRect.height - bottom) + 'px';

        DOM.leftMask.style.top = top + 'px';
        DOM.leftMask.style.left = '0px';
        DOM.leftMask.style.width = left + 'px';
        DOM.leftMask.style.height = (bottom - top) + 'px';

        DOM.rightMask.style.top = top + 'px';
        DOM.rightMask.style.left = right + 'px';
        DOM.rightMask.style.width = (overlayRect.width - right) + 'px';
        DOM.rightMask.style.height = (bottom - top) + 'px';
    };
}