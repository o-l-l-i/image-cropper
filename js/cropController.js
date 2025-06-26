import { DOM } from './dom.js';
import { waitForLayoutStabilization } from './utils.js'
import {
    originalImageRef,
    originalFilename,
    naturalCropData,
    screenCropData,
    startPos,
    initialMouse,
    initialCrop,
    fixedRatioRef,
    scaleFactorRef,
    isResizingRef,
    isDraggingRef,
    aspectRatioLockedRef,
} from './globals.js'

export function createCropController({
    updateMasks,
    updateCropUIValues,
    showSpinner,
    hideSpinner,
}) {

    let resizeHandle = null;

    function resetCropSelection() {
        Object.assign(naturalCropData, { x: 0, y: 0, width: 0, height: 0 });
        Object.assign(screenCropData, { x: 0, y: 0, width: 0, height: 0 });
    }

    function updateCropUI() {
        updateCropSelectionElement();
        updateMasks();
        updateCropUIValues();
    }

    function setCropBounds(x = 0, y = 0, width = null, height = null) {
        if (!originalImageRef.current) return;

        const imgWidth = originalImageRef.current.naturalWidth;
        const imgHeight = originalImageRef.current.naturalHeight;

        const clampedX = Math.max(0, Math.min(x, imgWidth));
        const clampedY = Math.max(0, Math.min(y, imgHeight));

        const maxWidth = imgWidth - clampedX;
        const maxHeight = imgHeight - clampedY;

        const finalWidth = Math.min(width ?? maxWidth, maxWidth);
        const finalHeight = Math.min(height ?? maxHeight, maxHeight);

        naturalCropData.x = clampedX;
        naturalCropData.y = clampedY;
        naturalCropData.width = finalWidth;
        naturalCropData.height = finalHeight;

        screenCropData.x = Math.round(clampedX / scaleFactorRef.current);
        screenCropData.y = Math.round(clampedY / scaleFactorRef.current);
        screenCropData.width = Math.round(finalWidth / scaleFactorRef.current);
        screenCropData.height = Math.round(finalHeight / scaleFactorRef.current);
    }

    function recalculateScaleAndOverlay() {
        if (!originalImageRef.current || !DOM.previewImage) return;

        waitForLayoutStabilization(() => {
            const rect = DOM.previewImage.getBoundingClientRect();

            if (rect.width === 0) return;

            scaleFactorRef.current = originalImageRef.current.naturalWidth / rect.width;

            screenCropData.x = naturalCropData.x / scaleFactorRef.current;
            screenCropData.y = naturalCropData.y / scaleFactorRef.current;
            screenCropData.width = naturalCropData.width / scaleFactorRef.current;
            screenCropData.height = naturalCropData.height / scaleFactorRef.current;

            syncCropOverlay();
            updateCropUI();
        }, 50);

    }

    function startCropAuto() {
        setCropBounds(0, 0, originalImageRef.current.naturalWidth, originalImageRef.current.naturalHeight);
        DOM.cropSelection.classList.remove('hidden');
        DOM.cropBtn.disabled = false;
    }

    function onMouseDownStartCrop(e) {

        e.preventDefault();
        DOM.cropOverlay.setPointerCapture(e.pointerId);

        recalculateScaleAndOverlay();

        initialMouse.x = e.clientX;
        initialMouse.y = e.clientY;
        Object.assign(initialCrop, naturalCropData);

        if (e.target.classList.contains('resize-handle')) {
            isResizingRef.current = true;
            resizeHandle = e.target.classList[1];
            startPos.x = e.clientX;
            startPos.y = e.clientY;
        } else if (e.target === DOM.cropSelection) {
            isDraggingRef.current = true;
            startPos.x = e.clientX;
            startPos.y = e.clientY;
        }
    }

    function onMouseMoveUpdateCrop(e) {
        if (!isResizingRef.current && !isDraggingRef.current) return;

        if (isDraggingRef.current) {
            moveCropSelection(e);

        } else if (isResizingRef.current) {
            resizeCropSelection(e);
        }
    }

    function onMouseUpEndCrop(e) {
        if (!isDraggingRef.current && !isResizingRef.current) return;

        DOM.cropOverlay.releasePointerCapture(e.pointerId);

        DOM.cropBtn.disabled = false;
        isDraggingRef.current = false;
        isResizingRef.current = false;
        resizeHandle = null;

        updateCropUI();
    }

    function syncCropOverlay() {
        const rect = DOM.previewImage.getBoundingClientRect();
        const containerRect = DOM.imageContainer.getBoundingClientRect();

        DOM.cropOverlay.style.width = rect.width + 'px';
        DOM.cropOverlay.style.height = rect.height + 'px';
        DOM.cropOverlay.style.left = (rect.left - containerRect.left) + 'px';
        DOM.cropOverlay.style.top = (rect.top - containerRect.top) + 'px';

        DOM.cropOverlay.style.pointerEvents = 'auto';
    }

    function resizeCropSelection(e) {
        const dx = (e.clientX - initialMouse.x);
        const dy = (e.clientY - initialMouse.y);

        const ndx = dx * scaleFactorRef.current;
        const ndy = dy * scaleFactorRef.current;

        const minWidth = 20;
        const minHeight = 20;

        const maxX = originalImageRef.current.naturalWidth;
        const maxY = originalImageRef.current.naturalHeight;

        let newX = initialCrop.x;
        let newY = initialCrop.y;
        let newWidth = initialCrop.width;
        let newHeight = initialCrop.height;

        if (aspectRatioLockedRef.current) {
            switch (resizeHandle) {
                case 'se': {

                    newWidth = Math.min(maxX - newX, Math.max(minWidth, initialCrop.width + ndx));
                    newHeight = Math.round(newWidth / fixedRatioRef.current);

                    if (newY + newHeight > maxY) {
                        newHeight = maxY - newY;
                        newWidth = Math.round(newHeight * fixedRatioRef.current);
                    }

                    break;
                }
                case 'sw': {

                    newX = initialCrop.x + ndx;
                    newX = Math.max(0, Math.min(newX, initialCrop.x + initialCrop.width - minWidth));

                    newWidth = initialCrop.x + initialCrop.width - newX;
                    newHeight = Math.round(newWidth / fixedRatioRef.current);

                    if (newY + newHeight > maxY) {
                        newHeight = maxY - newY;
                        newWidth = Math.round(newHeight * fixedRatioRef.current);
                        newX = initialCrop.x + initialCrop.width - newWidth;
                    }

                    break;
                }
                case 'ne': {

                    newY = initialCrop.y + ndy;
                    newY = Math.max(0, Math.min(newY, initialCrop.y + initialCrop.height - minHeight));

                    newHeight = initialCrop.y + initialCrop.height - newY;
                    newWidth = Math.round(newHeight * fixedRatioRef.current);

                    if (newX + newWidth > maxX) {
                        newWidth = maxX - newX;
                        newHeight = Math.round(newWidth / fixedRatioRef.current);
                        newY = initialCrop.y + initialCrop.height - newHeight;
                    }

                    break;
                }
                case 'nw': {

                    newX = initialCrop.x + ndx;
                    newX = Math.max(0, Math.min(newX, initialCrop.x + initialCrop.width - minWidth));

                    newWidth = initialCrop.x + initialCrop.width - newX;
                    newHeight = Math.round(newWidth / fixedRatioRef.current);

                    newY = initialCrop.y + initialCrop.height - newHeight;

                    if (newY < 0) {
                        newY = 0;
                        newHeight = initialCrop.y + initialCrop.height - newY;
                        newWidth = Math.round(newHeight * fixedRatioRef.current);
                        newX = initialCrop.x + initialCrop.width - newWidth;
                    }

                    break;
                }
            }
        } else {

            switch (resizeHandle) {
                case 'se':
                    newWidth = Math.min(maxX - newX, Math.max(minWidth, initialCrop.width + ndx));
                    newHeight = Math.min(maxY - newY, Math.max(minHeight, initialCrop.height + ndy));
                    break;
                case 'sw':
                    newX = initialCrop.x + ndx;
                    newX = Math.max(0, Math.min(newX, initialCrop.x + initialCrop.width - minWidth));

                    newWidth = initialCrop.x + initialCrop.width - newX;
                    newHeight = Math.min(maxY - newY, Math.max(minHeight, initialCrop.height + ndy));
                    break;
                case 'ne':
                    newY = initialCrop.y + ndy;
                    newY = Math.max(0, Math.min(newY, initialCrop.y + initialCrop.height - minHeight));

                    newWidth = Math.min(maxX - newX, Math.max(minWidth, initialCrop.width + ndx));
                    newHeight = initialCrop.y + initialCrop.height - newY;
                    break;
                case 'nw':
                    newX = initialCrop.x + ndx;
                    newY = initialCrop.y + ndy;

                    newX = Math.max(0, Math.min(newX, initialCrop.x + initialCrop.width - minWidth));
                    newY = Math.max(0, Math.min(newY, initialCrop.y + initialCrop.height - minHeight));

                    newWidth = initialCrop.x + initialCrop.width - newX;
                    newHeight = initialCrop.y + initialCrop.height - newY;
                    break;
            }

            newWidth = Math.round(newWidth);
            newHeight = Math.round(newHeight);
        }

        screenCropData.x = newX / scaleFactorRef.current;
        screenCropData.y = newY / scaleFactorRef.current;
        screenCropData.width = newWidth / scaleFactorRef.current;
        screenCropData.height = newHeight / scaleFactorRef.current;

        naturalCropData.x = newX;
        naturalCropData.y = newY;
        naturalCropData.width = newWidth;
        naturalCropData.height = newHeight;

        updateCropUI();
    }

    function moveCropSelection(e) {
        const dx = (e.clientX - initialMouse.x) * scaleFactorRef.current;
        const dy = (e.clientY - initialMouse.y) * scaleFactorRef.current;

        const naturalWidth = originalImageRef.current.naturalWidth;
        const naturalHeight = originalImageRef.current.naturalHeight;

        let newX = initialCrop.x + dx;
        let newY = initialCrop.y + dy;

        const maxX = naturalWidth - naturalCropData.width;
        const maxY = naturalHeight - naturalCropData.height;

        naturalCropData.x = Math.max(0, Math.min(maxX, newX));
        naturalCropData.y = Math.max(0, Math.min(maxY, newY));

        screenCropData.x = naturalCropData.x / scaleFactorRef.current;
        screenCropData.y = naturalCropData.y / scaleFactorRef.current;

        updateCropUI();
    }

    function updateCropSelectionElement() {
        DOM.cropSelection.style.left = screenCropData.x + 'px';
        DOM.cropSelection.style.top = screenCropData.y + 'px';
        DOM.cropSelection.style.width = screenCropData.width + 'px';
        DOM.cropSelection.style.height = screenCropData.height + 'px';
    }

    function getNaturalCropData() {
        return { ...naturalCropData };
    }

    function performCrop() {
        if (!originalImageRef.current || naturalCropData.width === 0 || naturalCropData.height === 0) return;

        showSpinner();

        setTimeout(() => {
            const { x, y, width, height } = getNaturalCropData();

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = Math.round(width);
            canvas.height = Math.round(height);

            ctx.drawImage(
                originalImageRef.current,
                x, y, width, height,
                0, 0, width, height
            );

            DOM.croppedImage.src = canvas.toDataURL();
            DOM.resultContainer.classList.remove('hidden');

            const resizeObserver = new ResizeObserver(() => {
                syncCropOverlay();
                updateCropUI();
            });
            resizeObserver.observe(originalImageRef.current);

            DOM.downloadBtn.onclick = () => {
            showSpinner();

            setTimeout(() => {
                const original = originalFilename.current || 'image';
                const baseName = original.replace(/\.[^/.]+$/, '');
                const match = original.match(/\.[^/.]+$/);
                const ext = match ? match[0] : '.png';
                const newName = `${baseName}_cropped${ext}`;

                try {
                    const link = document.createElement('a');
                    link.download = newName;
                    link.href = DOM.croppedImage.src || canvas.toDataURL('image/png');
                    link.click();
                } catch (err) {
                    console.error("Download failed:", err);
                    alert("Something went wrong during download.");
                }

                hideSpinner();
            }, 0);
        };

            hideSpinner();
        }, 0);
    }

    return {
        resetCropSelection,
        startCropAuto,

        onMouseDownStartCrop,
        onMouseMoveUpdateCrop,
        onMouseUpEndCrop,
        getNaturalCropData,
        performCrop,
        updateCropUI,
        recalculateScaleAndOverlay,
    };

}