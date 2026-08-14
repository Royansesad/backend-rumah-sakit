import React from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'system';

export interface ToastMessage {
    id: string;
    type: ToastType;
    title: string;
    description?: string;
    actionText?: string;
    onAction?: () => void;
}

interface ToastProps {
    toast: ToastMessage;
    onClose: (id: string) => void;
}

export const ToastItem: React.FC<ToastProps> = ({ toast, onClose }) => {
    // Icons matching Gambar 3
    const renderIcon = () => {
        switch (toast.type) {
            case 'success':
                return (
                    <svg
                        className="h-6 w-6 shrink-0 text-[#145e5b]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                );
            case 'system':
            case 'warning':
                return (
                    <svg
                        className="h-6 w-6 shrink-0 text-[#145e5b]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                );
            case 'info':
            case 'error':
            default:
                return (
                    <svg
                        className="h-6 w-6 shrink-0 text-[#145e5b]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                );
        }
    };

    return (
        <div className="group animate-in fade-in slide-in-from-top-4 relative flex w-full max-w-sm items-start gap-3 rounded-lg border border-l-4 border-gray-200/80 border-l-[#145e5b] bg-white p-3.5 shadow-md transition-all">
            <div className="pt-0.5">{renderIcon()}</div>
            <div className="min-w-0 flex-1 pr-4">
                <h4 className="font-serif text-sm leading-snug font-bold text-gray-900">
                    {toast.title}
                </h4>
                {toast.description && (
                    <p className="mt-0.5 font-sans text-xs leading-relaxed text-gray-600">
                        {toast.description}
                    </p>
                )}
                {toast.actionText && (
                    <button
                        type="button"
                        onClick={() => {
                            if (toast.onAction) toast.onAction();
                            onClose(toast.id);
                        }}
                        className="mt-2 text-xs font-semibold text-[#145e5b] hover:underline"
                    >
                        {toast.actionText}
                    </button>
                )}
            </div>
            <button
                type="button"
                onClick={() => onClose(toast.id)}
                className="absolute top-2.5 right-2.5 text-gray-400 transition hover:text-gray-600"
                aria-label="Tutup"
            >
                <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
        </div>
    );
};

export interface ToastContainerProps {
    toasts: ToastMessage[];
    onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
    toasts,
    onClose,
}) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-5 right-5 z-50 flex w-full max-w-sm flex-col gap-3 px-4 sm:px-0">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={onClose} />
            ))}
        </div>
    );
};
