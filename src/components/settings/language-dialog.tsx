import { emit } from '@tauri-apps/api/event';
import { useEffect, useRef, useState } from 'react';
import { Globe } from "react-bootstrap-icons";
import { setLanguage, setFirstLaunchComplete } from '../../single/store';
import { t, updateLanguage } from '../../utils/helper';

interface LanguageDialogProps {
    open: boolean;
    onClose: () => void;
    onLanguageSelected: (lang: string) => void;
}

const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

export default function LanguageDialog({ open, onClose, onLanguageSelected }: LanguageDialogProps) {
    const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
    const modalRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (open) {
            modalRef.current?.showModal();
        } else {
            modalRef.current?.close();
        }
    }, [open]);

    const handleLanguageSelect = async (langCode: string) => {
        setSelectedLanguage(langCode);
        await setLanguage(langCode);
        await updateLanguage();
        await setFirstLaunchComplete();
        emit('status-changed');
        onLanguageSelected(langCode);
        modalRef.current?.close();
        onClose();
    };

    const handleClose = () => {
        // If no language was explicitly selected, default to English
        if (selectedLanguage === 'en') {
            handleLanguageSelect('en');
        } else {
            // Language was already selected, just close
            onClose();
        }
    };

    return (
        <dialog ref={modalRef} className="modal">
            <div className="modal-box max-w-md p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Globe className="text-[#5856D6]" size={24} />
                    <h3 className="text-lg font-medium">{t("select_language", "Select Language")}</h3>
                </div>

                <p className="text-xs text-gray-500 mb-6">
                    {t("select_language_description", "Please select your preferred language for the application")}
                </p>

                <div className="space-y-2">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageSelect(lang.code)}
                            className={`w-full btn btn-outline justify-start gap-3 ${
                                selectedLanguage === lang.code ? 'btn-primary' : ''
                            }`}
                        >
                            <span className="text-2xl">{lang.flag}</span>
                            <span className="flex-1 text-left">{lang.name}</span>
                            {selectedLanguage === lang.code && (
                                <span className="text-sm">✓</span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="btn btn-sm btn-primary"
                    >
                        {t("confirm", "Confirm")}
                    </button>
                </div>
            </div>

            <div className="modal-backdrop bg-opacity-30" onClick={handleClose}></div>
        </dialog>
    );
}

