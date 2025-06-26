import express from 'express';
import axios from 'axios';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Flask server configuration
const FLASK_SERVER_URL = process.env.FLASK_SERVER_URL || 'http://localhost:5001';

// Initialize YOLO model on Flask server
router.post('/initialize-model', auth, async (req, res) => {
  try {
    const { modelPath, modelType, confidenceThreshold, iouThreshold } = req.body;
    
    const response = await axios.post(`${FLASK_SERVER_URL}/api/initialize-model`, {
      model_path: modelPath,
      model_type: modelType,
      confidence_threshold: confidenceThreshold,
      iou_threshold: iouThreshold
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error initializing model:', error);
    res.status(500).json({ 
      message: 'Failed to initialize model on Flask server',
      error: error.response?.data || error.message 
    });
  }
});

// Process frame with YOLO detection
router.post('/detect-frame', auth, async (req, res) => {
  try {
    const { frameData, seatPositions, sessionId } = req.body;
    
    const response = await axios.post(`${FLASK_SERVER_URL}/api/detect-frame`, {
      frame_data: frameData,
      seat_positions: seatPositions,
      session_id: sessionId
    });
    
    // Process detection results
    const detectionResults = response.data;
    
    // Update seat positions with detection results
    const updatedSeats = seatPositions.map(seat => {
      const detection = detectionResults.detections.find(d => d.seat_id === seat.seat_id);
      
      if (detection) {
        return {
          ...seat,
          face_detected: detection.face_detected,
          gesture_type: detection.gesture_type,
          confidence: detection.confidence,
          is_occupied: detection.face_detected || detection.body_detected
        };
      }
      
      return seat;
    });
    
    res.json({
      success: true,
      updated_seats: updatedSeats,
      detection_summary: detectionResults.summary,
      gesture_analysis: detectionResults.gesture_analysis
    });
    
  } catch (error) {
    console.error('Error processing frame:', error);
    res.status(500).json({ 
      message: 'Failed to process frame',
      error: error.response?.data || error.message 
    });
  }
});

// Get model status from Flask server
router.get('/model-status', auth, async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_SERVER_URL}/api/model-status`);
    res.json(response.data);
  } catch (error) {
    console.error('Error getting model status:', error);
    res.status(500).json({ 
      message: 'Failed to get model status',
      error: error.response?.data || error.message 
    });
  }
});

// Stop model on Flask server
router.post('/stop-model', auth, async (req, res) => {
  try {
    const response = await axios.post(`${FLASK_SERVER_URL}/api/stop-model`);
    res.json(response.data);
  } catch (error) {
    console.error('Error stopping model:', error);
    res.status(500).json({ 
      message: 'Failed to stop model',
      error: error.response?.data || error.message 
    });
  }
});

export default router;