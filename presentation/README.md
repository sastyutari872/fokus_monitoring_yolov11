# 🎯 Presentasi Sistem Monitoring Fokus Mahasiswa

## 📋 Deskripsi
Landing page presentasi interaktif untuk Sistem Monitoring Fokus Mahasiswa Berbasis AI yang dikembangkan oleh Sasty Utari Arimbi dari Telkom University 2025.

## ✨ Fitur Presentasi

### 🎨 Design Features
- **Modern UI/UX**: Design yang mengikuti sistem utama dengan gradient colorful
- **Dark/Light Mode**: Toggle tema untuk kenyamanan viewing
- **Responsive Design**: Optimal di semua device (desktop, tablet, mobile)
- **Smooth Animations**: Transisi slide yang smooth dan professional
- **Interactive Navigation**: Kontrol presentasi dengan mouse dan keyboard

### 📱 Navigation Controls
- **Next/Previous Buttons**: Navigasi dengan tombol
- **Keyboard Shortcuts**: 
  - `→` atau `Space`: Next slide
  - `←`: Previous slide  
  - `Esc`: Kembali ke slide pertama
- **Progress Bar**: Indikator progress presentasi
- **Slide Counter**: Menampilkan slide saat ini

### 📊 Content Structure
1. **Cover Slide**: Judul, identitas, dan logo
2. **Latar Belakang**: Permasalahan dalam pembelajaran
3. **Urgensi**: Mengapa sistem ini penting
4. **Teknologi MERN**: Penjelasan stack technology
5. **Flask & AI**: Integrasi AI dengan Python
6. **Arsitektur**: System architecture overview
7. **Metodologi Agile**: Sprint development process
8. **Fitur Utama**: Key features overview
9. **Pengujian**: Testing results & performance
10. **Kesimpulan**: Achievements & future work

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js (v16 atau lebih baru)
- NPM atau Yarn

### Installation
```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev

# Akses presentasi
http://localhost:5173/presentation/
```

### Build untuk Production
```bash
# Build untuk production
npm run build

# Preview build
npm run preview
```

## 🎯 Cara Menggunakan Presentasi

### 1. **Navigasi**
- Gunakan tombol "Next" dan "Previous" di bagian bawah
- Atau gunakan keyboard: Arrow keys atau Spacebar
- Progress bar menunjukkan posisi saat ini

### 2. **Theme Toggle**
- Klik icon Moon/Sun di pojok kanan atas
- Switch antara light dan dark mode

### 3. **Responsive Viewing**
- Presentasi otomatis menyesuaikan dengan ukuran layar
- Optimal untuk proyektor, laptop, tablet, dan mobile

### 4. **Keyboard Shortcuts**
- `→` atau `Space`: Slide berikutnya
- `←`: Slide sebelumnya
- `Esc`: Kembali ke slide pertama

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#667eea) - Trust & Technology
- **Secondary**: Purple (#764ba2) - Innovation
- **Success**: Green (#10B981) - Positive metrics
- **Warning**: Orange (#F59E0B) - Attention
- **Error**: Red (#EF4444) - Issues

### Typography
- **Font**: Inter (Google Fonts)
- **Title**: 2.5rem, weight 800
- **Subtitle**: 1.2rem, weight 500
- **Body**: 1rem, weight 400

### Components
- **Cards**: Glass morphism effect dengan backdrop blur
- **Buttons**: Gradient background dengan hover effects
- **Icons**: Lucide React icons dengan consistent sizing
- **Animations**: Smooth transitions dengan cubic-bezier

## 📱 Responsive Breakpoints
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px

## 🔧 Customization

### Menambah Slide Baru
```typescript
// Tambahkan di array slides di PresentationApp.tsx
{
  id: 11,
  title: "Judul Slide Baru",
  subtitle: "Subtitle opsional",
  content: (
    <div>
      {/* Konten slide */}
    </div>
  )
}
```

### Mengubah Theme Colors
```css
/* Edit di presentation.css */
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  /* dst... */
}
```

### Custom Icons
```typescript
// Import icon baru dari lucide-react
import { NewIcon } from 'lucide-react';

// Gunakan dalam component
<NewIcon className="w-8 h-8" />
```

## 📊 Performance Optimization
- **Lazy Loading**: Images dan components di-load sesuai kebutuhan
- **CSS Optimization**: Minimal CSS dengan Tailwind purging
- **Bundle Size**: Optimized dengan Vite bundling
- **Smooth Animations**: Hardware-accelerated CSS transitions

## 🎯 Best Practices Presentasi

### 1. **Timing**
- Setiap slide: 2-3 menit
- Total durasi: 25-30 menit
- Sisakan 10-15 menit untuk Q&A

### 2. **Delivery Tips**
- Gunakan storytelling approach
- Highlight technical achievements
- Emphasize practical impact
- Prepare demo backup

### 3. **Interaction**
- Gunakan pointer untuk highlight
- Pause untuk pertanyaan
- Maintain eye contact dengan audience
- Use gestures untuk emphasis

## 🔗 Integration dengan Sistem Utama
- **Consistent Design**: Menggunakan design system yang sama
- **Shared Components**: Reuse icons dan color palette
- **Brand Consistency**: Logo dan typography matching
- **Technical Accuracy**: Data dan metrics yang akurat

## 📝 Notes untuk Presenter
- **Slide 1-3**: Establish problem dan context (5 menit)
- **Slide 4-6**: Technical foundation (8 menit)
- **Slide 7**: Development process (3 menit)
- **Slide 8**: Feature demonstration (5 menit)
- **Slide 9**: Results dan validation (4 menit)
- **Slide 10**: Conclusion dan future (5 menit)

## 🎓 Academic Context
Presentasi ini dirancang untuk:
- **Tugas Akhir**: Telkom University
- **Audience**: Dosen pembimbing, penguji, mahasiswa
- **Format**: Formal academic presentation
- **Duration**: 30 menit + Q&A
- **Level**: Undergraduate final project

## 📞 Contact & Support
**Sasty Utari Arimbi**
- Email: sasty.utari@student.telkomuniversity.ac.id
- University: Telkom University
- Year: 2025
- Project: Sistem Monitoring Fokus Mahasiswa Berbasis AI