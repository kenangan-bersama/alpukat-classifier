# 🥑 Avocado Ripeness Classification System

**Sistem Klasifikasi Kematangan Alpukat Mentega** menggunakan Machine Learning untuk mengidentifikasi tingkat kematangan alpukat secara real-time.

## ✨ Features

- ✅ **Dual Mode**: Camera + Upload Image
- ✅ **Real-time Classification**: Langsung detect dari webcam
- ✅ **Auto Mode**: Continuous classification setiap 2 detik
- ✅ **3 Kategori**: Matang, Setengah Matang, Mentah
- ✅ **Confidence Score**: Tingkat keyakinan prediksi
- ✅ **Persistent Storage**: Hasil tetap tersimpan setelah refresh
- ✅ **Custom Model Support**: Integrasi dengan Teachable Machine
- ✅ **Modern UI**: Clean, professional, responsive design
- ✅ **Demo Mode**: Test tanpa training model

## 🚀 Getting Started

### Prerequisites

```bash
Node.js >= 16.x
npm >= 8.x
```

### Installation

```bash
# Clone repository
git clone <repository-url>
cd alpukat-classifier

# Install dependencies
npm install

# Run development server
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173/`

## 📚 Training Your Own Model

Untuk akurasi terbaik, train model custom Anda di Google Teachable Machine:

1. **Baca panduan lengkap**: [TRAINING_GUIDE.md](./TRAINING_GUIDE.md)
2. **Kunjungi**: https://teachablemachine.withgoogle.com/
3. **Upload dataset** (50+ foto per kategori)
4. **Train & Export** model
5. **Input Model URL** via Model Settings (⚙️ tombol di kanan bawah)

## 🎯 Usage

### Method 1: Via UI (Easy)
1. Klik tombol **⚙️ Model Settings** di kanan bawah
2. Paste Model URL dari Teachable Machine
3. Save & Refresh

### Method 2: Edit Code
1. Buka `src/utils/classifier.js`
2. Update `MODEL_URL`
3. Save & Refresh

## 🛠️ Tech Stack

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
