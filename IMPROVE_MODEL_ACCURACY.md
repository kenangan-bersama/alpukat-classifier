# 🎯 Cara Meningkatkan Akurasi Model Alpukat Classifier

## ⚠️ Masalah yang Anda Alami:

**Alpukat MENTAH dideteksi sebagai MATANG**

Ini adalah masalah **klasifikasi salah** yang umum terjadi karena:
1. Dataset training kurang representatif
2. Model bias ke satu kategori
3. Kondisi foto berbeda dengan training data

---

## 🔍 Analisis Masalah

### Kemungkinan Penyebab:

#### 1. **Dataset Imbalanced** 📊
```
✅ Matang:           100 foto
❌ Setengah Matang:  50 foto  ← Kurang!
❌ Mentah:           30 foto  ← Terlalu sedikit!
```
**Akibat:** Model jadi "terlalu sering" prediksi Matang karena data paling banyak

#### 2. **Foto Training Tidak Variatif** 📸
```
❌ Foto alpukat mentah: Semua foto dengan lighting sama
❌ Foto alpukat mentah: Semua dari angle yang sama
❌ Foto alpukat mentah: Background berbeda-beda (model bingung)
```

#### 3. **Karakteristik Visual Mirip** 🎨
Alpukat mentah yang Anda foto mungkin:
- Warna hijau yang agak gelap (mirip setengah matang)
- Lighting membuat warna jadi lebih gelap
- Ukuran/bentuk mirip dengan alpukat matang di dataset

---

## ✅ Solusi: Improve Dataset & Re-Train

### **Step 1: Audit Dataset Anda Saat Ini** 🔎

Buka Teachable Machine project Anda lagi:
1. Hitung jumlah foto per kategori
2. Cek apakah balanced (harus ±sama)

**Target:**
```
Matang:           100+ foto ✅
Setengah Matang:  100+ foto ✅
Mentah:           100+ foto ✅
```

---

### **Step 2: Tambah Foto Alpukat MENTAH** 📸

**FOKUS PADA VARIASI!** Foto alpukat mentah Anda yang salah klasifikasi itu dengan berbagai kondisi:

#### A. **Variasi Pencahayaan**
- ☀️ Siang hari (terang)
- 💡 Indoor lighting
- 🌥️ Mendung
- 🌙 Agak gelap (tapi masih jelas)

#### B. **Variasi Angle**
- 📐 Dari atas (top view)
- 🔄 Samping kiri
- 🔄 Samping kanan
- 📏 45 derajat
- 🎯 Close-up kulit

#### C. **Variasi Background**
- ⬜ Background putih
- 🟫 Background kayu/meja
- ⬛ Background hitam/gelap
- 🟩 Background hijau (be careful!)

#### D. **Variasi Kondisi Alpukat Mentah**
Foto alpukat mentah dengan berbagai tingkat "ke-mentahan":
- 🌱 **Sangat mentah:** Hijau cerah banget
- 🍃 **Mentah:** Hijau standar
- 🥬 **Mendekati setengah matang:** Hijau sedikit gelap

---

### **Step 3: Quality Check Foto** ✨

Sebelum upload, pastikan setiap foto:

✅ **Good Photo Checklist:**
- [ ] Fokus jelas (tidak blur)
- [ ] Satu alpukat utama (bukan multiple)
- [ ] Alpukat memenuhi 60-80% frame
- [ ] Background konsisten dalam satu kategori
- [ ] Pencahayaan cukup (tidak terlalu gelap/terang)
- [ ] Tidak ada objek lain yang mengalihkan perhatian

❌ **Bad Photo Examples:**
- Blur/tidak fokus
- Alpukat terlalu kecil di foto
- Multiple alpukat (model bingung)
- Shadow/bayangan terlalu kuat
- Filter Instagram (jangan pakai filter!)

---

### **Step 4: Re-Upload & Re-Train** 🎓

1. **Buka project Teachable Machine Anda:**
   - URL: https://teachablemachine.withgoogle.com/models/geFNsstXw/

2. **Edit Project:**
   - Click "Edit in Teachable Machine" (atau buat project baru)

3. **Tambah Foto MENTAH:**
   - Click "Add image samples" di class "Mentah"
   - Upload 50-100 foto baru alpukat mentah
   - **Include foto alpukat mentah yang tadi salah klasifikasi!** ← Penting!

4. **Pastikan Balanced:**
   ```
   Matang:           150 images ✅
   Setengah Matang:  150 images ✅
   Mentah:           150 images ✅ ← Tambah sampai sama!
   ```

5. **Re-Train Model:**
   - Click "Train Model"
   - Setting Advanced (optional):
     - **Epochs: 100** (lebih lama, lebih akurat)
     - **Batch size: 16** (default)
     - **Learning rate: 0.001** (default)
   - Tunggu 3-5 menit

6. **Test di Panel Preview:**
   - Upload foto alpukat mentah yang tadi salah
   - Sekarang harusnya benar!

7. **Export Model Baru:**
   - Click "Export Model"
   - Tab "Tensorflow.js"
   - **"Upload my model"** ← PENTING!
   - Copy URL baru

---

### **Step 5: Update Model di Aplikasi** 🔧

Setelah dapat URL model baru:

1. **Buka file:** `src/utils/classifier.js`

2. **Update MODEL_URL** (baris 6-9):
   ```javascript
   MODEL_URL: typeof window !== 'undefined'
       ? (localStorage.getItem('customModelUrl') || 'https://teachablemachine.withgoogle.com/models/[URL_BARU_ANDA]/')
       : 'https://teachablemachine.withgoogle.com/models/[URL_BARU_ANDA]/',
   ```

3. **Save file**

4. **Test ulang:**
   - Refresh browser (Ctrl+F5)
   - Upload foto alpukat mentah
   - Sekarang harusnya akurat! ✅

---

## 🧪 Testing & Validation

### A. **Test dengan Foto Baru** (Belum pernah di training)
```
✅ Upload 5 foto alpukat matang   → Harusnya: "Matang"
✅ Upload 5 foto alpukat mentah   → Harusnya: "Mentah"
✅ Upload 5 foto setengah matang  → Harusnya: "Setengah Matang"
```

### B. **Cek Confidence Level**
- **Good:** 70-95% confidence
- **Warning:** 50-70% (model ragu)
- **Bad:** <50% (dataset perlu diperbaiki)

### C. **Edge Cases**
Test dengan kondisi sulit:
- Alpukat mentah yang agak gelap
- Alpukat matang yang masih ada hijau
- Pencahayaan rendah
- Foto dari jarak jauh

---

## 📊 Expected Results Setelah Improvement

### Before (Dataset Kurang):
```
Foto alpukat mentah  → 🔴 Prediksi: Matang (70%) ❌
Foto alpukat matang  → 🟢 Prediksi: Matang (85%) ✅
```

### After (Dataset Diperbaiki):
```
Foto alpukat mentah  → 🟢 Prediksi: Mentah (82%) ✅
Foto alpukat matang  → 🟢 Prediksi: Matang (88%) ✅
```

---

## 💡 Pro Tips untuk Dataset Perfect

### 1. **"Hard Examples" Strategy** 🎯
Tambahkan foto-foto yang **sulit** ke dataset:
- Alpukat mentah yang warnanya agak gelap
- Alpukat matang yang masih ada sedikit hijau
- Transisi antara mentah → setengah matang
- Transisi antara setengah matang → matang

### 2. **Consistent Photography** 📸
Gunakan setup foto yang **sama** untuk semua kategori:
- Background yang sama (putih/netral)
- Jarak kamera yang sama
- Lighting yang sama
- Angle yang mirip (tapi tetap variatif)

### 3. **Data Cleaning** 🧹
Review foto yang sudah di-upload:
- Hapus foto yang blur/jelek
- Hapus foto yang salah kategori
- Pastikan label benar

### 4. **Incremental Training** 🔄
Jika akurasi masih kurang:
1. Identifikasi foto mana yang sering salah
2. Tambah 20-30 foto serupa ke dataset
3. Re-train
4. Test lagi
5. Repeat sampai akurat

---

## 🎬 Quick Action Plan

**Yang Harus Anda Lakukan SEKARANG:**

### ✅ Checklist (30-60 menit):

- [ ] **Foto 50-100 alpukat mentah baru**
  - Include alpukat mentah yang tadi salah klasifikasi
  - Berbagai lighting dan angle
  
- [ ] **Buka project Teachable Machine**
  - Edit model: https://teachablemachine.withgoogle.com/models/geFNsstXw/
  
- [ ] **Upload foto mentah baru ke class "Mentah"**
  
- [ ] **Pastikan balanced (sama jumlahnya)**
  - Matang: [__] images
  - Setengah Matang: [__] images
  - Mentah: [__] images ← Tambah sampai sama!
  
- [ ] **Re-train model (Epochs: 100)**
  - Tunggu 3-5 menit
  
- [ ] **Test di preview panel**
  - Upload foto mentah yang tadi salah
  
- [ ] **Export model baru**
  - Copy URL baru
  
- [ ] **Update src/utils/classifier.js**
  - Ganti MODEL_URL dengan URL baru
  
- [ ] **Test di aplikasi**
  - Refresh browser (Ctrl+F5)
  - Test dengan foto real

---

## 🆘 Masih Bermasalah?

Jika setelah re-train masih salah klasifikasi:

### Opsi 1: **Simplify ke 2 Kategori**
Hapus "Setengah Matang", fokus ke:
- ✅ Matang
- ❌ Mentah

Model akan lebih akurat dengan pilihan lebih sedikit.

### Opsi 2: **Tambah Kategori ke 4**
Pecah lebih detail:
- 🟢 **Sangat Mentah** (hijau cerah)
- 🟡 **Mentah** (hijau standar)
- 🟠 **Setengah Matang** (hijau kecoklatan)
- 🟤 **Matang** (coklat/hitam)

### Opsi 3: **Ganti Model Architecture**
Cocok untuk advanced user:
- Gunakan pre-trained model (MobileNet, ResNet)
- Transfer learning dengan dataset lebih besar

---

## 📚 Resources

- **Teachable Machine Guide:** https://teachablemachine.withgoogle.com/faq
- **Dataset Best Practices:** https://www.tensorflow.org/datasets/catalog/overview
- **Image Classification Tips:** https://developers.google.com/machine-learning/practica/image-classification

---

**🎯 Target: Akurasi >90% untuk semua kategori!**

Good luck dengan training! 🥑💪

---

## ⚡ TL;DR (Too Long; Didn't Read)

**Quick Fix:**
1. Foto 50+ alpukat mentah (termasuk yang tadi salah)
2. Upload ke Teachable Machine class "Mentah"
3. Pastikan jumlah foto balanced (sama semua kategori)
4. Re-train model (Epochs: 100)
5. Export → Copy URL baru
6. Update `src/utils/classifier.js` MODEL_URL
7. Refresh browser → Test lagi ✅

**Root Cause:** Dataset alpukat mentah terlalu sedikit/tidak variatif
**Solution:** Tambah lebih banyak foto alpukat mentah dengan berbagai kondisi
