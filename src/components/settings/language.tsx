import { emit } from '@tauri-apps/api/event';
import { useContext, useEffect, useState } from 'react';
import { Globe, Save, X } from "react-bootstrap-icons";
import { toast } from "sonner";
import { NavContext } from '../../single/context';
import { getLanguage, setLanguage } from '../../single/store';
import { t, updateLanguage } from '../../utils/helper';
import { SettingItem } from "./common";

const LANGUAGE_OPTIONS = [
    { key: "en", label: "English", flag: "🇬🇧" },
    { key: "zh", label: "中文", flag: "🇨🇳" },
    { key: "ru", label: "Русский", flag: "🇷🇺" },
];

export default function LanguageSwitch() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
    const [isLoading, setIsLoading] = useState(false);

    const { handleLanguageChange } = useContext(NavContext);

    // 初始化时加载语言设置
    useEffect(() => {
        const loadLanguageSetting = async () => {
            const language = await getLanguage();
            setSelectedLanguage(language || 'en');
        };
        loadLanguageSetting();
    }, []);

    useEffect(() => {
        if (isOpen) {
            loadLanguageSetting();
        }
    }, [isOpen]);

    const loadLanguageSetting = async () => {
        const language = await getLanguage();
        setSelectedLanguage(language || 'en');
    };

    const handleOpen = () => {
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await setLanguage(selectedLanguage);
            await updateLanguage();
            // zh: 提交这个事件是为了更新托盘菜单语言
            // en: This event is submitted to update the tray menu language
            emit('status-changed');
            handleLanguageChange(selectedLanguage);
            toast.success(t("save_success", "Saved successfully"));
            handleClose();
        } catch (error) {
            toast.error(t("save_failed", "Failed to save"));
        } finally {
            setIsLoading(false);
        }
    };

    const getCurrentLanguageLabel = () => {
        const lang = LANGUAGE_OPTIONS.find(l => l.key === selectedLanguage);
        return lang ? `${lang.flag} ${lang.label}` : t('language');
    };

    return (
        <>
            <SettingItem
                icon={<Globe className="text-[#5856D6]" size={22} />}
                title={t('language')}
                subTitle={getCurrentLanguageLabel()}
                disabled={false}
                onPress={handleOpen}
            />

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-gray-400/60"
                        onClick={handleClose}
                    />

                    <div className="relative bg-white rounded-lg p-3 w-80 max-w-full">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Globe size={14} className="text-[#5856D6]" />
                                <h3 className="text-xs font-medium text-gray-700">
                                    {t("language", "Language")}
                                </h3>
                            </div>
                            <button
                                onClick={handleClose}
                                className="hover:bg-gray-100 rounded p-1 transition-colors"
                            >
                                <X size={14} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div>
                                <select
                                    className="select select-sm select-ghost border-[0.8px] border-gray-200 w-full"
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                >
                                    {LANGUAGE_OPTIONS.map(option => (
                                        <option key={option.key} value={option.key}>
                                            {option.flag} {option.label}
                                        </option>
                                    ))}
                                </select>

                                <p className="text-xs text-gray-500 mt-2">
                                    {t("language_description", "Select your preferred language")}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                className="px-3 py-1 text-xs rounded bg-transparent hover:bg-gray-100 text-gray-600 transition-colors"
                                onClick={handleClose}
                            >
                                {t("cancel", "Cancel")}
                            </button>
                            <button
                                className="flex items-center gap-1.5 px-3 py-1 text-xs bg-gray-600 text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                                onClick={handleSave}
                                disabled={isLoading}
                            >
                                <Save size={14} />
                                {isLoading ? t("saving", "Saving...") : t("save", "Save")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}