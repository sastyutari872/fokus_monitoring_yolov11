from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import torch
import json
from datetime import datetime
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for model
current_model = None
model_config = {}

class YOLODetector:
    def __init__(self, model_path, confidence_threshold=0.5, iou_threshold=0.4):
        self.model_path = model_path
        self.confidence_threshold = confidence_threshold
        self.iou_threshold = iou_threshold
        self.model = None
        self.load_model()
    
    def load_model(self):
        try:
            # Load YOLO model (assuming YOLOv8 or similar)
            # This is a placeholder - replace with actual model loading
            logger.info(f"Loading model from {self.model_path}")
            # self.model = torch.hub.load('ultralytics/yolov8', 'custom', path=self.model_path)
            # For simulation, we'll use a mock model
            self.model = "mock_model"
            logger.info("Model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise e
    
    def detect_in_seats(self, frame, seat_positions):
        """
        Detect faces/heads within seat bounding boxes
        Returns detection results for each seat
        """
        detections = []
        
        for seat in seat_positions:
            seat_id = seat['seat_id']
            x, y, w, h = seat['x'], seat['y'], seat['width'], seat['height']
            
            # Extract ROI (Region of Interest) for this seat
            roi = frame[int(y):int(y+h), int(x):int(x+w)]
            
            if roi.size == 0:
                continue
            
            # Simulate detection (replace with actual YOLO inference)
            detection_result = self.simulate_detection(roi, seat_id)
            detections.append(detection_result)
        
        return detections
    
    def simulate_detection(self, roi, seat_id):
        """
        Simulate YOLO detection results
        In production, this would be replaced with actual model inference
        """
        import random
        
        # Simulate detection probabilities
        face_detected = random.random() > 0.3  # 70% chance of face detection
        
        if face_detected:
            # Simulate gesture detection
            gestures = ['focused', 'looking_away', 'sleeping', 'using_phone', 'chatting', 'writing']
            gesture_weights = [0.4, 0.2, 0.1, 0.1, 0.1, 0.1]  # Focused is most likely
            gesture_type = random.choices(gestures, weights=gesture_weights)[0]
            confidence = random.uniform(0.6, 0.95)
        else:
            gesture_type = 'absent'
            confidence = 0.0
        
        return {
            'seat_id': seat_id,
            'face_detected': face_detected,
            'body_detected': face_detected,  # Assume body detected if face detected
            'gesture_type': gesture_type,
            'confidence': confidence,
            'bbox': {
                'x': random.randint(0, 50),
                'y': random.randint(0, 50),
                'width': random.randint(30, 80),
                'height': random.randint(40, 100)
            } if face_detected else None
        }

@app.route('/api/initialize-model', methods=['POST'])
def initialize_model():
    global current_model, model_config
    
    try:
        data = request.get_json()
        model_path = data.get('model_path')
        model_type = data.get('model_type', 'pytorch')
        confidence_threshold = data.get('confidence_threshold', 0.5)
        iou_threshold = data.get('iou_threshold', 0.4)
        
        logger.info(f"Initializing model: {model_path}")
        
        # Initialize YOLO detector
        current_model = YOLODetector(
            model_path=model_path,
            confidence_threshold=confidence_threshold,
            iou_threshold=iou_threshold
        )
        
        model_config = {
            'model_path': model_path,
            'model_type': model_type,
            'confidence_threshold': confidence_threshold,
            'iou_threshold': iou_threshold,
            'status': 'active',
            'initialized_at': datetime.now().isoformat()
        }
        
        return jsonify({
            'success': True,
            'message': 'Model initialized successfully',
            'config': model_config
        })
        
    except Exception as e:
        logger.error(f"Error initializing model: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Failed to initialize model: {str(e)}'
        }), 500

@app.route('/api/detect-frame', methods=['POST'])
def detect_frame():
    global current_model
    
    try:
        if current_model is None:
            return jsonify({
                'success': False,
                'message': 'Model not initialized'
            }), 400
        
        data = request.get_json()
        frame_data = data.get('frame_data')
        seat_positions = data.get('seat_positions', [])
        session_id = data.get('session_id')
        
        # Decode base64 frame data
        if frame_data:
            # Remove data URL prefix if present
            if ',' in frame_data:
                frame_data = frame_data.split(',')[1]
            
            # Decode base64 to image
            img_data = base64.b64decode(frame_data)
            nparr = np.frombuffer(img_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        else:
            # For simulation, create a dummy frame
            frame = np.zeros((480, 640, 3), dtype=np.uint8)
        
        # Perform detection within seat bounding boxes
        detections = current_model.detect_in_seats(frame, seat_positions)
        
        # Calculate summary statistics
        total_seats = len(seat_positions)
        occupied_seats = sum(1 for d in detections if d['face_detected'])
        focused_count = sum(1 for d in detections if d['gesture_type'] == 'focused')
        
        # Analyze gestures
        gesture_analysis = analyze_gestures(detections)
        
        summary = {
            'total_seats': total_seats,
            'occupied_seats': occupied_seats,
            'focused_count': focused_count,
            'focus_percentage': (focused_count / total_seats * 100) if total_seats > 0 else 0,
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify({
            'success': True,
            'detections': detections,
            'summary': summary,
            'gesture_analysis': gesture_analysis,
            'session_id': session_id
        })
        
    except Exception as e:
        logger.error(f"Error processing frame: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Failed to process frame: {str(e)}'
        }), 500

@app.route('/api/model-status', methods=['GET'])
def get_model_status():
    global model_config
    
    if current_model is None:
        return jsonify({
            'status': 'inactive',
            'message': 'No model loaded'
        })
    
    return jsonify({
        'status': 'active',
        'config': model_config,
        'message': 'Model is running'
    })

@app.route('/api/stop-model', methods=['POST'])
def stop_model():
    global current_model, model_config
    
    try:
        current_model = None
        model_config = {}
        
        return jsonify({
            'success': True,
            'message': 'Model stopped successfully'
        })
        
    except Exception as e:
        logger.error(f"Error stopping model: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Failed to stop model: {str(e)}'
        }), 500

def analyze_gestures(detections):
    """Analyze gesture distribution from detections"""
    gesture_counts = {}
    
    for detection in detections:
        gesture = detection['gesture_type']
        if gesture in gesture_counts:
            gesture_counts[gesture] += 1
        else:
            gesture_counts[gesture] = 1
    
    total_detections = len(detections)
    
    analysis = []
    for gesture, count in gesture_counts.items():
        analysis.append({
            'gesture_type': gesture,
            'count': count,
            'percentage': (count / total_detections * 100) if total_detections > 0 else 0
        })
    
    return analysis

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': current_model is not None
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)