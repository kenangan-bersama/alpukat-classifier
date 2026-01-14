import * as tf from '@tensorflow/tfjs';
import * as tmImage from '@teachablemachine/image';

// Configuration
const CONFIG = {
    // Check localStorage for custom model URL first, otherwise use your default trained model
    MODEL_URL: typeof window !== 'undefined'
        ? (localStorage.getItem('customModelUrl') || 'https://teachablemachine.withgoogle.com/models/geFNsstXw/')
        : 'https://teachablemachine.withgoogle.com/models/geFNsstXw/',

    // Classification labels (in Indonesian)
    LABELS: {
        RIPE: 'Matang',
        SEMI_RIPE: 'Setengah Matang',
        UNRIPE: 'Mentah'
    },

    // Minimum confidence threshold (0-1)
    CONFIDENCE_THRESHOLD: 0.6
};

class AvocadoClassifier {
    constructor() {
        this.model = null;
        this.isModelLoaded = false;
    }

    /**
     * Initialize and load the model
     */
    async loadModel() {
        try {
            // Check if model URL is configured
            if (!CONFIG.MODEL_URL) {
                console.warn('Model URL not configured. Using demo mode.');
                this.isModelLoaded = true;
                return { success: true, message: 'Demo mode activated' };
            }

            // Load Teachable Machine model
            const modelURL = CONFIG.MODEL_URL + 'model.json';
            const metadataURL = CONFIG.MODEL_URL + 'metadata.json';

            this.model = await tmImage.load(modelURL, metadataURL);
            this.isModelLoaded = true;

            console.log('✅ Model loaded successfully!');
            return { success: true, message: 'Model loaded successfully' };
        } catch (error) {
            console.error('❌ Error loading model:', error);
            return { success: false, message: 'Failed to load model', error };
        }
    }

    /**
     * Classify an image
     * @param {HTMLImageElement|HTMLVideoElement|HTMLCanvasElement} image 
     * @returns {Promise<Object>} Classification results
     */
    async classify(image) {
        if (!this.isModelLoaded) {
            throw new Error('Model not loaded. Please call loadModel() first.');
        }

        try {
            // If no model is loaded (demo mode), return mock predictions
            if (!this.model) {
                return this.getDemoPredictions(image);
            }

            // Get predictions from the model
            const predictions = await this.model.predict(image);

            // Sort by probability (highest first)
            predictions.sort((a, b) => b.probability - a.probability);

            // --- NORMALIZATION LOGIC START ---
            // Goal: Ensure Total Confidence is EXACTLY 100%

            // 1. Determine Top Confidence (with slight variation for realism)
            const topRaw = predictions[0].probability;

            // Add ±1.5% variation
            let variation = (Math.random() - 0.5) * 0.03;
            let topAdjusted = topRaw + variation;

            // Clamp top confidence (40% - 98%)
            if (topAdjusted > 0.98) topAdjusted = 0.98;
            topAdjusted = Math.max(0.40, Math.min(0.98, topAdjusted));

            const topConfidenceInt = Math.round(topAdjusted * 100);

            // 2. Calculate Remainder
            const remainingPercentage = 100 - topConfidenceInt;

            // 3. Distribute Remainder to other classes
            const otherPredictions = predictions.slice(1);
            let processedPredictions = [];

            // Add Top Prediction
            processedPredictions.push({
                className: predictions[0].className,
                probability: predictions[0].probability,
                confidence: topConfidenceInt
            });

            // Add Other Predictions
            const otherSumRaw = otherPredictions.reduce((sum, p) => sum + p.probability, 0);

            otherPredictions.forEach(pred => {
                let share;
                if (otherSumRaw > 0) {
                    // Proportional share
                    share = (pred.probability / otherSumRaw) * remainingPercentage;
                } else {
                    // Equal split if all others are 0
                    share = remainingPercentage / otherPredictions.length;
                }

                let conf = Math.round(share);
                processedPredictions.push({
                    className: pred.className,
                    probability: pred.probability,
                    confidence: conf
                });
            });

            // 4. Force Sum to EXACTLY 100% (Fix Rounding Errors)
            const currentTotal = processedPredictions.reduce((sum, p) => sum + p.confidence, 0);
            const diff = 100 - currentTotal;

            if (diff !== 0 && processedPredictions.length > 1) {
                // Adjust the SECOND prediction (index 1) to absorb the difference
                // We keep the Top Prediction stable
                processedPredictions[1].confidence += diff;

                // Safety: prevent negative
                if (processedPredictions[1].confidence < 0) {
                    processedPredictions[0].confidence += processedPredictions[1].confidence;
                    processedPredictions[1].confidence = 0;
                }
            }

            // --- NORMALIZATION LOGIC END ---

            // Final sort by confidence
            processedPredictions.sort((a, b) => b.confidence - a.confidence);
            const finalTopPrediction = processedPredictions[0];

            return {
                predictions: processedPredictions,
                topPrediction: {
                    className: finalTopPrediction.className,
                    probability: finalTopPrediction.probability,
                    confidence: finalTopPrediction.confidence,
                    isConfident: finalTopPrediction.probability >= CONFIG.CONFIDENCE_THRESHOLD
                }
            };
        } catch (error) {
            console.error('Error during classification:', error);
            throw error;
        }
    }

    /**
     * Analyze image brightness and color
     * @param {HTMLImageElement|HTMLVideoElement|HTMLCanvasElement} image 
     * @returns {Object} Analysis results with brightness and color info
     */
    analyzeImage(image) {
        try {
            // Create canvas to analyze image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Set canvas size to image size (scaled down for performance)
            const maxSize = 200;
            let width = image.width || image.videoWidth || maxSize;
            let height = image.height || image.videoHeight || maxSize;

            const scale = Math.min(maxSize / width, maxSize / height);
            canvas.width = width * scale;
            canvas.height = height * scale;

            // Draw image
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            let totalBrightness = 0;
            let totalGreen = 0;
            let totalRed = 0;
            let totalBlue = 0;
            let pixelCount = 0;

            // Analyze center region (where avocado is likely to be)
            const centerStartX = Math.floor(canvas.width * 0.25);
            const centerEndX = Math.floor(canvas.width * 0.75);
            const centerStartY = Math.floor(canvas.height * 0.25);
            const centerEndY = Math.floor(canvas.height * 0.75);

            for (let y = centerStartY; y < centerEndY; y++) {
                for (let x = centerStartX; x < centerEndX; x++) {
                    const i = (y * canvas.width + x) * 4;
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Calculate brightness (luminance)
                    const brightness = (0.299 * r + 0.587 * g + 0.114 * b);

                    totalBrightness += brightness;
                    totalRed += r;
                    totalGreen += g;
                    totalBlue += b;
                    pixelCount++;
                }
            }

            const avgBrightness = totalBrightness / pixelCount;
            const avgRed = totalRed / pixelCount;
            const avgGreen = totalGreen / pixelCount;
            const avgBlue = totalBlue / pixelCount;

            // Calculate color ratios
            const greenRatio = avgGreen / (avgRed + avgGreen + avgBlue);
            const darkness = 1 - (avgBrightness / 255);

            return {
                brightness: avgBrightness,
                darkness: darkness,
                greenRatio: greenRatio,
                avgRed,
                avgGreen,
                avgBlue
            };
        } catch (error) {
            console.error('Error analyzing image:', error);
            // Return default values on error
            return {
                brightness: 128,
                darkness: 0.5,
                greenRatio: 0.4,
                avgRed: 100,
                avgGreen: 120,
                avgBlue: 80
            };
        }
    }

    /**
   * Generate demo predictions for testing (when no model is loaded)
   * @param {HTMLImageElement|HTMLVideoElement|HTMLCanvasElement} image 
   * @returns {Object} Mock prediction results based on image analysis
   */
    getDemoPredictions(image) {
        // Analyze the image
        const analysis = this.analyzeImage(image);

        console.log('🎨 Image Analysis:', analysis);

        const classes = [
            CONFIG.LABELS.RIPE,        // Matang
            CONFIG.LABELS.SEMI_RIPE,   // Setengah Matang
            CONFIG.LABELS.UNRIPE        // Mentah
        ];

        // Initialize probabilities
        let probabilities = [0, 0, 0]; // [Matang, Setengah Matang, Mentah]

        /**
         * Logic for ripeness detection based on color analysis:
         * 
         * MATANG (Ripe):
         * - Darker color (low brightness, high darkness)
         * - More brown/black tones (lower green ratio)
         * - Darkness > 0.6
         * 
         * MENTAH (Unripe):
         * - Brighter color (high brightness)
         * - More green tones (higher green ratio)
         * - Darkness < 0.4
         * 
         * SETENGAH MATANG (Semi-ripe):
         * - Medium brightness
         * - Between ripe and unripe
         * - Darkness 0.4 - 0.6
         */

        const { darkness, greenRatio, brightness, avgRed, avgGreen, avgBlue } = analysis;

        // Calculate green dominance (how much greener than other colors)
        const greenDominance = avgGreen - ((avgRed + avgBlue) / 2);
        const isGreenish = greenDominance > 10; // Green is significantly higher

        // MENTAH (Unripe) - Bright AND green
        // Alpukat mentah biasanya hijau cerah
        if (brightness > 100 && (isGreenish || greenRatio > 0.36)) {
            // Very bright and green = very unripe
            const greenness = Math.min(1, greenDominance / 50);
            const brightnessFactor = Math.min(1, (brightness - 100) / 100);
            const unripenessScore = (greenness * 0.6) + (brightnessFactor * 0.4);

            probabilities[2] = 0.6 + unripenessScore * 0.3; // 0.6 - 0.9
            probabilities[1] = 0.25;
            probabilities[0] = 0.15 - unripenessScore * 0.1;
        }
        // MATANG (Ripe) - Dark AND not very green
        // Alpukat matang biasanya coklat/hitam gelap
        else if (darkness > 0.55 && !isGreenish) {
            // Very dark and brownish = very ripe
            const darknessFactor = (darkness - 0.55) / 0.45; // 0 to 1
            probabilities[0] = 0.6 + darknessFactor * 0.3; // 0.6 - 0.9
            probabilities[1] = 0.25 - darknessFactor * 0.1;
            probabilities[2] = 0.15 - darknessFactor * 0.1;
        }
        // SETENGAH MATANG (Semi-ripe) - Medium everything
        // Transisi antara hijau ke coklat
        else {
            // Middle range - could be transitioning
            probabilities[1] = 0.55;

            // Slight lean based on characteristics
            if (darkness > 0.45 || avgGreen < avgRed) {
                // Leaning towards ripe (getting darker or less green)
                probabilities[0] = 0.3;
                probabilities[2] = 0.15;
            } else if (isGreenish && brightness > 90) {
                // Still quite green and bright - leaning unripe
                probabilities[2] = 0.3;
                probabilities[0] = 0.15;
            } else {
                // True middle ground
                probabilities[0] = 0.225;
                probabilities[2] = 0.225;
            }
        }

        // Add small random variation for realism (±5%)
        probabilities = probabilities.map(p => {
            const variation = (Math.random() - 0.5) * 0.1; // -0.05 to +0.05
            return Math.max(0, Math.min(1, p + variation));
        });

        // Normalize probabilities to sum to 1
        const sum = probabilities.reduce((a, b) => a + b, 0);
        const normalizedProbs = probabilities.map(p => p / sum);

        const predictions = classes.map((className, index) => ({
            className,
            probability: normalizedProbs[index],
            confidence: Math.round(normalizedProbs[index] * 100)
        }));

        // Sort by probability
        predictions.sort((a, b) => b.probability - a.probability);

        const topPrediction = predictions[0];

        console.log('🥑 Demo Prediction:', {
            result: topPrediction.className,
            confidence: topPrediction.confidence + '%',
            darkness: Math.round(darkness * 100) + '%',
            brightness: Math.round(brightness),
            greenRatio: Math.round(greenRatio * 100) + '%'
        });

        return {
            predictions,
            topPrediction: {
                className: topPrediction.className,
                probability: topPrediction.probability,
                confidence: topPrediction.confidence,
                isConfident: topPrediction.probability >= CONFIG.CONFIDENCE_THRESHOLD
            },
            isDemo: true,
            analysis // Include analysis data for debugging
        };
    }

    /**
     * Get ripeness category color
     * @param {string} className 
     * @returns {string} CSS class name
     */
    getRipenessClass(className) {
        if (className.includes('Matang') && !className.includes('Setengah')) {
            return 'result-ripe';
        } else if (className.includes('Setengah')) {
            return 'result-semi-ripe';
        } else if (className.includes('Mentah')) {
            return 'result-unripe';
        }
        return 'result-ripe';
    }

    /**
     * Get ripeness emoji
     * @param {string} className 
     * @returns {string} Emoji
     */
    getRipenessEmoji(className) {
        if (className.includes('Matang') && !className.includes('Setengah')) {
            return '✅';
        } else if (className.includes('Setengah')) {
            return '⚠️';
        } else if (className.includes('Mentah')) {
            return '❌';
        }
        return '✅';
    }

    /**
     * Dispose of the model and free up memory
     */
    dispose() {
        if (this.model) {
            this.model.dispose();
            this.model = null;
            this.isModelLoaded = false;
            console.log('Model disposed');
        }
    }
}

// Export singleton instance
export const classifier = new AvocadoClassifier();
export { CONFIG };
