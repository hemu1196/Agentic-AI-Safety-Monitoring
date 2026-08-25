from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
import time
import warnings
warnings.filterwarnings('ignore')

from utils import load_dataset, load_model_bundle, predict_single_sample, get_risk_level_info

# Load ML model bundle
model_bundle = load_model_bundle()

# Unreal Engine State Store
unreal_state_store = {
    "site_overview": {
        "workers": 43,
        "active_hazards": 7,
        "compliance_pct": 87.0,
        "site_risk": 72.0,
        "insurance_risk": 69.0,
        "drone_status": "PATROLLING"
    },
    "zones": {
        "ZONE_A_ENTRANCE": {"name": "Site Entrance Gate", "risk": 20.0, "risk_level": "LOW", "status": "ACTIVE", "color": "#10b981"},
        "ZONE_B_BUILDING": {"name": "Main Construction Building", "risk": 45.0, "risk_level": "MEDIUM", "status": "ACTIVE", "color": "#f59e0b"},
        "ZONE_C_CRANE": {"name": "Tower Crane Operations", "risk": 75.0, "risk_level": "HIGH", "status": "ACTIVE", "color": "#f97316"},
        "ZONE_D_EXCAVATION": {"name": "Deep Trench Excavation", "risk": 92.0, "risk_level": "CRITICAL", "status": "RESTRICTED", "color": "#ef4444"},
        "ZONE_E_STORAGE": {"name": "Material Storage Area", "risk": 38.0, "risk_level": "MEDIUM", "status": "ACTIVE", "color": "#f59e0b"},
        "ZONE_F_EQUIPMENT": {"name": "Heavy Machinery Yard", "risk": 68.0, "risk_level": "HIGH", "status": "ACTIVE", "color": "#f97316"},
        "ZONE_G_RESTRICTED": {"name": "High Voltage Hazard Zone", "risk": 88.0, "risk_level": "CRITICAL", "status": "RESTRICTED", "color": "#ef4444"}
    },
    "workers": {
        "W018": {
            "worker_id": "W018",
            "role": "Labourer",
            "zone": "ZONE_C_CRANE",
            "helmet": False,
            "vest": True,
            "harness": False,
            "risk_level": 3,
            "violations": 4,
            "action_status": "OPEN"
        },
        "W001": {
            "worker_id": "W001",
            "role": "Electrician",
            "zone": "ZONE_A_ENTRANCE",
            "helmet": True,
            "vest": True,
            "harness": True,
            "risk_level": 0,
            "violations": 0,
            "action_status": "VERIFIED"
        }
    },
    "drone": {
        "drone_id": "DRONE-01",
        "zone": "ZONE_C_CRANE",
        "altitude": 32.0,
        "speed": 4.2,
        "battery": 82.0,
        "status": "PATROLLING"
    },
    "events": [
        {"timestamp": "14:32:11", "severity": "RED ALERT", "message": "Worker W018 Helmet missing in Crane Zone"},
        {"timestamp": "14:31:02", "severity": "WARNING", "message": "Crane inspection expires in 5 days"},
        {"timestamp": "14:29:47", "severity": "INFO", "message": "Drone entered Zone D Excavation"},
        {"timestamp": "14:27:31", "severity": "HIGH RISK", "message": "Restricted-zone entry detected"}
    ]
}

class ConstructionAPIHandler(BaseHTTPRequestHandler):
    
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
        clean_path = self.path.split('?')[0].rstrip('/')
        if clean_path in ['', '/api', '/index.html']:
            self._set_headers(200)
            res = {
                "service": "Agentic AI Safety Monitoring & Construction Risk Analytics API",
                "version": "2.0.0",
                "status": "online",
                "available_endpoints": {
                    "health_check": "GET /health",
                    "unreal_site_state": "GET /api/v1/unreal/site-state",
                    "risk_predictor": "POST /predict",
                    "unreal_simulate_event": "POST /api/v1/unreal/simulate-event"
                }
            }
            self.wfile.write(json.dumps(res, indent=2).encode('utf-8'))
        elif clean_path == '/health':
            self._set_headers(200)
            res = {
                "status": "online",
                "service": "Agentic AI Safety Monitoring API",
                "model_loaded": model_bundle is not None
            }
            self.wfile.write(json.dumps(res).encode('utf-8'))
        elif clean_path == '/api/v1/unreal/site-state':
            self._set_headers(200)
            res = {
                "status": "success",
                "timestamp": time.strftime("%H:%M:%S"),
                "site_overview": unreal_state_store["site_overview"],
                "zones": unreal_state_store["zones"],
                "workers": list(unreal_state_store["workers"].values()),
                "drone": unreal_state_store["drone"],
                "events": unreal_state_store["events"]
            }
            self.wfile.write(json.dumps(res, indent=2).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({
                "error": "Endpoint not found",
                "path_requested": self.path,
                "hint": "Try GET /health or GET /api/v1/unreal/site-state"
            }).encode('utf-8'))

    def do_POST(self):
        clean_path = self.path.split('?')[0].rstrip('/')
        if clean_path == '/predict':
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
                self.wfile.write(json.dumps(response, indent=2).encode('utf-8'))

            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        elif clean_path == '/api/v1/unreal/simulate-event':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode('utf-8')) if post_data else {}
                event_type = data.get("event_type", "PPE_VIOLATION")
                worker_id = data.get("worker_id", "W018")
                zone = data.get("zone", "ZONE_C_CRANE")

                if event_type == "PPE_VIOLATION":
                    unreal_state_store["workers"][worker_id] = {
                        "worker_id": worker_id,
                        "role": "Labourer",
                        "zone": zone,
                        "helmet": False,
                        "vest": True,
                        "harness": False,
                        "risk_level": 3,
                        "violations": 5,
                        "action_status": "OPEN"
                    }
                    unreal_state_store["zones"][zone]["risk"] = 95.0
                    unreal_state_store["zones"][zone]["risk_level"] = "CRITICAL"
                    unreal_state_store["zones"][zone]["color"] = "#ef4444"
                    unreal_state_store["site_overview"]["compliance_pct"] = 79.0
                    unreal_state_store["site_overview"]["site_risk"] = 86.0
                    unreal_state_store["site_overview"]["insurance_risk"] = 84.0

                    unreal_state_store["events"].insert(0, {
                        "timestamp": time.strftime("%H:%M:%S"),
                        "severity": "RED ALERT",
                        "message": f"Worker {worker_id} Helmet missing in {zone}!"
                    })

                elif event_type == "RESOLVE_VIOLATION":
                    if worker_id in unreal_state_store["workers"]:
                        unreal_state_store["workers"][worker_id]["helmet"] = True
                        unreal_state_store["workers"][worker_id]["risk_level"] = 0
                        unreal_state_store["workers"][worker_id]["action_status"] = "VERIFIED"

                    unreal_state_store["zones"][zone]["risk"] = 35.0
                    unreal_state_store["zones"][zone]["risk_level"] = "MEDIUM"
                    unreal_state_store["zones"][zone]["color"] = "#f59e0b"
                    unreal_state_store["site_overview"]["compliance_pct"] = 92.0
                    unreal_state_store["site_overview"]["site_risk"] = 42.0
                    unreal_state_store["site_overview"]["insurance_risk"] = 38.0

                    unreal_state_store["events"].insert(0, {
                        "timestamp": time.strftime("%H:%M:%S"),
                        "severity": "VERIFIED",
                        "message": f"Worker {worker_id} PPE violation resolved & verified!"
                    })

                self._set_headers(200)
                self.wfile.write(json.dumps({"status": "success", "event": event_type, "worker": worker_id}, indent=2).encode('utf-8'))
            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found", "path_requested": self.path}).encode('utf-8'))

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, ConstructionAPIHandler)
    print(f"🚀 Agentic AI Safety Monitoring & Unreal Engine REST API Server running on http://localhost:{port}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping API server...")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
