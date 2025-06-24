import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Square, 
  Camera, 
  Eye, 
  EyeOff, 
  Download,
  Settings,
  BarChart3,
  Clock,
  Target,
  Grid3X3,
  Trash2,
  Save,
  Users,
  BookOpen,
  Brain,
  Upload
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';

interface SeatPosition {
  seat_id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  is_occupied: boolean;
  student_id: string | null;
  face_detected: boolean;
  focus_start_time: number | null;
  total_focus_duration: number;
}

interface DetectionData {
  timestamp: string;
  totalDetections: number;
  focusedCount: number;
  notFocusedCount: number;
  sleepingCount: number;
  phoneUsingCount: number;
  chattingCount: number;
  focusPercentage: number;
  seatData: SeatPosition[];
}

interface LiveSession {
  _id: string;
  sessionId: string;
  kelas: string;
  mata_kuliah: string;
  startTime: string;
  isActive: boolean;
  detectionData: DetectionData[];
  seatPositions: SeatPosition[];
  summary: {
    averageFocus: number;
    peakFocus: number;
    lowestFocus: number;
  };
}

interface CameraDevice {
  deviceId: string;
  label: string;
}

interface ModelInfo {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
}

export default function LiveMonitoring() {
  // Session Management
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentSession, setCurrentSession] = useState<LiveSession | null>(null);
  const [detectionData, setDetectionData] = useState<DetectionData[]>([]);
  
  // Configuration
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [sessionName, setSessionName] = useState('');
  
  // Camera & Labelling
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [seatPositions, setSeatPositions] = useState<SeatPosition[]>([]);
  const [totalSeats, setTotalSeats] = useState(30);
  
  // Drawing State
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentSeat, setCurrentSeat] = useState<Partial<SeatPosition> | null>(null);
  const [isLabellingMode, setIsLabellingMode] = useState(false);
  
  // Data
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState<Array<{ _id: string; nama: string }>>([]);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [savedSessions, setSavedSessions] = useState([]);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    getCameraDevices();
    fetchClasses();
    fetchSubjects();
    fetchModels();
    fetchSavedSessions();
    
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isMonitoring) {
      syncCanvasSize();
      window.addEventListener('resize', syncCanvasSize);
      return () => window.removeEventListener('resize', syncCanvasSize);
    }
  }, [isMonitoring]);

  // Data Fetching Functions
  const getCameraDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`
        }));
      setCameras(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedCamera(videoDevices[0].deviceId);
      }
    } catch (error) {
      toast.error('Failed to get camera devices');
      console.error('Camera enumeration error:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get('/kelas');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/mata-kuliah');
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchModels = async () => {
    try {
      // Simulate Firebase model fetching
      const mockModels: ModelInfo[] = [
        {
          id: '1',
          name: 'YOLOv8 Face Detection',
          url: 'https://firebase.storage.url/model1.pt',
          type: 'pytorch',
          uploadedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'YOLOv8 Head Detection',
          url: 'https://firebase.storage.url/model2.pt',
          type: 'pytorch',
          uploadedAt: new Date().toISOString()
        }
      ];
      setModels(mockModels);
      if (mockModels.length > 0) {
        setSelectedModel(mockModels[0].id);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const fetchSavedSessions = async () => {
    try {
      const response = await axios.get('/api/labelling-sessions');
      setSavedSessions(response.data);
    } catch (error) {
      console.error('Error fetching saved sessions:', error);
    }
  };

  // Camera Functions
  const startCamera = async () => {
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: 1920,
          height: 1080
        },
        audio: false
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        syncCanvasSize();
      }
      toast.success('Camera started successfully');
    } catch (error) {
      toast.error('Failed to start camera');
      console.error('Camera start error:', error);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    toast.success('Camera stopped');
  };

  // Seat Labelling Functions
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isLabellingMode || !cameraStream) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setCurrentSeat({
      seat_id: seatPositions.length + 1,
      x,
      y,
      width: 0,
      height: 0,
      is_occupied: false,
      student_id: null,
      face_detected: false,
      focus_start_time: null,
      total_focus_duration: 0
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentSeat || !isLabellingMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    setCurrentSeat({
      ...currentSeat,
      width: currentX - (currentSeat.x || 0),
      height: currentY - (currentSeat.y || 0)
    });

    drawCanvas();
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing || !currentSeat || !isLabellingMode) return;

    if (Math.abs(currentSeat.width || 0) > 20 && Math.abs(currentSeat.height || 0) > 20) {
      const newSeat: SeatPosition = {
        seat_id: seatPositions.length + 1,
        x: currentSeat.x || 0,
        y: currentSeat.y || 0,
        width: Math.abs(currentSeat.width || 0),
        height: Math.abs(currentSeat.height || 0),
        is_occupied: false,
        student_id: null,
        face_detected: false,
        focus_start_time: null,
        total_focus_duration: 0
      };

      setSeatPositions([...seatPositions, newSeat]);
      toast.success(`Seat ${newSeat.seat_id} added`);
    }

    setIsDrawing(false);
    setCurrentSeat(null);
  };

  const generateGridSeats = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rows = Math.ceil(Math.sqrt(totalSeats));
    const cols = Math.ceil(totalSeats / rows);
    const seatWidth = 80;
    const seatHeight = 60;
    const padding = 20;
    
    const newSeats: SeatPosition[] = [];
    let seatId = 1;

    for (let row = 0; row < rows && seatId <= totalSeats; row++) {
      for (let col = 0; col < cols && seatId <= totalSeats; col++) {
        newSeats.push({
          seat_id: seatId,
          x: col * (seatWidth + padding) + padding,
          y: row * (seatHeight + padding) + padding,
          width: seatWidth,
          height: seatHeight,
          is_occupied: false,
          student_id: null,
          face_detected: false,
          focus_start_time: null,
          total_focus_duration: 0
        });
        seatId++;
      }
    }

    setSeatPositions(newSeats);
    toast.success(`Generated ${newSeats.length} seat positions`);
  };

  const clearAllSeats = () => {
    setSeatPositions([]);
    toast.success('All seats cleared');
  };

  // Canvas Drawing
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw existing seats
    seatPositions.forEach((seat) => {
      let strokeColor = '#3B82F6'; // Default blue
      let fillColor = 'rgba(59, 130, 246, 0.1)';
      
      if (seat.face_detected) {
        strokeColor = '#10B981'; // Green for face detected
        fillColor = 'rgba(16, 185, 129, 0.2)';
      } else if (seat.is_occupied) {
        strokeColor = '#F59E0B'; // Orange for occupied but no face
        fillColor = 'rgba(245, 158, 11, 0.2)';
      }

      ctx.strokeStyle = strokeColor;
      ctx.fillStyle = fillColor;
      ctx.lineWidth = 3;
      ctx.fillRect(seat.x, seat.y, seat.width, seat.height);
      ctx.strokeRect(seat.x, seat.y, seat.width, seat.height);
      
      // Draw seat label
      ctx.fillStyle = strokeColor;
      ctx.font = '12px Arial';
      ctx.fillText(`S${seat.seat_id}`, seat.x + 5, seat.y + 15);
      
      // Draw focus duration if available
      if (seat.total_focus_duration > 0) {
        const minutes = Math.floor(seat.total_focus_duration / 60000);
        const seconds = Math.floor((seat.total_focus_duration % 60000) / 1000);
        ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')}`, seat.x + 5, seat.y + seat.height - 5);
      }
    });

    // Draw current drawing seat
    if (isDrawing && currentSeat && isLabellingMode) {
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        currentSeat.x || 0,
        currentSeat.y || 0,
        currentSeat.width || 0,
        currentSeat.height || 0
      );
      ctx.setLineDash([]);
    }
  };

  const syncCanvasSize = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const rect = video.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      drawCanvas();
    }
  };

  useEffect(() => {
    if (cameraStream) {
      const interval = setInterval(drawCanvas, 100);
      return () => clearInterval(interval);
    }
  }, [cameraStream, seatPositions, currentSeat, isDrawing, isLabellingMode]);

  // Monitoring Functions
  const startMonitoring = async () => {
    if (!selectedClass || !selectedSubject || !selectedModel || !sessionName) {
      toast.error('Please fill all required fields');
      return;
    }

    if (seatPositions.length === 0) {
      toast.error('Please add seat positions before starting monitoring');
      return;
    }

    try {
      if (!cameraStream) {
        await startCamera();
      }

      const response = await axios.post('/live-monitoring/start', {
        kelas: selectedClass,
        mata_kuliah_id: selectedSubject,
        mata_kuliah: subjects.find((s: any) => s._id === selectedSubject)?.nama,
        sessionName,
        seatPositions,
        modelId: selectedModel
      });

      setCurrentSession(response.data);
      setIsMonitoring(true);
      setIsLabellingMode(false);
      toast.success('Live monitoring started');

      // Start face detection simulation
      startFaceDetection(response.data.sessionId);
    } catch (error) {
      toast.error('Failed to start monitoring');
      console.error('Start monitoring error:', error);
    }
  };

  const stopMonitoring = async () => {
    if (!currentSession) return;

    try {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }

      await axios.post(`/live-monitoring/stop/${currentSession.sessionId}`);
      
      // Export data automatically
      await exportSessionData();
      
      setIsMonitoring(false);
      setCurrentSession(null);
      setDetectionData([]);
      
      // Reset seat focus data
      setSeatPositions(prev => prev.map(seat => ({
        ...seat,
        face_detected: false,
        focus_start_time: null,
        total_focus_duration: 0
      })));
      
      toast.success('Live monitoring stopped and data exported');
    } catch (error) {
      toast.error('Failed to stop monitoring');
      console.error('Stop monitoring error:', error);
    }
  };

  const startFaceDetection = (sessionId: string) => {
    detectionIntervalRef.current = setInterval(() => {
      if (!isMonitoring) {
        if (detectionIntervalRef.current) {
          clearInterval(detectionIntervalRef.current);
        }
        return;
      }

      // Simulate face detection within seat bounding boxes
      const updatedSeats = seatPositions.map(seat => {
        const currentTime = Date.now();
        const faceDetected = Math.random() > 0.3; // 70% chance of face detection
        
        let newSeat = { ...seat };
        
        if (faceDetected && !seat.face_detected) {
          // Face just detected - start focus timer
          newSeat.face_detected = true;
          newSeat.focus_start_time = currentTime;
          newSeat.is_occupied = true;
        } else if (!faceDetected && seat.face_detected && seat.focus_start_time) {
          // Face lost - add to total focus duration
          newSeat.face_detected = false;
          newSeat.total_focus_duration += currentTime - seat.focus_start_time;
          newSeat.focus_start_time = null;
        } else if (faceDetected && seat.face_detected) {
          // Face still detected - keep tracking
          newSeat.face_detected = true;
          newSeat.is_occupied = true;
        } else {
          // No face detected
          newSeat.face_detected = false;
          newSeat.is_occupied = false;
        }
        
        return newSeat;
      });

      setSeatPositions(updatedSeats);

      // Calculate detection statistics
      const totalDetections = updatedSeats.filter(seat => seat.is_occupied).length;
      const focusedCount = updatedSeats.filter(seat => seat.face_detected).length;
      const notFocusedCount = totalDetections - focusedCount;
      const focusPercentage = totalDetections > 0 ? Math.round((focusedCount / totalDetections) * 100) : 0;

      const newDetectionData: DetectionData = {
        timestamp: new Date().toLocaleTimeString(),
        totalDetections,
        focusedCount,
        notFocusedCount,
        sleepingCount: Math.floor(Math.random() * 3),
        phoneUsingCount: Math.floor(Math.random() * 2),
        chattingCount: Math.floor(Math.random() * 2),
        focusPercentage,
        seatData: updatedSeats
      };

      setDetectionData(prev => [...prev.slice(-19), newDetectionData]);

      // Send to backend
      axios.post(`/live-monitoring/detection/${sessionId}`, newDetectionData)
        .catch(error => console.error('Detection data error:', error));

    }, 2000);
  };

  const exportSessionData = async () => {
    if (!currentSession) return;

    try {
      // Prepare Excel data
      const excelData = seatPositions.map(seat => ({
        'Seat ID': seat.seat_id,
        'Position X': seat.x,
        'Position Y': seat.y,
        'Width': seat.width,
        'Height': seat.height,
        'Total Focus Duration (seconds)': Math.round(seat.total_focus_duration / 1000),
        'Focus Percentage': seat.total_focus_duration > 0 ? 
          Math.round((seat.total_focus_duration / (Date.now() - new Date(currentSession.startTime).getTime())) * 100) : 0,
        'Final Status': seat.face_detected ? 'Focused' : 'Not Focused'
      }));

      // Create and download Excel file (simulation)
      console.log('Excel data prepared:', excelData);
      toast.success('Session data exported to Excel');

      // Save to database
      await axios.post('/api/session-records', {
        sessionId: currentSession.sessionId,
        sessionName,
        className: selectedClass,
        subjectName: subjects.find((s: any) => s._id === selectedSubject)?.nama,
        seatData: seatPositions,
        detectionData,
        summary: {
          totalSeats: seatPositions.length,
          averageFocusTime: seatPositions.reduce((sum, seat) => sum + seat.total_focus_duration, 0) / seatPositions.length,
          sessionDuration: Date.now() - new Date(currentSession.startTime).getTime()
        }
      });

    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export session data');
    }
  };

  const saveSession = async () => {
    if (!sessionName || !selectedClass || seatPositions.length === 0) {
      toast.error('Please fill all fields and add seat positions');
      return;
    }

    try {
      await axios.post('/api/labelling-sessions', {
        sessionName,
        className: selectedClass,
        seatPositions,
        cameraSettings: {
          deviceId: selectedCamera,
          resolution: '1920x1080'
        },
        modelId: selectedModel
      });

      toast.success('Session configuration saved');
      fetchSavedSessions();
    } catch (error) {
      console.error('Save session error:', error);
      toast.error('Failed to save session');
    }
  };

  const loadSession = (session: any) => {
    setSessionName(session.sessionName);
    setSelectedClass(session.className);
    setSeatPositions(session.seatPositions || []);
    setSelectedModel(session.modelId || '');
    toast.success('Session loaded');
  };

  // Statistics
  const latestData = detectionData[detectionData.length - 1];
  const averageFocus = detectionData.length > 0 
    ? Math.round(detectionData.reduce((sum, d) => sum + d.focusPercentage, 0) / detectionData.length)
    : 0;

  const pieData = latestData ? [
    { name: 'Focused', value: latestData.focusedCount, color: '#10B981' },
    { name: 'Not Focused', value: latestData.notFocusedCount, color: '#EF4444' },
    { name: 'Sleeping', value: latestData.sleepingCount, color: '#8B5CF6' },
    { name: 'Using Phone', value: latestData.phoneUsingCount, color: '#F59E0B' }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-xl p-6 text-white"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Target className="h-8 w-8 mr-3" />
              Live Focus Monitoring & Labelling
            </h1>
            <p className="mt-2 opacity-90">Real-time student focus detection with seat positioning</p>
          </div>
          <div className="flex items-center space-x-4">
            {isMonitoring && (
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex items-center bg-red-500 px-3 py-1 rounded-full"
              >
                <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                <span className="text-sm font-medium">LIVE</span>
              </motion.div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsLabellingMode(!isLabellingMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isLabellingMode 
                  ? 'bg-orange-500 hover:bg-orange-600' 
                  : 'bg-white bg-opacity-20 hover:bg-opacity-30'
              }`}
            >
              {isLabellingMode ? 'Exit Labelling' : 'Enter Labelling Mode'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Control Panel */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configuration
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Name</label>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                disabled={isMonitoring}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter session name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={isMonitoring}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select Class</option>
                {classes.map((kelas: any) => (
                  <option key={kelas._id} value={kelas.nama_kelas}>
                    {kelas.nama_kelas}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={isMonitoring}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select Subject</option>
                {subjects.map((subject: any) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Detection Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={isMonitoring}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select Model</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Camera Device</label>
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                disabled={isMonitoring}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {cameras.map((camera) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Seats</label>
              <input
                type="number"
                min="1"
                max="50"
                value={totalSeats}
                onChange={(e) => setTotalSeats(parseInt(e.target.value))}
                disabled={isMonitoring}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4">
              {!cameraStream ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startCamera}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Start Camera
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={stopCamera}
                  disabled={isMonitoring}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Camera
                </motion.button>
              )}

              {isLabellingMode && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={generateGridSeats}
                    className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium"
                  >
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    Generate Grid
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={clearAllSeats}
                    className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Seats
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={saveSession}
                    className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg font-medium"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Session
                  </motion.button>
                </>
              )}

              {!isMonitoring ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startMonitoring}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Monitoring
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={stopMonitoring}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop & Export
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Camera Feed */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Camera Feed & Detection
          </h3>
          
          <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-full object-cover"
              style={{ display: cameraStream ? 'block' : 'none' }}
            />
            
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ 
                display: cameraStream ? 'block' : 'none',
                cursor: isLabellingMode ? 'crosshair' : 'default'
              }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
            />
            
            {!cameraStream && (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <Camera className="h-12 w-12 mx-auto mb-2" />
                  <p>Camera not active</p>
                  <p className="text-sm">Start camera to begin</p>
                </div>
              </div>
            )}

            {isMonitoring && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                MONITORING
              </div>
            )}

            {isLabellingMode && (
              <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                LABELLING MODE
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              {isLabellingMode ? 'Labelling Instructions:' : 'Monitoring Status:'}
            </h4>
            {isLabellingMode ? (
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Click and drag to create seat bounding boxes</li>
                <li>• Blue: Empty seats, Green: Face detected, Orange: Occupied</li>
                <li>• Seats defined: {seatPositions.length}/{totalSeats}</li>
              </ul>
            ) : (
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Face detection active within seat boundaries</p>
                <p>• Focus duration tracked per seat</p>
                <p>• Real-time statistics updated every 2 seconds</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Statistics Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Current Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Live Statistics
            </h3>
            
            {latestData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{latestData.totalDetections}</div>
                    <div className="text-sm text-blue-600">Total Detected</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{latestData.focusPercentage}%</div>
                    <div className="text-sm text-green-600">Focus Rate</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Focused</span>
                    <span className="text-sm font-medium text-green-600">{latestData.focusedCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Not Focused</span>
                    <span className="text-sm font-medium text-red-600">{latestData.notFocusedCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Focus</span>
                    <span className="text-sm font-medium text-blue-600">{averageFocus}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Eye className="h-8 w-8 mx-auto mb-2" />
                <p>No detection data yet</p>
              </div>
            )}
          </div>

          {/* Seat Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Seats ({seatPositions.length})
            </h3>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {seatPositions.map((seat) => (
                <div key={seat.seat_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      seat.face_detected ? 'bg-green-500' : 
                      seat.is_occupied ? 'bg-orange-500' : 'bg-blue-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Seat {seat.seat_id}</p>
                      <p className="text-xs text-gray-500">
                        Focus: {Math.round(seat.total_focus_duration / 1000)}s
                      </p>
                    </div>
                  </div>
                  {isLabellingMode && (
                    <button
                      onClick={() => setSeatPositions(seatPositions.filter(s => s.seat_id !== seat.seat_id))}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {seatPositions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No seats defined</p>
                <p className="text-xs">Enter labelling mode to add seats</p>
              </div>
            )}
          </div>

          {/* Session Info */}
          {currentSession && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6"
            >
              <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Session Info
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-700">Session:</span>
                  <span className="font-medium text-purple-900">{sessionName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Class:</span>
                  <span className="font-medium text-purple-900">{selectedClass}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Started:</span>
                  <span className="font-medium text-purple-900">
                    {new Date(currentSession.startTime).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Average Focus:</span>
                  <span className="font-medium text-purple-900">{averageFocus}%</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Charts */}
      <AnimatePresence>
        {detectionData.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Focus Trend */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Focus Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={detectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="focusPercentage" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Activity Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Activity Distribution</h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <div className="text-center">
                    <EyeOff className="h-8 w-8 mx-auto mb-2" />
                    <p>No activity data</p>
                  </div>
                </div>
              )}
              
              {pieData.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span className="text-sm text-gray-600">{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Sessions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Saved Session Configurations</h3>
        </div>
        <div className="p-6">
          {savedSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedSessions.map((session: any) => (
                <div key={session._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{session.sessionName}</h4>
                    <button
                      onClick={() => loadSession(session)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Load
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">{session.className}</p>
                  <p className="text-sm text-gray-500">{session.seatPositions?.length || 0} seats</p>
                  <p className="text-xs text-gray-400">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Save className="h-8 w-8 mx-auto mb-2" />
              <p>No saved sessions yet</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}