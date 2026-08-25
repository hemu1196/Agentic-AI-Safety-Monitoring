# Milestone 1: Construction Site Environment & Site Zones

## 1. Environment & Site Features
The 3D Construction Site Digital Twin models a realistic medium-sized construction project environment featuring:

1. **Main Construction Building** (Concrete/Steel frame)
2. **Steel Structure Framework**
3. **Tower Crane** (Zone C)
4. **Excavator & Trench** (Zone D)
5. **Construction Trucks & Haulers**
6. **Material Storage Area** (Rebar & Steel, Zone E)
7. **Worker Rest Area & Facilities**
8. **Excavation Danger Zone** (Zone D)
9. **Restricted Zone** (High Voltage, Zone G)
10. **Site Entrance Gate** (Zone A)
11. **Safety Barriers & Fencing**
12. **OSHA Warning Signs**
13. **Emergency Assembly Point**
14. **Safety Equipment Depot**
15. **Temporary Site Office**
16. **Pedestrian Walkways**
17. **Vehicle Haul Roads**

---

## 2. Designated Site Zones

| Zone ID | Display Name | Risk Level | Initial Risk Score | Status | Color Code |
|---|---|---|---|---|---|
| `ZONE_A_ENTRANCE` | Site Entrance Gate | Low | 20.0 | ACTIVE | `#10b981` (Green) |
| `ZONE_B_BUILDING` | Main Construction Building | Medium | 45.0 | ACTIVE | `#f59e0b` (Yellow) |
| `ZONE_C_CRANE` | Tower Crane Operations | High | 75.0 | ACTIVE | `#f97316` (Orange) |
| `ZONE_D_EXCAVATION` | Deep Trench Excavation | Critical | 92.0 | RESTRICTED | `#ef4444` (Red) |
| `ZONE_E_STORAGE` | Material Storage Area | Medium | 38.0 | ACTIVE | `#f59e0b` (Yellow) |
| `ZONE_F_EQUIPMENT` | Heavy Machinery Yard | High | 68.0 | ACTIVE | `#f97316` (Orange) |
| `ZONE_G_RESTRICTED` | High Voltage Hazard Zone | Critical | 88.0 | RESTRICTED | `#ef4444` (Red) |
