# Demonstration Scenario: Agentic AI Construction Safety Simulation

Follow this step-by-step 17-stage demonstration scenario to present the system:

1. **Launch Unreal Engine 5.x**: Open `ConstructionIntelligenceTwin.uproject` or launch the standalone simulation build.
2. **Display Construction Site Overview**: Pan across the 3D construction site showing the main building, crane, excavator, material yard, and 7 site zones.
3. **Inspection Drone Patrol**: Inspection Drone `DRONE-01` begins autonomous patrol along waypoints (`BASE` -> `ZONE_A` -> `ZONE_B` -> `ZONE_C` -> `ZONE_D` -> `ZONE_E` -> `BASE`).
4. **Initial Baseline Dashboard Status**:
   - **Compliance**: `91%`
   - **Site Risk Score**: `42` (Medium)
   - **Insurance Risk Score**: `38` (Medium)
5. **Trigger Simulation Action**: Press key `P` or click `[SIMULATE PPE VIOLATION]` on HUD.
6. **Worker W018 Status Change**: Worker `W018` loses hardhat (`Helmet = FALSE`).
7. **Worker 3D Indicator Visual Change**: Worker `W018` floating HUD and 3D indicator turn **RED** (`HIGH RISK / WEAR HELMET!`).
8. **Crane Zone Risk Spike**: Zone C (`Crane Zone`) risk score increases from 75 to **95** (`CRITICAL`). Zone C 3D heatmap material turns **GLOWING RED**.
9. **Real-Time Event Panel Notification**:
   ```
   [14:32:11] RED ALERT: Worker W018 Helmet missing in Crane Zone
   ```
10. **Site Compliance Decrease**: Overall site compliance drops from 91% to **79%**.
11. **Insurance Risk Increase**: Overall Insurance Risk increases from 38 to **84** (`HIGH`).
12. **Agentic AI Recommendation Generation**:
    ```
    AI SAFETY AGENT: Immediate PPE correction recommended.
    Worker W018 has repeated violations in a high-risk crane zone.
    Action: Block entry gate, sound audio alert siren, dispatch supervisor.
    ```
13. **Trigger Corrective Action Resolution**: Press key `R` or click `[RESOLVE VIOLATION]` on HUD.
14. **Worker Helmet Restored**: Worker `W018` equips hardhat (`Helmet = TRUE`).
15. **Event Verification**: Incident status changes from `OPEN` to **`VERIFIED`**.
16. **Risk Recalculation**: Zone C risk score decreases to **35** (`MEDIUM`), 3D material returns to Amber/Green.
17. **Final Dashboard Improvement**: Compliance returns to **92%**, Site Risk improves to **42**, demonstrating the complete closed-loop workflow:

```
DETECTION -> COMPLIANCE -> RISK -> INCIDENT -> CORRECTIVE ACTION -> VERIFICATION -> RISK IMPROVEMENT
```
