import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { classifier } from '../utils/classifier';
import ModelSettings from './ModelSettings';
import { FullPageLoader } from './Loader';
import {
    CameraIcon,
    ArrowUpTrayIcon,
    PlayIcon,
    PauseIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

const AvocadoClassifier = () => {
    const webcamRef = useRef(null);
    const fileInputRef = useRef(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isClassifying, setIsClassifying] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [isAutoMode, setIsAutoMode] = useState(false);
    const [mode, setMode] = useState('camera'); // 'camera' or 'upload'
    const [uploadedImage, setUploadedImage] = useState(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // Load model on component mount
    useEffect(() => {
        const initializeModel = async () => {
            try {
                const loadResult = await classifier.loadModel();
                if (loadResult.success) {
                    setIsModelLoaded(true);
                    console.log('Model ready!');
                } else {
                    setError('Failed to load model. Using demo mode.');
                }
            } catch (err) {
                console.error('Model initialization error:', err);
                setError('Model initialization failed. Using demo mode.');
                setIsModelLoaded(true); // Still allow demo mode
            }
        };

        const initialize = async () => {
            await initializeModel();
            loadSavedData();

            // Small delay for smooth transition
            setTimeout(() => {
                setIsInitialLoading(false);
            }, 800);
        };

        initialize();

        // Cleanup on unmount
        return () => {
            classifier.dispose();
        };
    }, []);

    // Load saved data from localStorage
    const loadSavedData = () => {
        try {
            // Load saved mode
            const savedMode = localStorage.getItem('classifierMode');
            if (savedMode) {
                setMode(savedMode);
            }

            // Load saved result
            const savedResult = localStorage.getItem('classificationResult');
            if (savedResult) {
                setResult(JSON.parse(savedResult));
            }

            // Load saved uploaded image
            const savedImageUrl = localStorage.getItem('uploadedImageUrl');
            if (savedImageUrl && savedMode === 'upload') {
                setUploadedImageUrl(savedImageUrl);

                // Recreate image element
                const image = new Image();
                image.onload = () => {
                    setUploadedImage(image);
                };
                image.src = savedImageUrl;
            }

            console.log('✅ Previous session data restored');
        } catch (err) {
            console.error('Error loading saved data:', err);
        }
    };

    // Save data to localStorage
    const saveData = (dataToSave) => {
        try {
            if (dataToSave.mode !== undefined) {
                localStorage.setItem('classifierMode', dataToSave.mode);
            }
            if (dataToSave.result !== undefined) {
                if (dataToSave.result) {
                    localStorage.setItem('classificationResult', JSON.stringify(dataToSave.result));
                } else {
                    localStorage.removeItem('classificationResult');
                }
            }
            if (dataToSave.imageUrl !== undefined) {
                if (dataToSave.imageUrl) {
                    localStorage.setItem('uploadedImageUrl', dataToSave.imageUrl);
                } else {
                    localStorage.removeItem('uploadedImageUrl');
                }
            }
        } catch (err) {
            console.error('Error saving data:', err);
        }
    };

    // Clear saved data
    const clearSavedData = () => {
        try {
            localStorage.removeItem('classificationResult');
            localStorage.removeItem('uploadedImageUrl');
            console.log('🗑️ Saved data cleared');
        } catch (err) {
            console.error('Error clearing data:', err);
        }
    };

    // Auto-classification interval
    useEffect(() => {
        let intervalId;

        if (isAutoMode && isCameraReady && isModelLoaded && mode === 'camera') {
            intervalId = setInterval(() => {
                captureAndClassify();
            }, 2000); // Classify every 2 seconds
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isAutoMode, isCameraReady, isModelLoaded, mode]);

    // Handle file upload
    const handleFileUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        // Clear previous results
        setResult(null);
        clearSavedData();

        // Convert image to base64 for persistent storage
        const reader = new FileReader();

        reader.onload = (e) => {
            const base64Url = e.target.result;

            // Set image URL for preview
            setUploadedImageUrl(base64Url);

            // Save to localStorage (base64 is persistent)
            saveData({ imageUrl: base64Url });

            // Create image element for classification
            const image = new Image();
            image.onload = () => {
                setUploadedImage(image);
                setError(null);
            };
            image.onerror = () => {
                setError('Failed to load image');
            };
            image.src = base64Url;
        };

        reader.onerror = () => {
            setError('Failed to read image file');
        };

        // Read file as base64 data URL
        reader.readAsDataURL(file);
    }, []);

    // Classify uploaded image
    const classifyUploadedImage = useCallback(async () => {
        if (!uploadedImage || !isModelLoaded) {
            return;
        }

        try {
            setIsClassifying(true);
            setError(null);

            // Minimum delay to show loader (500ms)
            const startTime = Date.now();

            // Classify the image
            const predictions = await classifier.classify(uploadedImage);

            // Ensure minimum loading time for better UX
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 500 - elapsedTime);

            if (remainingTime > 0) {
                await new Promise(resolve => setTimeout(resolve, remainingTime));
            }

            setResult(predictions);

            // Save result to localStorage
            saveData({ result: predictions });
        } catch (err) {
            console.error('Classification error:', err);
            setError(`Classification failed: ${err.message}`);
        } finally {
            setIsClassifying(false);
        }
    }, [uploadedImage, isModelLoaded]);

    // Capture image from webcam and classify
    const captureAndClassify = useCallback(async () => {
        if (!webcamRef.current || !isModelLoaded) {
            return;
        }

        try {
            setIsClassifying(true);
            setError(null);

            // Get image from webcam
            const imageSrc = webcamRef.current.getScreenshot();
            if (!imageSrc) {
                throw new Error('Failed to capture image from camera');
            }

            // Create image element
            const image = new Image();
            image.src = imageSrc;

            await new Promise((resolve) => {
                image.onload = resolve;
            });

            // Minimum delay to show loader (500ms)
            const startTime = Date.now();

            // Classify the image
            const predictions = await classifier.classify(image);

            // Ensure minimum loading time for better UX
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 500 - elapsedTime);

            if (remainingTime > 0) {
                await new Promise(resolve => setTimeout(resolve, remainingTime));
            }

            setResult(predictions);

            // Save result to localStorage (but not the camera image itself)
            saveData({ result: predictions });
        } catch (err) {
            console.error('Classification error:', err);
            setError(`Classification failed: ${err.message}`);
        } finally {
            setIsClassifying(false);
        }
    }, [isModelLoaded]);

    // Handle camera ready
    const handleCameraReady = useCallback(() => {
        setIsCameraReady(true);
        console.log('Camera is ready!');
    }, []);

    // Handle camera error
    const handleCameraError = useCallback((error) => {
        console.error('Camera error:', error);
        setError('Camera access denied. Please allow camera access to use this app.');
        setIsCameraReady(false);
    }, []);

    // Toggle auto mode
    const toggleAutoMode = () => {
        setIsAutoMode(!isAutoMode);
        if (!isAutoMode) {
            setResult(null); // Clear previous results
        }
    };

    // Switch mode
    const switchMode = (newMode) => {
        setMode(newMode);
        setResult(null);
        setError(null);

        // Save mode to localStorage
        saveData({ mode: newMode });

        // Clear result when switching modes
        clearSavedData();

        if (newMode === 'upload') {
            setIsAutoMode(false);
        }
    };

    // Trigger file input click
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <>
            {/* Initial Loading Screen */}
            {isInitialLoading && (
                <FullPageLoader
                    message={isModelLoaded ? 'Preparing application...' : 'Loading AI model...'}
                />
            )}

            {/* Main Application */}
            <div className="app-container" style={{ display: isInitialLoading ? 'none' : 'block' }}>
                {/* Header */}
                <header className="app-header">
                    <div className="app-icon-wrapper">
                        <svg className="app-icon" viewBox="0 0 64 64" fill="none">
                            <ellipse cx="32" cy="35" rx="18" ry="22" fill="#4CAF50" />
                            <ellipse cx="32" cy="32" rx="8" ry="10" fill="#795548" />
                        </svg>
                    </div>
                    <h1 className="app-title">Avocado Ripeness Classifier</h1>
                    <p className="app-subtitle">
                        Sistem Klasifikasi Kematangan Alpukat Mentega
                    </p>
                </header>

                {/* Main Card */}
                <div className="card">
                    {/* Mode Tabs */}
                    <div className="mode-tabs">
                        <button
                            className={`mode-tab ${mode === 'camera' ? 'active' : ''}`}
                            onClick={() => switchMode('camera')}
                        >
                            <CameraIcon className="icon-sm" />
                            Camera
                        </button>
                        <button
                            className={`mode-tab ${mode === 'upload' ? 'active' : ''}`}
                            onClick={() => switchMode('upload')}
                        >
                            <ArrowUpTrayIcon className="icon-sm" />
                            Upload Image
                        </button>
                    </div>

                    {/* Camera Mode */}
                    {mode === 'camera' && (
                        <>
                            <div className="webcam-container">
                                {isCameraReady && <div className="webcam-overlay" />}

                                <Webcam
                                    ref={webcamRef}
                                    audio={false}
                                    screenshotFormat="image/jpeg"
                                    videoConstraints={{
                                        width: 1280,
                                        height: 720,
                                        facingMode: 'environment' // Use back camera on mobile
                                    }}
                                    onUserMedia={handleCameraReady}
                                    onUserMediaError={handleCameraError}
                                    className="webcam-video"
                                />

                                {!isCameraReady && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        textAlign: 'center'
                                    }}>
                                        <div className="spinner"></div>
                                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                                            Loading camera...
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Camera Controls */}
                            <div className="controls">
                                <button
                                    className="btn btn-primary"
                                    onClick={captureAndClassify}
                                    disabled={!isCameraReady || !isModelLoaded || isClassifying || isAutoMode}
                                >
                                    {isClassifying ? (
                                        <>
                                            <div className="spinner-icon">
                                                <ArrowPathIcon className="icon-sm" />
                                            </div>
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <CameraIcon className="icon-sm" />
                                            Classify Now
                                        </>
                                    )}
                                </button>

                                <button
                                    className={`btn ${isAutoMode ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={toggleAutoMode}
                                    disabled={!isCameraReady || !isModelLoaded}
                                >
                                    {isAutoMode ? (
                                        <>
                                            <PauseIcon className="icon-sm" />
                                            Stop Auto
                                        </>
                                    ) : (
                                        <>
                                            <PlayIcon className="icon-sm" />
                                            Auto Mode
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}

                    {/* Upload Mode */}
                    {mode === 'upload' && (
                        <>
                            <div className="upload-container">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />

                                {!uploadedImageUrl ? (
                                    <div className="upload-placeholder" onClick={handleUploadClick}>
                                        <div className="upload-icon">📁</div>
                                        <p className="upload-text">Click to upload an avocado image</p>
                                        <p className="upload-subtext">or drag and drop</p>
                                    </div>
                                ) : (
                                    <div className="image-preview-container">
                                        <img
                                            src={uploadedImageUrl}
                                            alt="Uploaded avocado"
                                            className="uploaded-image"
                                        />
                                        <button
                                            className="change-image-btn"
                                            onClick={handleUploadClick}
                                        >
                                            <ArrowPathIcon className="icon-sm" />
                                            Change Image
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Upload Controls */}
                            <div className="controls">
                                <button
                                    className="btn btn-primary"
                                    onClick={classifyUploadedImage}
                                    disabled={!uploadedImage || !isModelLoaded || isClassifying}
                                >
                                    {isClassifying ? (
                                        <>
                                            <div className="spinner-icon">
                                                <ArrowPathIcon className="icon-sm" />
                                            </div>
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <MagnifyingGlassIcon className="icon-sm" />
                                            Classify Image
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}

                    {/* Status Messages */}
                    {error && (
                        <div className="status-message status-warning">
                            ⚠️ {error}
                        </div>
                    )}

                    {!isModelLoaded && !error && (
                        <div className="status-message status-info">
                            <div className="spinner" style={{ marginBottom: '0.5rem' }}></div>
                            Loading classification model...
                        </div>
                    )}

                    {isAutoMode && mode === 'camera' && (
                        <div className="status-message status-info">
                            🔄 Auto mode active - Classifying every 2 seconds
                        </div>
                    )}

                    {/* Results Section */}
                    {result && (
                        <div className="result-container">
                            <div className="text-center">
                                <h2 style={{
                                    color: 'var(--text-secondary)',
                                    fontSize: '1rem',
                                    marginBottom: 'var(--spacing-sm)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    fontWeight: 600
                                }}>
                                    Classification Result
                                </h2>

                                <div className={`result-badge ${classifier.getRipenessClass(result.topPrediction.className)}`}>
                                    {classifier.getRipenessEmoji(result.topPrediction.className)} {result.topPrediction.className}
                                </div>

                                <div style={{ marginTop: 'var(--spacing-md)' }}>
                                    <p style={{
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.875rem',
                                        marginBottom: 'var(--spacing-xs)'
                                    }}>
                                        Confidence Level
                                    </p>
                                    <div className="confidence-bar">
                                        <div
                                            className="confidence-fill"
                                            style={{ width: `${result.topPrediction.confidence}%` }}
                                        />
                                    </div>
                                    <p style={{
                                        color: 'var(--text-primary)',
                                        fontSize: '1.5rem',
                                        fontWeight: 700,
                                        marginTop: 'var(--spacing-xs)'
                                    }}>
                                        {result.topPrediction.confidence}%
                                    </p>
                                </div>

                                {!result.topPrediction.isConfident && (
                                    <p style={{
                                        color: 'var(--warning-yellow)',
                                        fontSize: '0.875rem',
                                        marginTop: 'var(--spacing-sm)',
                                        fontWeight: 500
                                    }}>
                                        ⚠️ Low confidence - Try with better lighting or clearer image
                                    </p>
                                )}

                                {/* Visual Analysis Explanation */}
                                <div style={{
                                    marginTop: 'var(--spacing-md)',
                                    textAlign: 'left',
                                    background: 'var(--bg-primary)',
                                    padding: 'var(--spacing-md)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <h3 style={{
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        color: 'var(--text-primary)',
                                        marginBottom: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        💡 Analisis Visual
                                    </h3>
                                    <p style={{
                                        fontSize: '0.875rem',
                                        color: 'var(--text-secondary)',
                                        lineHeight: 1.6,
                                        margin: 0
                                    }}>
                                        {(() => {
                                            const cls = result.topPrediction.className;
                                            if (cls.includes('Matang') && !cls.includes('Setengah')) {
                                                return "Berdasarkan analisis visual, alpukat ini memiliki karakteristik kematangan optimal. Warna kulit cenderung gelap (coklat tua/hitam) dan tekstur kulit khas buah matang. Siap dikonsumsi.";
                                            } else if (cls.includes('Setengah')) {
                                                return "Terdeteksi warna campuran antara hijau dan coklat. Alpukat ini sedang dalam fase transisi pematangan. Diperkirakan mencapai kematangan penuh dalam 1-2 hari pada suhu ruang.";
                                            } else if (cls.includes('Mentah')) {
                                                return "Warna dominan hijau cerah mengindikasikan alpukat ini belum matang. Daging buah kemungkinan masih keras. Simpan pada suhu ruang untuk proses pematangan.";
                                            }
                                            return "Hasil klasifikasi berdasarkan pola visual yang dipelajari model.";
                                        })()}
                                    </p>
                                </div>
                            </div>

                            {/* All Predictions */}
                            <div className="predictions-list">
                                <h3 style={{
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.875rem',
                                    marginBottom: 'var(--spacing-xs)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    fontWeight: 600
                                }}>
                                    All Predictions
                                </h3>
                                {result.predictions.map((pred, index) => (
                                    <div key={index} className="prediction-item">
                                        <span className="prediction-label">
                                            {classifier.getRipenessEmoji(pred.className)} {pred.className}
                                        </span>
                                        <span className="prediction-confidence">
                                            {pred.confidence}%
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {result.isDemo && (
                                <div className="status-message status-warning" style={{ marginTop: 'var(--spacing-md)' }}>
                                    🎭 Demo Mode - Train your model at{' '}
                                    <a
                                        href="https://teachablemachine.withgoogle.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: 'var(--accent-lime)', textDecoration: 'underline' }}
                                    >
                                        Teachable Machine
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="card" style={{ marginTop: 'var(--spacing-lg)', maxWidth: '640px' }}>
                    <h3 style={{
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--spacing-md)',
                        fontSize: '1.25rem'
                    }}>
                        📝 How to Use
                    </h3>
                    <ul style={{
                        color: 'var(--text-secondary)',
                        lineHeight: 1.8,
                        paddingLeft: '1.5rem'
                    }}>
                        <li><strong>Camera Mode:</strong> Point your camera at an avocado</li>
                        <li><strong>Upload Mode:</strong> Upload an avocado image from your device</li>
                        <li>Click "Classify Now" or "Classify Image" to detect ripeness</li>
                        <li>Use "Auto Mode" (camera only) for continuous detection</li>
                        <li>Ensure good lighting for better accuracy</li>
                    </ul>

                    <div style={{
                        marginTop: 'var(--spacing-md)',
                        padding: 'var(--spacing-md)',
                        background: 'rgba(76, 175, 80, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: '4px solid var(--primary-green)'
                    }}>
                        <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                            💡 Training Your Own Model
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            Visit{' '}
                            <a
                                href="https://teachablemachine.withgoogle.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--accent-lime)', textDecoration: 'underline' }}
                            >
                                Teachable Machine
                            </a>
                            {' '}to train a custom model with your avocado images. Export the model and update the MODEL_URL in src/utils/classifier.js
                        </p>
                    </div>
                </div>

                {/* Model Settings */}
                <ModelSettings />
            </div>
        </>
    );
};

export default AvocadoClassifier;
