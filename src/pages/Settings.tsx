import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Settings as SettingsIcon, 
  Camera, 
  Database, 
  Brain, 
  Upload, 
  Check, 
  X,
  Save,
  TestTube,
  Zap,
  Shield,
  Clock,
  Bell,
  UploadCloud
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface SettingsData {
  // General Settings
  autoDetection: boolean;
  recordingSessions: boolean;
  notifications: boolean;
  dataRetentionDays: number;
  
  // Camera & Detection Settings
  cameraResolution: string;
  frameRate: number;
  detectionThreshold: number;
  
  // Database Configuration
  mongodbUri: string;
  backupInterval: number;
  
  // YOLO Model Configuration
  modelPath: string;
  modelType: string;
  confidenceThreshold: number;
  iouThreshold: number;
  modelStatus: string;
  
  // Live Monitoring Settings
  liveMonitoring: boolean;
  selectedCamera: string;
}

export default function Settings() {
 const { user } = useAuth();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingModel, setTestingModel] = useState(false);
  const [uploadingModel, setUploadingModel] = useState(false);
  const [savingModelToDb, setSavingModelToDb] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      await axios.put('/settings', settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const testModel = async () => {
    setTestingModel(true);
    try {
      const response = await axios.post('/settings/test-model');
      toast.success(response.data.message);
      if (settings) {
        setSettings({ ...settings, modelStatus: response.data.status });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Model test failed');
    } finally {
      setTestingModel(false);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadingModel(true);
    const formData = new FormData();
    formData.append('model', file);

    try {
      const response = await axios.post('/settings/upload-model', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success(response.data.message);
      if (settings) {
        setSettings({
          ...settings,
          modelPath: response.data.modelPath,
          modelType: response.data.modelType,
          modelStatus: 'active'
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload model');
    } finally {
      setUploadingModel(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/octet-stream': ['.pt'],
      'application/x-onnx': ['.onnx'],
      'application/x-protobuf': ['.pb']
    },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024 // 500MB
  });

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-500">You need admin privileges to access settings.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!settings) return null;

  function saveModelToDatabase(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <SettingsIcon className="h-8 w-8 mr-3" />
              System Settings
            </h1>
            <p className="mt-2 opacity-90">Configure system behavior and model parameters</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg font-medium hover:bg-opacity-30 transition-all duration-200"
          >
            <Save className="h-5 w-5 mr-2" />
            {saving ? 'Saving...' : 'Save All'}
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <SettingsIcon className="h-5 w-5 mr-2 text-blue-600" />
            General Settings
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <label className="text-sm font-medium text-gray-900">Auto Detection</label>
                  <p className="text-xs text-gray-500">Automatically start focus detection</p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setSettings({ ...settings, autoDetection: !settings.autoDetection })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoDetection ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoDetection ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </motion.button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Camera className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <label className="text-sm font-medium text-gray-900">Recording Sessions</label>
                  <p className="text-xs text-gray-500">Record session data automatically</p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setSettings({ ...settings, recordingSessions: !settings.recordingSessions })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.recordingSessions ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.recordingSessions ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </motion.button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-orange-600 mr-3" />
                <div>
                  <label className="text-sm font-medium text-gray-900">Notifications</label>
                  <p className="text-xs text-gray-500">Enable system notifications</p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </motion.button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center">
                <Clock className="h-4 w-4 text-red-600 mr-2" />
                Data Retention (days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={settings.dataRetentionDays}
                onChange={(e) => setSettings({ ...settings, dataRetentionDays: parseInt(e.target.value) })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
    </motion.div>

    {/* Camera & Detection Settings */}
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Camera className="h-5 w-5 mr-2 text-green-600" />
            Camera & Detection Settings
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Camera Resolution</label>
              <select
                value={settings?.cameraResolution ?? ''}
                onChange={(e) => settings && setSettings({ ...settings, cameraResolution: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="1920x1080">1920x1080 (Full HD)</option>
                <option value="1280x720">1280x720 (HD)</option>
                <option value="640x480">640x480 (SD)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Frame Rate (FPS)</label>
              <input
                type="number"
                min="15"
                max="60"
                value={settings?.frameRate ?? ''}
                onChange={(e) => settings && setSettings({ ...settings, frameRate: parseInt(e.target.value) })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Detection Threshold (%)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={settings && settings.detectionThreshold != null ? settings.detectionThreshold * 100 : 0}
                  onChange={(e) => settings && setSettings({ ...settings, detectionThreshold: parseInt(e.target.value) / 100 })}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-900 w-12">
                  {settings ? Math.round(settings.detectionThreshold * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Database Configuration */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Database className="h-5 w-5 mr-2 text-blue-600" />
            Database Configuration
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">MongoDB Connection URI</label>
              <input
                type="text"
                value={settings.mongodbUri}
                onChange={(e) => setSettings({ ...settings, mongodbUri: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="mongodb+srv://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Backup Interval (hours)</label>
              <input
                type="number"
                min="1"
                max="168"
                value={settings.backupInterval}
                onChange={(e) => setSettings({ ...settings, backupInterval: parseInt(e.target.value) })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </motion.div>

        {/* YOLO Model Configuration */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-600" />
            YOLO Model Configuration
          </h3>
          
          <div className="space-y-6">
            {/* Model Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Upload YOLO Model</label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                {uploadingModel ? (
                  <p className="text-sm text-blue-600">Uploading...</p>
                ) : isDragActive ? (
                  <p className="text-sm text-blue-600">Drop the model file here...</p>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600">Drag & drop a model file here, or click to select</p>
                    <p className="text-xs text-gray-500 mt-1">Supported: .pt (PyTorch), .onnx (ONNX), .pb (TensorFlow)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Model Parameters */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Confidence Threshold</label>
                <input
                  type="number"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={settings.confidenceThreshold}
                  onChange={(e) => setSettings({ ...settings, confidenceThreshold: parseFloat(e.target.value) })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum confidence for detections (0.1 - 1.0)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">IoU Threshold</label>
                <input
                  type="number"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={settings.iouThreshold}
                  onChange={(e) => setSettings({ ...settings, iouThreshold: parseFloat(e.target.value) })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Intersection over Union threshold (0.1 - 1.0)</p>
            </div>
          </div>
          {/* Model Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                settings.modelStatus === 'active' ? 'bg-green-500' :
                settings.modelStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
              }`}></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Model Status</p>
                <p className="text-xs text-gray-500 capitalize">{settings.modelStatus}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={testModel}
              disabled={testingModel || !settings.modelPath}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TestTube className="h-4 w-4 mr-2" />
              {testingModel ? 'Testing...' : 'Test Model'}
            </motion.button>
          </div>
          <div className="text-right mt-4">
            <button
              onClick={async () => {
                if (!settings?.modelPath || !settings?.modelType) return;
                setSavingModelToDb(true);
                try {
                  const response = await axios.post('/settings/save-model', {
                    path: settings.modelPath,
                    type: settings.modelType
                  });
                  toast.success(response.data.message || 'Model saved to database');
                  fetchSettings();
                } catch (error: any) {
                  toast.error(error.response?.data?.message || 'Failed to save model to database');
                } finally {
                  setSavingModelToDb(false);
                }
              }}
              disabled={savingModelToDb || !settings || !settings.modelPath}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4 mr-2" />
              {savingModelToDb ? 'Saving...' : 'Save Model to Database'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
  );
}