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
    // ... rest of the slides ...
  ];

  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <div className={`presentation-container ${isDark ? 'dark' : ''}`}>
      <button
        onClick={toggleTheme}
        className="theme-toggle"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>

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