from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
import warnings
warnings.filterwarnings('ignore')

from utils import load_dataset, load_model_bundle, predict_single_sample, get_risk_level_info

# Load ML model bundle
model_bundle = load_model_bundle()

class UnityAPIHandler(BaseHTTPRequestHandler):
    
    def _set_headers(self, status_code=200):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        if self.path == '/health':
            self._set_headers(200)
            res = {
                "status": "online",
                "service": "Agentic AI Safety Monitoring API",
                "model_loaded": model_bundle is not None
            }
            self.wfile.write(json.dumps(res).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

    def do_POST(self):
        if self.path == '/predict':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8')) if post_data else {}
                
                telemetry = {
                    "timestamp": data.get("timestamp", "2026-08-11 12:00:00"),
                    "temperature": float(data.get("temperature", 25.0)),
                    "humidity": float(data.get("humidity", 65.0)),
                    "vibration_level": float(data.get("vibration_level", 25.0)),
                    "material_usage": float(data.get("material_usage", 150.0)),
                    "machinery_status": int(data.get("machinery_status", 1)),
                    "worker_count": int(data.get("worker_count", 12)),
                    "energy_consumption": float(data.get("energy_consumption", 380.0)),
                    "task_progress": float(data.get("task_progress", 0.50)),
                    "cost_deviation": float(data.get("cost_deviation", 500.0)),
                    "time_deviation": float(data.get("time_deviation", 0.0)),
                    "safety_incidents": int(data.get("safety_incidents", 0)),
                    "equipment_utilization_rate": float(data.get("equipment_utilization_rate", 85.0)),
                    "material_shortage_alert": int(data.get("material_shortage_alert", 0)),
                    "simulation_deviation": float(data.get("simulation_deviation", 0.5)),
                    "update_frequency": int(data.get("update_frequency", 10)),
                    "optimization_suggestion": data.get("optimization_suggestion", "Optimize Material Usage"),
                    "performance_score": "Excellent"
                }

                risk_score, err = predict_single_sample(telemetry, model_bundle)
                
                if err:
                    self._set_headers(400)
                    self.wfile.write(json.dumps({"error": err}).encode('utf-8'))
                    return

                clean_score = max(0.0, min(100.0, float(risk_score)))
                risk_info = get_risk_level_info(clean_score)

                response = {
                    "predicted_risk_score": round(clean_score, 2),
                    "risk_level": risk_info["level"],
                    "hex_color": risk_info["color"],
                    "description": risk_info["description"],
                    "action": risk_info["action"],
                    "unity_visual_triggers": {
                        "warning_lights": "red_flashing" if clean_score > 75 else ("yellow_warning" if clean_score > 50 else "green_normal"),
                        "alarm_siren": clean_score > 75,
                        "machinery_active": telemetry["machinery_status"] == 1,
                        "material_shortage_alert": telemetry["material_shortage_alert"] == 1,
                        "worker_count": telemetry["worker_count"]
                    }
                }
                
                self._set_headers(200)
                self.wfile.write(json.dumps(response).encode('utf-8'))

            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, UnityAPIHandler)
    print(f"🚀 Agentic AI Safety Monitoring API Server running on http://localhost:{port}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping API server...")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
