import User from '../models/User.js';
import Kelas from '../models/Kelas.js';
import MataKuliah from '../models/MataKuliah.js';
import Pertemuan from '../models/Pertemuan.js';

export async function createDummyData() {
  try {
    // Check if data already exists
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Dummy data already exists');
      return;
    }

    console.log('Creating dummy data...');

    // Create 8 dosen users
    const dosenUsers = [];
    for (let i = 1; i <= 8; i++) {
      const user = new User({
        username: `dosen${i}`,
        email: `dosen${i}@university.ac.id`,
        password: 'password123',
        role: 'dosen',
        nama_lengkap: `Dr. Dosen ${i}`,
        nip: `1980010${i.toString().padStart(3, '0')}`,
        departemen: i <= 4 ? 'Teknik Informatika' : 'Sistem Informasi'
      });
      await user.save();
      dosenUsers.push(user);
    }

    // Create 1 admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@university.ac.id',
      password: 'admin123',
      role: 'admin',
      nama_lengkap: 'Admin System',
      departemen: 'IT Support'
    });
    await adminUser.save();

    // Create 8 classes
    const kelasData = [];
    for (let i = 1; i <= 8; i++) {
      const mahasiswa = [];
      for (let j = 1; j <= 30; j++) {
        mahasiswa.push({
          id_mahasiswa: `MHS${i}${j.toString().padStart(3, '0')}`,
          nama: `Mahasiswa ${i}-${j}`
        });
      }

      const kelas = new Kelas({
        nama_kelas: `TI-${i}A`,
        mahasiswa: mahasiswa,
        tahun_ajaran: '2024/2025',
        semester: i % 2 === 0 ? 'Genap' : 'Ganjil'
      });
      await kelas.save();
      kelasData.push(kelas);
    }

    // Create subjects
    const subjects = [
      'Pemrograman Web',
      'Database Management',
      'Algoritma dan Struktur Data',
      'Jaringan Komputer',
      'Sistem Operasi',
      'Rekayasa Perangkat Lunak',
      'Kecerdasan Buatan',
      'Mobile Programming'
    ];

    const mataKuliahData = [];
    for (let i = 0; i < 8; i++) {
      const mataKuliah = new MataKuliah({
        nama: subjects[i],
        kode: `TI${(i + 1).toString().padStart(3, '0')}`,
        sks: Math.floor(Math.random() * 3) + 2,
        dosen_id: dosenUsers[i]._id,
        kelas: [`TI-${i + 1}A`],
        semester: Math.floor(Math.random() * 8) + 1,
        deskripsi: `Mata kuliah ${subjects[i]} untuk mahasiswa tingkat ${Math.floor(i / 2) + 1}`
      });
      await mataKuliah.save();
      mataKuliahData.push(mataKuliah);
    }

    // Create 8 meetings for each class
    for (let kelasIndex = 0; kelasIndex < 8; kelasIndex++) {
      const kelas = kelasData[kelasIndex];
      const mataKuliah = mataKuliahData[kelasIndex];
      
      for (let pertemuanKe = 1; pertemuanKe <= 8; pertemuanKe++) {
        const dataFokus = [];
        
        // Generate focus data for each student
        for (let mahasiswaIndex = 0; mahasiswaIndex < 30; mahasiswaIndex++) {
          const mahasiswa = kelas.mahasiswa[mahasiswaIndex];
          
          // Generate random focus pattern (12 sessions of 5 minutes each)
          const fokusPattern = [];
          for (let session = 0; session < 12; session++) {
            fokusPattern.push(Math.random() > 0.3 ? 1 : 0); // 70% chance of being focused
          }
          
          const jumlahSesiFokus = fokusPattern.filter(f => f === 1).length;
          const persenFokus = Math.round((jumlahSesiFokus / 12) * 100);
          const persenTidakFokus = 100 - persenFokus;
          
          let status = 'Kurang';
          if (persenFokus >= 80) status = 'Baik';
          else if (persenFokus >= 60) status = 'Cukup';

          dataFokus.push({
            id_siswa: mahasiswa.id_mahasiswa,
            fokus: fokusPattern,
            jumlah_sesi_fokus: jumlahSesiFokus,
            durasi_fokus: jumlahSesiFokus * 5,
            waktu_hadir: 60,
            persen_fokus: persenFokus,
            persen_tidak_fokus: persenTidakFokus,
            status: status
          });
        }

        const pertemuan = new Pertemuan({
          tanggal: new Date(2024, 2, pertemuanKe * 7), // March 2024, weekly meetings
          pertemuan_ke: pertemuanKe,
          kelas: kelas.nama_kelas,
          mata_kuliah: mataKuliah.nama,
          mata_kuliah_id: mataKuliah._id,
          dosen_id: dosenUsers[kelasIndex]._id,
          durasi_pertemuan: 100,
          topik: `Pertemuan ${pertemuanKe} - ${mataKuliah.nama}`,
          data_fokus: dataFokus,
          catatan: `Pertemuan ${pertemuanKe} berjalan dengan baik`
        });
        
        await pertemuan.save();
      }
    }

    console.log('Dummy data created successfully!');
    console.log('Login credentials:');
    console.log('Admin: admin / admin123');
    console.log('Dosen: dosen1-dosen8 / password123');

  } catch (error) {
    console.error('Error creating dummy data:', error);
  }
}