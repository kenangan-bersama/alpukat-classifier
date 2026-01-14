# 🥑 Panduan Training Model Avocado Classifier

## 📋 Persiapan

### 1. Kumpulkan Dataset Foto Alpukat
Anda memerlukan minimal **50 foto per kategori** (total ~150 foto):

#### 🟢 **Kategori 1: MENTAH**
- Alpukat dengan kulit **hijau cerah**
- Masih **keras** saat ditekan
- Biasanya **baru dipetik**
- Minimal 50 foto dengan berbagai angle

#### 🟡 **Kategori 2: SETENGAH MATANG**
- Alpukat dengan kulit **hijau kecoklatan**
- **Agak lunak** saat ditekan
- Mulai ada **bintik-bintik coklat**
- Minimal 50 foto dengan berbagai angle

#### 🟤 **Kategori 3: MATANG**
- Alpukat dengan kulit **coklat gelap** atau hitam
- **Empuk** saat ditekan
- Siap dimakan
- Minimal 50 foto dengan berbagai angle

### 2. Tips Foto yang Baik
✅ **DO:**
- Foto dengan **background putih/netral**
- Pencahayaan **terang dan merata**
- Berbagai **angle** (atas, samping, 45°)
- **Close-up** yang jelas
- Satu alpukat per foto

❌ **DON'T:**
- Background ramai/pola
- Pencahayaan gelap/bayangan
- Foto dari jarak jauh
- Multiple alpukat dalam satu foto
- Blur/tidak fokus

---

## 🎓 Langkah Training di Teachable Machine

### **Step 1: Buka Teachable Machine**
1. Buka browser
2. Kunjungi: https://teachablemachine.withgoogle.com/
3. Klik **"Get Started"**

### **Step 2: Pilih Project Type**
1. Klik **"Image Project"**
2. Pilih **"Standard Image Model"**

### **Step 3: Setup Classes**
Anda akan melihat 2 class default. Rename dan tambah 1 class lagi:

1. **Class 1:** Rename dari "Class 1" → **"Matang"**
2. **Class 2:** Rename dari "Class 2" → **"Setengah Matang"**
3. Klik **"Add a class"** → Nama: **"Mentah"**

### **Step 4: Upload Dataset**

#### Untuk Class "Matang":
1. Klik **"Upload"** (atau webcam untuk foto langsung)
2. Pilih semua foto alpukat **matang** (50+ foto)
3. Upload semua sekaligus

#### Untuk Class "Setengah Matang":
1. Klik **"Upload"** di class kedua
2. Pilih semua foto alpukat **setengah matang** (50+ foto)
3. Upload semua sekaligus

#### Untuk Class "Mentah":
1. Klik **"Upload"** di class ketiga
2. Pilih semua foto alpukat **mentah** (50+ foto)
3. Upload semua sekaligus

### **Step 5: Training Settings** (Optional)
Klik **"Advanced"** untuk settings:
- **Epochs:** 50 (default, good enough)
- **Batch size:** 16 (default)
- **Learning rate:** 0.001 (default)

💡 **Untuk pemula, gunakan default settings saja!**

### **Step 6: Train Your Model!**
1. Klik tombol **"Train Model"** (warna biru)
2. Tunggu proses training:
   - Akan muncul progress bar
   - Biasanya **2-5 menit** tergantung jumlah foto
   - Jangan tutup browser saat training!

### **Step 7: Test Model**
Setelah training selesai:
1. Gunakan **"Preview"** panel di sebelah kanan
2. Upload foto alpukat test
3. Lihat hasil prediksi
4. Pastikan akurasi bagus (>80%)

### **Step 8: Export Model**
1. Klik **"Export Model"**
2. Pilih tab **"Tensorflow.js"**
3. Pilih **"Upload my model"**
4. Klik **"Upload my model"** (tombol biru)
5. Tunggu upload selesai (~30-60 detik)

### **Step 9: Copy Model URL**
Setelah upload selesai:
1. Anda akan melihat **"Shareable link"**
2. Copy URL tersebut (contoh: `https://teachablemachine.withgoogle.com/models/xxxxx/`)
3. **PENTING:** URL harus diakhiri dengan slash `/`

---

## 🔧 Integrasi Model ke Aplikasi

### **Method 1: Edit Langsung File (Recommended)**
1. Buka file: `src/utils/classifier.js`
2. Cari baris ini:
   ```javascript
   MODEL_URL: null,
   ```
3. Ganti dengan URL model Anda:
   ```javascript
   MODEL_URL: 'https://teachablemachine.withgoogle.com/models/xxxxx/',
   ```
4. Save file
5. Refresh browser - Model akan auto-load!

### **Method 2: Via UI (Akan saya tambahkan)**
Fitur upload model URL via interface (coming soon!)

---

## ✅ Verifikasi Model Berhasil

Setelah integrasi, cek console browser (F12):
1. Harusnya muncul: **"✅ Model loaded successfully!"**
2. **TIDAK ada** tulisan "Demo mode"
3. Test dengan foto alpukat:
   - Upload foto alpukat matang → Harusnya detect **"Matang"**
   - Upload foto alpukat mentah → Harusnya detect **"Mentah"**
   - Upload foto alpukat setengah matang → Harusnya detect **"Setengah Matang"**

---

## 🎯 Tips Mendapatkan Akurasi Tinggi

### 1. **Dataset Quality > Quantity**
- 100 foto berkualitas > 500 foto buruk
- Konsisten dalam:
  - Background
  - Pencahayaan
  - Angle
  - Fokus

### 2. **Balanced Dataset**
- Jumlah foto per kategori **sama**
- Jangan ada kategori yang terlalu sedikit/banyak

### 3. **Diverse Dataset**
- Berbagai ukuran alpukat
- Berbagai variasi warna dalam satu kategori
- Berbagai angle

### 4. **Data Augmentation**
Teachable Machine auto-apply:
- Rotation
- Brightness adjustment
- Flip horizontal

### 5. **Test & Iterate**
- Test model dengan foto baru
- Jika akurasi rendah, tambah foto yang sering salah
- Re-train model

---

## 🐛 Troubleshooting

### ❌ Model tidak load / Error
**Solusi:**
- Pastikan URL diakhiri dengan `/`
- Cek internet connection
- Pastikan model sudah di-upload (bukan save to computer)

### ❌ Akurasi rendah (<70%)
**Solusi:**
- Tambah lebih banyak foto (100+ per kategori)
- Pastikan foto berkualitas baik
- Re-train dengan epochs lebih tinggi (100)

### ❌ "CORS Error" di console
**Solusi:**
- Teachable Machine sudah support CORS
- Jika masih error, pastikan gunakan "Upload my model" bukan "Download"

---

## 📊 Expected Results

Dengan dataset yang baik (100+ foto per kategori):
- ✅ **Akurasi:** 85-95%
- ✅ **Confidence:** 70-95% untuk prediksi benar
- ✅ **Inference time:** <1 detik

---

## 🆘 Need Help?

Jika ada kesulitan:
1. Screenshot error message
2. Cek console browser (F12)
3. Share debug info

---

## 🔗 Resources

- Teachable Machine: https://teachablemachine.withgoogle.com/
- TensorFlow.js Docs: https://www.tensorflow.org/js
- Dataset Tips: https://teachablemachine.withgoogle.com/faq

---

**Selamat training! 🎓🥑**

Update `MODEL_URL` di file `src/utils/classifier.js` setelah model ready!
