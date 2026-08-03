using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;

namespace ConstructionIntelligence
{
    [System.Serializable]
    public class TelemetryRequest
    {
        public float temperature = 32.0f;
        public float humidity = 70.0f;
        public float vibration_level = 45.0f;
        public float material_usage = 180.0f;
        public int machinery_status = 1;
        public int worker_count = 12;
        public float energy_consumption = 410.0f;
        public float task_progress = 0.45f;
        public float cost_deviation = 2500.0f;
        public float time_deviation = 5.0f;
        public int safety_incidents = 1;
        public float equipment_utilization_rate = 75.0f;
        public int material_shortage_alert = 0;
    }

    [System.Serializable]
    public class UnityVisualTriggers
    {
        public string warning_lights;
        public bool alarm_siren;
        public bool machinery_active;
        public bool material_shortage_alert;
        public int worker_count;
    }

    [System.Serializable]
    public class TelemetryResponse
    {
        public float predicted_risk_score;
        public string risk_level;
        public string hex_color;
        public string description;
        public string action;
        public UnityVisualTriggers unity_visual_triggers;
    }

    public class UnityTelemetryClient : MonoBehaviour
    {
        [Header("API Configuration")]
        public string apiUrl = "http://localhost:8000/predict";
        public float pollIntervalSeconds = 2.0f;

        [Header("3D Scene Visuals")]
        public Light siteWarningLight;
        public GameObject alarmSirenObject;
        public GameObject craneObject;
        public GameObject materialShortageBox;
        public Text riskScoreTextUI;

        public TelemetryRequest currentTelemetry = new TelemetryRequest();

        private void Start()
        {
            StartCoroutine(PollTelemetryRoutine());
        }

        private IEnumerator PollTelemetryRoutine()
        {
            while (true)
            {
                yield return SendTelemetryToPython(currentTelemetry);
                yield return new WaitForSeconds(pollIntervalSeconds);
            }
        }

        public IEnumerator SendTelemetryToPython(TelemetryRequest data)
        {
            string jsonBody = JsonUtility.ToJson(data);
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonBody);

            UnityWebRequest request = new UnityWebRequest(apiUrl, "POST");
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");

            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                string jsonResult = request.downloadHandler.text;
                TelemetryResponse response = JsonUtility.FromJson<TelemetryResponse>(jsonResult);

                UpdateUnityScene(response);
            }
            else
            {
                Debug.LogWarning("Telemetry API Error: " + request.error);
            }
        }

        private void UpdateUnityScene(TelemetryResponse res)
        {
            // 1. Update UI Text
            if (riskScoreTextUI != null)
            {
                riskScoreTextUI.text = $"Risk Score: {res.predicted_risk_score:F1} ({res.risk_level})";
            }

            // 2. Control Warning Lights
            if (siteWarningLight != null)
            {
                if (res.unity_visual_triggers.warning_lights == "red_flashing")
                {
                    siteWarningLight.color = Color.red;
                    siteWarningLight.intensity = Mathf.PingPong(Time.time * 4, 3.0f);
                }
                else if (res.unity_visual_triggers.warning_lights == "yellow_warning")
                {
                    siteWarningLight.color = Color.yellow;
                    siteWarningLight.intensity = 1.5f;
                }
                else
                {
                    siteWarningLight.color = Color.green;
                    siteWarningLight.intensity = 0.5f;
                }
            }

            // 3. Siren Alarm State
            if (alarmSirenObject != null)
            {
                alarmSirenObject.SetActive(res.unity_visual_triggers.alarm_siren);
            }

            // 4. Material Shortage Visual Highlight
            if (materialShortageBox != null)
            {
                materialShortageBox.SetActive(res.unity_visual_triggers.material_shortage_alert);
            }

            Debug.Log($"[Unity Digital Twin] Risk Score: {res.predicted_risk_score} | Level: {res.risk_level}");
        }
    }
}
