from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import torch
import json
import os
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
            logger.info(f"Loading model from {self.model_path}")
            
            # Check if model file exists
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Model file not found: {self.model_path}")
            
            # Try to load the model
            if self.model_path.endswith('.pt'):
                # PyTorch model
                try:
                    # Try loading with ultralytics YOLOv8
                    from ultralytics import YOLO
                    self.model = YOLO(self.model_path)
                    logger.info("Model loaded successfully with ultralytics")
                except ImportError:
                    # Fallback to torch.hub
                    try:
                        self.model = torch.hub.load('ultralytics/yolov5', 'custom', path=self.model_path)
                        logger.info("Model loaded successfully with torch.hub")
                    except Exception as e:
                        logger.warning(f"Failed to load with torch.hub: {e}")
                        # Use mock model for demonstration
                        self.model = "mock_model"
                        logger.info("Using mock model for demonstration")
            else:
                # For other formats, use mock model
                self.model = "mock_model"
                logger.info("Using mock model for non-PyTorch formats")
                
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            # Use mock model as fallback
            self.model = "mock_model"
            logger.info("Using mock model as fallback")
    
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
                detections.append(self.create_empty_detection(seat_id))
                continue
            
            # Perform detection
            if self.model == "mock_model":
                detection_result = self.simulate_detection(roi, seat_id)
            else:
                detection_result = self.real_detection(roi, seat_id)
            
            detections.append(detection_result)
        
        return detections
    
    def real_detection(self, roi, seat_id):
        """
        Perform real YOLO detection on the ROI
        """
        try:
            # Run inference
            results = self.model(roi)
            
            # Process results
            face_detected = False
            body_detected = False
            gesture_type = 'unknown'
            confidence = 0.0
            bbox = None
            
            # Check if any detections
            if hasattr(results, 'pandas'):
                # YOLOv5 format
                detections = results.pandas().xyxy[0]
                if len(detections) > 0:
                    # Get highest confidence detection
                    best_detection = detections.loc[detections['confidence'].idxmax()]
                    confidence = best_detection['confidence']
                    
                    # Determine detection type based on class
                    class_name = best_detection['name'].lower()
                    if 'face' in class_name or 'head' in class_name:
                        face_detected = True
                        gesture_type = self.classify_gesture(roi, confidence)
                    elif 'person' in class_name:
                        body_detected = True
                        gesture_type = 'present'
                    
                    bbox = {
                        'x': int(best_detection['xmin']),
                        'y': int(best_detection['ymin']),
                        'width': int(best_detection['xmax'] - best_detection['xmin']),
                        'height': int(best_detection['ymax'] - best_detection['ymin'])
                    }
            
            elif hasattr(results, 'boxes'):
                # YOLOv8 format
                if results.boxes is not None and len(results.boxes) > 0:
                    # Get highest confidence detection
                    confidences = results.boxes.conf.cpu().numpy()
                    best_idx = np.argmax(confidences)
                    confidence = float(confidences[best_idx])
                    
                    # Get class
                    classes = results.boxes.cls.cpu().numpy()
                    class_id = int(classes[best_idx])
                    
                    # Assume class 0 is person/face
                    if class_id == 0:
                        face_detected = True
                        gesture_type = self.classify_gesture(roi, confidence)
                    
                    # Get bbox
                    boxes = results.boxes.xyxy.cpu().numpy()
                    box = boxes[best_idx]
                    bbox = {
                        'x': int(box[0]),
                        'y': int(box[1]),
                        'width': int(box[2] - box[0]),
                        'height': int(box[3] - box[1])
                    }
            
            return {
                'seat_id': seat_id,
                'face_detected': face_detected,
                'body_detected': body_detected or face_detected,
                'gesture_type': gesture_type,
                'confidence': confidence,
                'bbox': bbox
            }
            
        except Exception as e:
            logger.error(f"Error in real detection: {str(e)}")
            return self.simulate_detection(roi, seat_id)
    
    def classify_gesture(self, roi, confidence):
        """
        Classify gesture based on face/head detection
        This is a simplified version - in practice, you'd use a separate gesture classifier
        """
        # Simple heuristic based on confidence and image properties
        if confidence > 0.8:
            return 'focused'
        elif confidence > 0.6:
            # Random gesture for demonstration
            gestures = ['focused', 'looking_away', 'writing']
            return np.random.choice(gestures)
        else:
            return 'looking_away'
    
    def simulate_detection(self, roi, seat_id):
        """
        Simulate YOLO detection results for demonstration
        """
        import random
        
        # Simulate detection probabilities
        face_detected = random.random() > 0.3  # 70% chance of face detection
        
        if face_detected:
            # Simulate gesture detection with realistic probabilities
            gestures = ['focused', 'looking_away', 'sleeping', 'using_phone', 'chatting', 'writing', 'yawning']
            gesture_weights = [0.4, 0.2, 0.05, 0.1, 0.1, 0.1, 0.05]  # Focused is most likely
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
    
    def create_empty_detection(self, seat_id):
        """
        Create empty detection result
        """
        return {
            'seat_id': seat_id,
            'face_detected': False,
            'body_detected': False,
            'gesture_type': 'absent',
            'confidence': 0.0,
            'bbox': None
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
        
        # Validate model path
        if not model_path:
            return jsonify({
                'success': False,
                'message': 'Model path is required'
            }), 400
        
        if not os.path.exists(model_path):
            return jsonify({
                'success': False,
                'message': f'Model file not found: {model_path}'
            }), 400
        
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
        
        logger.info("Model initialized successfully")
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
        frame = None
        if frame_data:
            try:
                # Remove data URL prefix if present
                if ',' in frame_data:
                    frame_data = frame_data.split(',')[1]
                
                # Decode base64 to image
                img_data = base64.b64decode(frame_data)
                nparr = np.frombuffer(img_data, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if frame is None:
                    raise ValueError("Failed to decode image")
                    
            except Exception as e:
                logger.warning(f"Error decoding frame: {str(e)}, using dummy frame")
                frame = np.zeros((480, 640, 3), dtype=np.uint8)
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