import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  Square,
  Save,
  Users,
  Settings,
  Trash2,
  Eye,
  Target,
  Grid3X3
} from 'lucide-react';
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
}

interface CameraDevice {
  deviceId: string;
  label: string;
}


interface ModelInfo {
  name: string;
  path: string;
}

export default function StudentLabeling() {
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isLabeling, setIsLabeling] = useState(false);
  const [seatPositions, setSeatPositions] = useState<SeatPosition[]>([]);
  const [totalSeats, setTotalSeats] = useState(30);
  const [className, setClassName] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentSeat, setCurrentSeat] = useState<Partial<SeatPosition> | null>(null);
  const [labelingSessions, setLabelingSessions] = useState([]);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModelPath, setSelectedModelPath] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Removed duplicate syncCanvasSize function (containerRef version)

  useEffect(() => {
    getCameraDevices();
    fetchLabelingSessions();
    fetchModels();
  }, []);

  useEffect(() => {
    if (isLabeling) {
      syncCanvasSize();
      window.addEventListener('resize', syncCanvasSize);
      return () => window.removeEventListener('resize', syncCanvasSize);
    }
  }, [isLabeling]);

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

  const fetchModels = async () => {
    try {
      const res = await axios.get('/api/settings');
      if (res.data && res.data.models) {
        setModels(res.data.models);
        if (res.data.models.length > 0) {
          setSelectedModelPath(res.data.models[0].path);
        }
      }
    } catch (err) {
      toast.error('Failed to fetch models');
    }
  };


  const fetchLabelingSessions = async () => {
    try {
      const response = await axios.get('/api/labelling-session');
      setLabelingSessions(response.data);
    } catch (error) {
      console.error('Error fetching labeling sessions:', error);
    }
  };


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
      setIsLabeling(true);
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
    setIsLabeling(false);
    toast.success('Camera stopped');
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isLabeling) return;

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
      student_id: null
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentSeat) return;

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
    if (!isDrawing || !currentSeat) return;

    if (Math.abs(currentSeat.width || 0) > 20 && Math.abs(currentSeat.height || 0) > 20) {
      const newSeat: SeatPosition = {
        seat_id: seatPositions.length + 1,
        x: currentSeat.x || 10,
        y: currentSeat.y || 10,
        width: Math.abs(currentSeat.width || 10),
        height: Math.abs(currentSeat.height || 10),
        is_occupied: false,
        student_id: null
      };

      setSeatPositions([...seatPositions, newSeat]);
      toast.success(`Seat ${newSeat.seat_id} added`);
    }

    setIsDrawing(false);
    setCurrentSeat(null);
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    seatPositions.forEach((seat) => {
      ctx.strokeStyle = seat.is_occupied ? '#10B981' : '#3B82F6';
      ctx.lineWidth = 4;
      ctx.strokeRect(seat.x, seat.y, seat.width, seat.height);
      ctx.fillStyle = seat.is_occupied ? '#10B981' : '#3B82F6';
      ctx.font = '14px Arial';
      ctx.fillText(`S${seat.seat_id}`, seat.x + 5, seat.y + 20);
    });

    if (isDrawing && currentSeat) {
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 5;
      ctx.setLineDash([10, 10]);
      ctx.strokeRect(
        currentSeat.x || 5,
        currentSeat.y || 5,
        currentSeat.width || 5,
        currentSeat.height || 5
      );
      ctx.setLineDash([]);
    }
  };

  useEffect(() => {
    if (isLabeling) {
      const interval = setInterval(drawCanvas, 100);
      return () => clearInterval(interval);
    }
  }, [isLabeling, seatPositions, currentSeat, isDrawing]);

  const saveLabelingSession = async () => {
    if (!sessionName || !className || seatPositions.length === 0 || !selectedModelPath) {
      toast.error('Please fill all fields, select a model, and add at least one seat position');
      return;
    }

    try {
      const sessionData = {
        session_name: sessionName,
        class_name: className,
        total_seats: totalSeats,
        seat_positions: seatPositions,
        camera_settings: {
          device_id: selectedCamera,
          resolution: '1920x1080',
          frame_rate: 30
        },
        selected_model_path: selectedModelPath
      };

      await axios.post('/api/labelling-session', sessionData);
      toast.success('Labeling session saved successfully');
      fetchLabelingSessions();
      
      // Reset form
      setSessionName('');
      setClassName('');
      setSeatPositions([]);
    } catch (error) {
      toast.error('Failed to save labeling session');
      console.error('Save error:', error);
    }
  };

  const clearAllSeats = () => {
    setSeatPositions([]);
    toast.success('All seats cleared');
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
          student_id: null
        });
        seatId++;
      }
    }

    setSeatPositions(newSeats);
    toast.success(`Generated ${newSeats.length} seat positions`);
  };

  const syncCanvasSize = () => {
  const video = videoRef.current;
  const canvas = canvasRef.current;

  if (video && canvas) {
    const rect = video.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
};

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-xl p-6 text-white"
      >
        <h1 className="text-2xl font-bold flex items-center">
          <Target className="h-8 w-8 mr-3" />
          Student Position Labeling
        </h1>
        <p className="mt-2 opacity-90">Set up seat positions and configure student tracking</p>
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
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter session name"
              />
            </div>

            <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Detection Model</label>
  <div className="flex gap-2">
    <select
      value={selectedModelPath}
      onChange={(e) => setSelectedModelPath(e.target.value)}
      className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    >
      {models.map((model) => (
        <option key={model.path} value={model.path}>
          {model.name}
        </option>
      ))}
    </select>
    <button
      type="button"
      className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md shadow-sm hover:from-indigo-600 hover:to-purple-700 transition"
      onClick={() => toast('Add Model feature coming soon!')}
      title="Add new model"
    >
      <Save className="h-4 w-4 mr-1" />
      Add
    </button>
  </div>
</div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class Name</label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter class name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Seats</label>
              <input
                type="number"
                min="1"
                max="50"
                value={totalSeats}
                onChange={(e) => setTotalSeats(parseInt(e.target.value))}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Camera Device</label>
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {cameras.map((camera) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              {!isLabeling ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startCamera}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Start Camera
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={stopCamera}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Camera
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateGridSeats}
                className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium"
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Generate Grid
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={clearAllSeats}
                className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-medium"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveLabelingSession}
                className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Session
              </motion.button>
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
            Camera Feed & Labeling
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
              width={1920}
              height={1080}
              className="absolute inset-0 w-full h-full cursor-crosshair"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              style={{ display: isLabeling ? 'block' : 'none' }}
            />
            
            {!cameraStream && (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <Camera className="h-12 w-12 mx-auto mb-2" />
                  <p>Camera not active</p>
                  <p className="text-sm">Start camera to begin labeling</p>
                </div>
              </div>
            )}
          </div>

          {isLabeling && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Click and drag to create seat bounding boxes</li>
                <li>• Each box represents a student seat position</li>
                <li>• Blue boxes: Empty seats, Green boxes: Occupied seats</li>
                <li>• Total seats defined: {seatPositions.length}/{totalSeats}</li>
              </ul>
            </div>
          )}
        </motion.div>

        {/* Seat Management */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Seat Positions ({seatPositions.length})
          </h3>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {seatPositions.map((seat) => (
              <div key={seat.seat_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    seat.is_occupied ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Seat {seat.seat_id}</p>
                    <p className="text-xs text-gray-500">
                      {Math.round(seat.x)}, {Math.round(seat.y)} ({Math.round(seat.width)}×{Math.round(seat.height)})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSeatPositions(seatPositions.filter(s => s.seat_id !== seat.seat_id))}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {seatPositions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No seats defined yet</p>
              <p className="text-xs">Start labeling or generate grid</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Saved Sessions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Saved Labeling Sessions</h3>
        </div>
        <div className="p-6">
          {labelingSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {labelingSessions.map((session: any) => (
                <div key={session._id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">{session.session_name}</h4>
                  <p className="text-sm text-gray-500">{session.class_name}</p>
                  <p className="text-sm text-gray-500">{session.seat_positions.length} seats</p>
                  <p className="text-xs text-gray-400">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-8 w-8 mx-auto mb-2" />
              <p>No labeling sessions saved yet</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}