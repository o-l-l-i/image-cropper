import { DOM } from './dom.js';

export function createSpinnerController() {

    let spinnerVisibleSince = null;
    const MIN_SPINNER_TIME = 500;

    function showSpinner() {
        spinnerVisibleSince = Date.now();
        DOM.spinnerElement.classList.remove('hidden');
    }

    function hideSpinner() {
        const elapsed = Date.now() - spinnerVisibleSince;
        if (elapsed < MIN_SPINNER_TIME) {
            setTimeout(() => {
                DOM.spinnerElement.classList.add('hidden');
            }, MIN_SPINNER_TIME - elapsed);
        } else {
            DOM.spinnerElement.classList.add('hidden');
        }
    }

    return {
        showSpinner,
        hideSpinner,
    }
}
