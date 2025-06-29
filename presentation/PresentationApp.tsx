import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Moon, 
  Sun,
  Target,
  Brain,
  BarChart3,
  Users,
  Camera,
  Database,
  Zap,
  Shield,
  Code,
  Smartphone,
  Monitor,
  Cloud,
  CheckCircle,
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  Settings,
  Eye,
  Cpu,
  Globe
} from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
}

const PresentationApp: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'Escape') {
        setCurrentSlide(0);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const slides: Slide[] = [
    {
      id: 1,
      title: "Sistem Monitoring Fokus Mahasiswa Berbasis AI",
      subtitle: "Student Focus Monitoring System with AI Integration",
      content: (
        <div className="text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
              <Target className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Menggunakan MERN Stack & Flask dengan YOLO Detection</h3>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6">
            <p className="text-lg mb-4"><strong>Disusun oleh:</strong></p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">Sasty Utari Arimbi</p>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">Telkom University</p>
            <p className="text-lg font-semibold">2025</p>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Latar Belakang",
      subtitle: "Permasalahan dalam Pembelajaran Modern",
      content: (
        <div>
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-6 text-red-600 dark:text-red-400">🚨 Tantangan Pendidikan Modern:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="feature-card">
                <div className="feature-icon">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <h4 className="feature-title">Pengukuran Objektif</h4>
                <p className="feature-description">Kesulitan mengukur tingkat fokus mahasiswa secara objektif dan real-time</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <Users className="w-8 h-8" />
                </div>
                <h4 className="feature-title">Kelas Besar</h4>
                <p className="feature-description">Jumlah mahasiswa yang besar dalam satu kelas sulit dipantau individual</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <Smartphone className="w-8 h-8" />
                </div>
                <h4 className="feature-title">Gangguan Digital</h4>
                <p className="feature-description">Gangguan teknologi (smartphone, laptop) selama pembelajaran</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <Eye className="w-8 h-8" />
                </div>
                <h4 className="feature-title">Keterbatasan Monitoring</h4>
                <p className="feature-description">Keterbatasan waktu dosen untuk memantau setiap mahasiswa</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6">
            <h4 className="text-lg font-bold mb-4 text-red-700 dark:text-red-300">📉 Dampak:</h4>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• Penurunan kualitas pembelajaran</li>
              <li>• Kesulitan evaluasi efektivitas metode mengajar</li>
              <li>• Kurangnya data objektif untuk perbaikan pembelajaran</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Urgensi Penelitian",
      subtitle: "Mengapa Sistem Ini Penting?",
      content: (
        <div>
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-6 text-orange-600 dark:text-orange-400">⚡ Kebutuhan Mendesak:</h3>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-marker">1</div>
                <div className="timeline-content">
                  <h4 className="timeline-title">Era Digital Learning</h4>
                  <p className="timeline-description">Perlu tools monitoring yang canggih untuk pembelajaran digital</p>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-marker">2</div>
                <div className="timeline-content">
                  <h4 className="timeline-title">Objektivitas Data</h4>
                  <p className="timeline-description">Menggantikan penilaian subjektif dosen dengan data objektif</p>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-marker">3</div>
                <div className="timeline-content">
                  <h4 className="timeline-title">Efisiensi Pembelajaran</h4>
                  <p className="timeline-description">Optimalisasi metode mengajar berdasarkan data real-time</p>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-marker">4</div>
                <div className="timeline-content">
                  <h4 className="timeline-title">Personalisasi Pendidikan</h4>
                  <p className="timeline-description">Data untuk pembelajaran adaptif dan personal</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6">
            <h4 className="text-lg font-bold mb-4 text-green-700 dark:text-green-300">🎯 Manfaat yang Diharapkan:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-semibold">Peningkatan Kualitas</p>
              </div>
              <div className="text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-semibold">Identifikasi Mahasiswa</p>
              </div>
              <div className="text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-semibold">Data Analytics</p>
              </div>
              <div className="text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                <p className="text-sm font-semibold">Real-time Feedback</p>
              </div>
              <div className="text-center">
                <Brain className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
                <p className="text-sm font-semibold">Insight Mendalam</p>
              </div>
              <div className="text-center">
                <Award className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <p className="text-sm font-semibold">Pembelajaran Adaptif</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Teknologi - MERN Stack",
      subtitle: "MongoDB, Express.js, React, Node.js",
      content: (
        <div>
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-6 text-blue-600 dark:text-blue-400">🚀 Mengapa MERN Stack?</h3>
            <div className="tech-stack">
              <div className="tech-item">
                <div className="tech-icon">
                  <Database className="w-6 h-6" />
                </div>
                <span className="tech-name">MongoDB</span>
              </div>
              <div className="tech-item">
                <div className="tech-icon">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="tech-name">Express.js</span>
              </div>
              <div className="tech-item">
                <div className="tech-icon">
                  <Code className="w-6 h-6" />
                </div>
                <span className="tech-name">React</span>
              </div>
              <div className="tech-item">
                <div className="tech-icon">
                  <Settings className="w-6 h-6" />
                </div>
                <span className="tech-name">Node.js</span>
              </div>
            </div>
          </div>
          
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Database className="w-8 h-8" />
              </div>
              <h4 className="feature-title">MongoDB</h4>
              <ul className="feature-description space-y-1">
                <li>• NoSQL database yang fleksibel</li>
                <li>• Cocok untuk data analytics</li>
                <li>• Scalable untuk big data</li>
                <li>• Real-time synchronization</li>
              </ul>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Zap className="w-8 h-8" />
              </div>
              <h4 className="feature-title">Express.js</h4>
              <ul className="feature-description space-y-1">
                <li>• Fast web framework</li>
                <li>• Robust security features</li>
                <li>• Extensive middleware</li>
                <li>• RESTful API development</li>
              </ul>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Monitor className="w-8 h-8" />
              </div>
              <h4 className="feature-title">React</h4>
              <ul className="feature-description space-y-1">
                <li>• Modern responsive UI</li>
                <li>• Virtual DOM performance</li>
                <li>• Real-time visualization</li>
                <li>• Mobile-responsive design</li>
              </ul>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Settings className="w-8 h-8" />
              </div>
              <h4 className="feature-title">Node.js</h4>
              <ul className="feature-description space-y-1">
                <li>• High-performance runtime</li>
                <li>• Non-blocking I/O</li>
                <li>• Rich package ecosystem</li>
                <li>• Full-stack JavaScript</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "Teknologi - Flask & AI",
      subtitle: "Python Flask untuk AI Integration",
      content: (
        <div>
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-6 text-purple-600 dark:text-purple-400">🐍 Mengapa Flask?</h3>
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <Brain className="w-8 h-8" />
                </div>
                <h4 className="feature-title">Python Ecosystem</h4>
                <p className="feature-description">Akses ke library AI/ML terbaik seperti TensorFlow, PyTorch, OpenCV</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <Cpu className="w-8 h-8" />
                </div>
                <h4 className="feature-title">AI/ML Integration</h4>
                <p className="feature-description">Integrasi seamless dengan framework machine learning</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <Zap className="w-8 h-8" />
                </div>
                <h4 className="feature-title">Lightweight</h4>
                <p className="feature-description">Minimal overhead untuk AI processing yang optimal</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <Cloud className="w-8 h-8" />
                </div>
                <h4 className="feature-title">Microservice</h4>
                <p className="feature-description">Arsitektur microservice yang scalable untuk AI services</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6">
            <h4 className="text-lg font-bold mb-4 text-purple-700 dark:text-purple-300">🎯 YOLO (You Only Look Once):</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="stat-number">30+</div>
                <div className="stat-label">FPS Processing</div>
              </div>
              <div className="text-center">
                <div className="stat-number">95%</div>
                <div className="stat-label">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="stat-number">7</div>
                <div className="stat-label">Gesture Types</div>
              </div>
              <div className="text-center">
                <div className="stat-number">Real</div>
                <div className="stat-label">Time</div>
              </div>
            </div>
            
            <div className="code-block">
              <div className="text-green-400 mb-2"># AI Pipeline</div>
              <div>Camera Feed → YOLO Detection → Gesture Analysis → Focus Classification → Real-time Dashboard</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 6,
      title: "Arsitektur Sistem",
      subtitle: "System Architecture Overview",
      content: (
        <div>
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">🏗️ Arsitektur Microservice</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="feature-card text-center">
                <div className="feature-icon mx-auto">
                  <Monitor className="w-8 h-8" />
                </div>
                <h4 className="feature-title">Frontend (React)</h4>
                <ul className="feature-description text-left space-y-1">
                  <li>• Dashboard</li>
                  <li>• Live Monitor</li>
                  <li>• Analytics</li>
                  <li>• Reports</li>
                </ul>
              </div>
              
              <div className="feature-card text-center">
                <div className="feature-icon mx-auto">
                  <Settings className="w-8 h-8" />
                </div>
                <h4 className="feature-title">Backend (Node.js)</h4>
                <ul className="feature-description text-left space-y-1">
                  <li>• REST API</li>
                  <li>• Authentication</li>
                  <li>• Data Management</li>
                  <li>• File Upload</li>
                </ul>
              </div>
              
              <div className="feature-card text-center">
                <div className="feature-icon mx-auto">
                  <Brain className="w-8 h-8" />
                </div>
                <h4 className="feature-title">AI Service (Flask)</h4>
                <ul className="feature-description text-left space-y-1">
                  <li>• YOLO Model</li>
                  <li>• Face Detection</li>
                  <li>• Gesture Recognition</li>
                  <li>• Focus Analysis</li>
                </ul>
              </div>
            </div>
            
            <div className="feature-card text-center">
              <div className="feature-icon mx-auto">
                <Database className="w-8 h-8" />
              </div>
              <h4 className="feature-title">Database (MongoDB)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="text-sm">
                  <div className="font-semibold">User Data</div>
                  <div className="text-gray-500">Authentication</div>
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Session Data</div>
                  <div className="text-gray-500">Live Monitoring</div>
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Analytics</div>
                  <div className="text-gray-500">Performance</div>
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Reports</div>
                  <div className="text-gray-500">Export Data</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6">
            <h4 className="text-lg font-bold mb-4 text-indigo-700 dark:text-indigo-300">🔄 Data Flow:</h4>
            <div className="code-block">
              <div className="text-blue-400">1. Camera Feed</div>
              <div className="text-green-400">2. AI Processing (Flask)</div>
              <div className="text-yellow-400">3. Data Storage (MongoDB)</div>
              <div className="text-purple-400">4. Real-time Dashboard (React)</div>
              <div className="text-red-400">5. Analytics & Reports</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 7,
      title: "Metodologi Agile",
      subtitle: "Agile Development Process",
      content: (
        <div>
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-6 text-green-600 dark:text-green-400">🏃‍♂️ Sprint Planning & Execution</h3>
            
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-marker">1</div>
                <div className="timeline-content">
                  <h4 className="timeline-title">Sprint 1 (2 minggu): Foundation</h4>
                  <ul className="timeline-description space-y-1">
                    <li>• Setup project structure</li>
                    <li>• Authentication system</li>
                    <li>• Basic dashboard</li>
                    <li>• Database design</li>
                  </ul>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-marker">2</div>
                <div className="timeline-content">
                  <h4 className="timeline-title">Sprint 2 (2 minggu): Core Features</h4>
                  <ul className="timeline-description space-y-1">
                    <li>• User management</li>
                    <li>• Class & subject management</li>
                    <li>• Meeting scheduling</li>
                    <li>• Basic reporting</li>
                  </ul>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-marker">3</div>
                <div className="timeline-content">
                  <h4 className="timeline-title">Sprint 3 (2 minggu): AI Integration</h4>
                  <ul className="timeline-description space-y-1">
                    <li>• Flask AI service setup</li>
                    <li>• YOLO model integration</li>
                    <li>• Camera feed processing</li>
                    <li>• Real-time detection</li>
                  </ul>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-marker">4</div>
                <div className="timeline-content">
                  <h4 className="timeline-title">Sprint 4 (2 minggu): Advanced Features</h4>
                  <ul className="timeline-description space-y-1">
                    <li>• Live monitoring dashboard</li>
                    <li>• Advanced analytics</li>
                    <li>• Export functionality</li>
                    <li>• UI/UX improvements</li>
                  </ul>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-marker">5</div>
                <div className="timeline-content">
                  <h4 className="timeline-title">Sprint 5 (1 minggu): Testing & Deployment</h4>
                  <ul className="timeline-description space-y-1">
                    <li>• Unit testing</li>
                    <li>• Integration testing</li>
                    <li>• Deployment setup</li>
                    <li>• Documentation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 8,
      title: "Fitur Utama Sistem",
      subtitle: "Key Features Overview",
      content: (
        <div>
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-6 text-blue-600 dark:text-blue-400">✨ Fitur-Fitur Unggulan</h3>
            
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <Camera className="w-8 h-8" />
                </div>
                <h4 className="feature-title">Live Monitoring</h4>
                <p className="feature-description">Real-time monitoring fokus mahasiswa dengan AI detection dan camera feed</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <h4 className="feature-title">Analytics Dashboard</h4>
                <p className="feature-description">Dashboard analytics komprehensif dengan visualisasi data real-time</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <Users className="w-8 h-8" />
                </div>
                <h4 className="feature-title">Management System</h4>
                <p className="feature-description">Sistem manajemen kelas, mata kuliah, dan jadwal pertemuan</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <Brain className="w-8 h-8" />
                </div>
                <h4 className="feature-title">AI Detection</h4>
                <p className="feature-description">YOLO-based detection untuk face recognition dan gesture analysis</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h4 className="feature-title">Report Generation</h4>
                <p className="feature-description">Export laporan ke PDF dan Excel dengan data analytics lengkap</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <Shield className="w-8 h-8" />
                </div>
                <h4 className="feature-title">Security & Privacy</h4>
                <p className="feature-description">Sistem keamanan berlapis dengan JWT authentication dan data encryption</p>
              </div>
            </div>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">95%</div>
              <div className="stat-label">AI Accuracy</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">30+</div>
              <div className="stat-label">FPS Processing</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">7</div>
              <div className="stat-label">Gesture Types</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">100+</div>
              <div className="stat-label">Concurrent Users</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 9,
      title: "Pengujian & Hasil",
      subtitle: "Testing Results & Performance",
      content: (
        <div>
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-6 text-green-600 dark:text-green-400">🧪 Black Box Testing Results</h3>
            
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="feature-title">Functional Testing</h4>
                <ul className="feature-description space-y-1">
                  <li>✅ Login/logout: 100%</li>
                  <li>✅ CRUD operations: 100%</li>
                  <li>✅ AI detection: 95%</li>
                  <li>✅ Real-time updates: 100%</li>
                </ul>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <Monitor className="w-8 h-8" />
                </div>
                <h4 className="feature-title">UI/UX Testing</h4>
                <ul className="feature-description space-y-1">
                  <li>✅ Navigation flow: 100%</li>
                  <li>✅ Form validation: 100%</li>
                  <li>✅ Responsive design: 100%</li>
                  <li>✅ Cross-browser: 100%</li>
                </ul>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <Zap className="w-8 h-8" />
                </div>
                <h4 className="feature-title">Performance Testing</h4>
                <ul className="feature-description space-y-1">
                  <li>✅ Page load: <2s</li>
                  <li>✅ AI processing: 30 FPS</li>
                  <li>✅ Concurrent users: 150</li>
                  <li>✅ Database: <500ms</li>
                </ul>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <Shield className="w-8 h-8" />
                </div>
                <h4 className="feature-title">Security Testing</h4>
                <ul className="feature-description space-y-1">
                  <li>✅ Authentication: Secure</li>
                  <li>✅ Authorization: Role-based</li>
                  <li>✅ Data encryption: AES-256</li>
                  <li>✅ Vulnerabilities: 0</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6">
            <h4 className="text-lg font-bold mb-4 text-green-700 dark:text-green-300">📊 Performance Metrics:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">1.2s</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Average Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">95%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Face Detection Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">92%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Gesture Recognition</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">4.8/5</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">User Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Security Issues</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">100%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Mobile Compatible</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 10,
      title: "Kesimpulan & Future Work",
      subtitle: "Conclusion & Next Steps",
      content: (
        <div>
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-6 text-blue-600 dark:text-blue-400">🎯 Pencapaian Utama</h3>
            
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="feature-title">Sistem Berhasil</h4>
                <p className="feature-description">Berhasil mengembangkan sistem monitoring fokus real-time dengan AI</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <Brain className="w-8 h-8" />
                </div>
                <h4 className="feature-title">AI Integration</h4>
                <p className="feature-description">Integrasi YOLO dengan akurasi 95% untuk face detection</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <h4 className="feature-title">Analytics</h4>
                <p className="feature-description">Dashboard analytics komprehensif dengan export capabilities</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <Globe className="w-8 h-8" />
                </div>
                <h4 className="feature-title">Scalable</h4>
                <p className="feature-description">Arsitektur scalable untuk implementasi di berbagai institusi</p>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-6 text-purple-600 dark:text-purple-400">🚀 Future Work</h3>
            
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-marker">📱</div>
                <div className="timeline-content">
                  <h4 className="timeline-title">Mobile App Development</h4>
                  <p className="timeline-description">Native mobile application untuk monitoring on-the-go</p>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-marker">🧠</div>
                <div className="timeline-content">
                  <h4 className="timeline-title">Enhanced AI</h4>
                  <p className="timeline-description">Emotion detection dan predictive analytics</p>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-marker">🌐</div>
                <div className="timeline-content">
                  <h4 className="timeline-title">Multi-campus Support</h4>
                  <p className="timeline-description">Support untuk multiple institutions dan LMS integration</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 text-center">
            <h4 className="text-xl font-bold mb-4">Terima Kasih</h4>
            <p className="text-lg mb-4"><strong>Sasty Utari Arimbi</strong></p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Telkom University 2025</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📧 sasty.utari@student.telkomuniversity.ac.id
            </p>
            <div className="mt-6">
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                "Advancing Education Through Technology"
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <div className={`presentation-container ${isDark ? 'dark' : ''}`}>
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="theme-toggle"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>

      {/* Slides */}
      <div className="slide active">
        <div className="slide-content">
          <div className="slide-header">
            <h1 className="slide-title">{slides[currentSlide].title}</h1>
            {slides[currentSlide].subtitle && (
              <p className="slide-subtitle">{slides[currentSlide].subtitle}</p>
            )}
          </div>
          {slides[currentSlide].content}
        </div>
      </div>

      {/* Navigation */}
      <div className="navigation">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="nav-button"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>

        <div className="slide-counter">
          <span>{currentSlide + 1}</span>
          <span>/</span>
          <span>{slides.length}</span>
        </div>

        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="nav-button"
          aria-label="Next slide"
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PresentationApp;