    import React, { useRef, useState } from 'react';
    import {QRCodeSVG} from 'qrcode.react';
    import { useTranslations } from "next-intl";

    export function InviteQR({ link = 'https://battleship.example.com/invite/abc123' }: { link?: string }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [copied, setCopied] = useState(false);
    const t = useTranslations("InviteQR");

    const handleCopy = () => {
        if (inputRef.current) {
        // inputRef.current.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
        }
    };

    return (
        <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md w-full max-w-xs">
        <div className="mb-4">
            <QRCodeSVG value={link} size={180} />
        </div>
        <div className="w-full flex items-center gap-2">
            <input
            ref={inputRef}
            type="text"
            value={link}
            readOnly
            className="flex-1 rounded-lg border px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer select-all"
            onClick={() => inputRef.current?.select()}
            />
            <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
            title={t('copy_link')}
            >
            {/* Heroicons outline clipboard */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6.75V5.25A2.25 2.25 0 0014.25 3h-4.5A2.25 2.25 0 007.5 5.25v1.5m9 0A2.25 2.25 0 0118.75 9v9A2.25 2.25 0 0116.5 20.25h-9A2.25 2.25 0 015.25 18V9A2.25 2.25 0 017.5 6.75m9 0h-9" />
            </svg>
            </button>
        </div>
        {copied && <span className="mt-2 text-green-600 text-xs font-medium">{t('copied')}</span>}
        </div>
    );
    }