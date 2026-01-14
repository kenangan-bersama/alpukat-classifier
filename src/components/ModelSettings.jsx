import React, { useState } from 'react';
import { CONFIG } from '../utils/classifier';
import { Cog6ToothIcon, TrashIcon, AcademicCapIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ModelSettings = ({ onModelUrlUpdate }) => {
    const [showSettings, setShowSettings] = useState(false);
    const [modelUrl, setModelUrl] = useState(CONFIG.MODEL_URL || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);

        // Validate URL
        if (modelUrl && !modelUrl.endsWith('/')) {
            alert('⚠️ URL harus diakhiri dengan slash "/" \n\nContoh: https://teachablemachine.withgoogle.com/models/xxxxx/');
            setIsSaving(false);
            return;
        }

        // Save to localStorage
        localStorage.setItem('customModelUrl', modelUrl);

        // Update config (requires page reload)
        alert('✅ Model URL disimpan!\n\nRefresh page (F5) untuk load model baru.');

        setIsSaving(false);
        setShowSettings(false);

        if (onModelUrlUpdate) {
            onModelUrlUpdate(modelUrl);
        }
    };

    const handleClear = () => {
        if (confirm('Hapus model URL dan kembali ke demo mode?')) {
            setModelUrl('');
            localStorage.removeItem('customModelUrl');
            alert('✅ Model URL dihapus!\n\nRefresh page (F5) untuk kembali ke demo mode.');
        }
    };

    const openGuide = () => {
        window.open('https://teachablemachine.withgoogle.com/', '_blank');
    };

    if (!showSettings) {
        return (
            <button
                className="settings-trigger"
                onClick={() => setShowSettings(true)}
                title="Model Settings"
            >
                <Cog6ToothIcon className="icon-sm" />
                Model Settings
            </button>
        );
    }

    return (
        <div className="model-settings-overlay">
            <div className="model-settings-modal">
                <div className="modal-header">
                    <h3>
                        <Cog6ToothIcon className="icon-md" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }} />
                        Model Settings
                    </h3>
                    <button className="close-btn" onClick={() => setShowSettings(false)}>
                        <XMarkIcon className="icon-md" />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="info-box">
                        <p><strong>📌 Current Mode:</strong></p>
                        <p className="mode-status">
                            {CONFIG.MODEL_URL ? '🤖 Custom Model' : '🎭 Demo Mode'}
                        </p>
                    </div>

                    <div className="form-group">
                        <label>
                            <strong>Teachable Machine Model URL:</strong>
                        </label>
                        <input
                            type="text"
                            className="url-input"
                            placeholder="https://teachablemachine.withgoogle.com/models/xxxxx/"
                            value={modelUrl}
                            onChange={(e) => setModelUrl(e.target.value)}
                        />
                        <small className="help-text">
                            ⚠️ URL harus diakhiri dengan <code>/</code>
                        </small>
                    </div>

                    <div className="guide-link">
                        <p>📚 <strong>Belum punya model?</strong></p>
                        <button className="btn btn-secondary" onClick={openGuide}>
                            <AcademicCapIcon className="icon-sm" />
                            Buka Teachable Machine
                        </button>
                        <small className="help-text">
                            Lihat file <code>TRAINING_GUIDE.md</code> untuk panduan lengkap
                        </small>
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        className="btn btn-secondary"
                        onClick={handleClear}
                        disabled={!modelUrl}
                    >
                        <TrashIcon className="icon-sm" />
                        Clear Model
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? '💾 Saving...' : '💾 Save Model URL'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModelSettings;
