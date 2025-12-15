import Swal from 'sweetalert2';

/**
 * Custom SweetAlert2 theme configuration
 * Matches the SineAI Hub dark theme
 */
export const swalTheme = {
    background: '#1e293b',
    color: '#f1f5f9',
    confirmButtonColor: '#f59e0b',
    cancelButtonColor: '#475569',
    iconColor: '#f59e0b',
    customClass: {
        popup: 'rounded-xl border border-white/10',
        title: 'text-amber-100',
        htmlContainer: 'text-slate-300',
        confirmButton: 'rounded-lg px-6 py-2 font-medium',
        cancelButton: 'rounded-lg px-6 py-2 font-medium',
    },
};

/**
 * Light theme variant (for future use)
 */
export const swalThemeLight = {
    background: '#ffffff',
    color: '#1e293b',
    confirmButtonColor: '#f59e0b',
    cancelButtonColor: '#e2e8f0',
    iconColor: '#f59e0b',
    customClass: {
        popup: 'rounded-xl border border-slate-200',
        title: 'text-slate-800',
        htmlContainer: 'text-slate-600',
        confirmButton: 'rounded-lg px-6 py-2 font-medium',
        cancelButton: 'rounded-lg px-6 py-2 font-medium text-slate-700',
    },
};

/**
 * Toast configuration for quick notifications
 */
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
    customClass: {
        popup: 'rounded-lg bg-slate-800 text-slate-100',
    },
});

/**
 * Show a success message
 * @param {string} title - The title text
 * @param {string} text - Optional body text
 */
export const showSuccess = (title, text = '') => {
    return Swal.fire({
        ...swalTheme,
        icon: 'success',
        title,
        text,
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
    });
};

/**
 * Show an error message
 * @param {string} title - The title text
 * @param {string} text - Optional body text
 */
export const showError = (title, text = '') => {
    return Swal.fire({
        ...swalTheme,
        icon: 'error',
        title,
        text,
        iconColor: '#ef4444',
    });
};

/**
 * Show a warning message
 * @param {string} title - The title text
 * @param {string} text - Optional body text
 */
export const showWarning = (title, text = '') => {
    return Swal.fire({
        ...swalTheme,
        icon: 'warning',
        title,
        text,
    });
};

/**
 * Show an info message
 * @param {string} title - The title text
 * @param {string} text - Optional body text
 */
export const showInfo = (title, text = '') => {
    return Swal.fire({
        ...swalTheme,
        icon: 'info',
        title,
        text,
        iconColor: '#3b82f6',
    });
};

/**
 * Show a confirmation dialog
 * @param {Object} options - Configuration options
 * @param {string} options.title - The title text
 * @param {string} options.text - The body text or HTML
 * @param {string} options.confirmText - Text for confirm button
 * @param {string} options.cancelText - Text for cancel button
 * @param {string} options.icon - Icon type (warning, error, info, success, question)
 * @param {boolean} options.isDanger - If true, confirm button will be red
 * @returns {Promise} - Resolves with Swal result
 */
export const showConfirm = ({
    title,
    text = '',
    html = '',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    icon = 'warning',
    isDanger = false,
}) => {
    return Swal.fire({
        ...swalTheme,
        title,
        text: html ? undefined : text,
        html: html || undefined,
        icon,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        confirmButtonColor: isDanger ? '#dc2626' : swalTheme.confirmButtonColor,
        reverseButtons: true,
    });
};

/**
 * Show a delete confirmation dialog
 * @param {string} itemName - Name of the item being deleted
 * @returns {Promise} - Resolves with Swal result
 */
export const showDeleteConfirm = (itemName = 'this item') => {
    return showConfirm({
        title: 'Delete?',
        html: `<p class="text-slate-400">This will permanently delete "<span class="text-white font-medium">${itemName}</span>".</p><p class="text-red-400 text-sm mt-2">This action cannot be undone.</p>`,
        confirmText: 'Yes, Delete',
        cancelText: 'Cancel',
        icon: 'warning',
        isDanger: true,
    });
};

/**
 * Show a toast notification
 * @param {string} icon - Icon type (success, error, warning, info)
 * @param {string} title - The toast message
 */
export const showToast = (icon, title) => {
    return Toast.fire({
        icon,
        title,
        background: '#1e293b',
        color: '#f1f5f9',
    });
};

/**
 * Show a loading indicator
 * @param {string} title - Loading message
 */
export const showLoading = (title = 'Please wait...') => {
    return Swal.fire({
        ...swalTheme,
        title,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });
};

/**
 * Close any open Swal dialog
 */
export const closeSwal = () => {
    Swal.close();
};

/**
 * Show input dialog
 * @param {Object} options - Configuration options
 * @param {string} options.title - The title text
 * @param {string} options.inputLabel - Label for the input
 * @param {string} options.inputPlaceholder - Placeholder text
 * @param {string} options.inputValue - Default value
 * @param {string} options.inputType - Input type (text, email, url, etc.)
 * @returns {Promise} - Resolves with Swal result
 */
export const showInput = ({
    title,
    inputLabel = '',
    inputPlaceholder = '',
    inputValue = '',
    inputType = 'text',
    confirmText = 'Submit',
    cancelText = 'Cancel',
}) => {
    return Swal.fire({
        ...swalTheme,
        title,
        input: inputType,
        inputLabel,
        inputPlaceholder,
        inputValue,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        inputAttributes: {
            class: 'bg-slate-700 border-slate-600 text-white rounded-lg',
        },
    });
};

export default Swal;
