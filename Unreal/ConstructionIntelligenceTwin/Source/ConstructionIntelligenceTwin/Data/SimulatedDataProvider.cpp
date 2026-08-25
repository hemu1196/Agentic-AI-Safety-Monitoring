#include "SimulatedDataProvider.h"

USimulatedDataProvider::USimulatedDataProvider()
	: PatrolTimer(0.0f)
	, PatrolWaypointIndex(0)
{
}

void USimulatedDataProvider::InitializeProvider()
{
	// 1. Initialize 7 Construction Zones
	Zones.Empty();
	
	FConstructionZoneData ZoneA;
	ZoneA.ZoneID = TEXT("ZONE_A_ENTRANCE");
	ZoneA.DisplayName = TEXT("Site Entrance Gate");
	ZoneA.RiskLevel = ERiskLevel::Low;
	ZoneA.RiskScore = 20.0f;
	ZoneA.Status = TEXT("ACTIVE");
	ZoneA.ColorMaterial = FLinearColor(0.06f, 0.72f, 0.50f, 1.0f); // Green
	ZoneA.ActiveWorkers = 6;
	ZoneA.ActiveHazards = 0;
	ZoneA.CompliancePct = 96.0f;
	Zones.Add(ZoneA);

	FConstructionZoneData ZoneB;
	ZoneB.ZoneID = TEXT("ZONE_B_BUILDING");
	ZoneB.DisplayName = TEXT("Main Structure / Building");
	ZoneB.RiskLevel = ERiskLevel::Medium;
	ZoneB.RiskScore = 45.0f;
	ZoneB.Status = TEXT("ACTIVE");
	ZoneB.ColorMaterial = FLinearColor(0.95f, 0.75f, 0.15f, 1.0f); // Yellow
	ZoneB.ActiveWorkers = 14;
	ZoneB.ActiveHazards = 1;
	ZoneB.CompliancePct = 89.0f;
	Zones.Add(ZoneB);

	FConstructionZoneData ZoneC;
	ZoneC.ZoneID = TEXT("ZONE_C_CRANE");
	ZoneC.DisplayName = TEXT("Tower Crane Operations Zone");
	ZoneC.RiskLevel = ERiskLevel::High;
	ZoneC.RiskScore = 75.0f;
	ZoneC.Status = TEXT("ACTIVE");
	ZoneC.ColorMaterial = FLinearColor(0.95f, 0.45f, 0.12f, 1.0f); // Orange
	ZoneC.ActiveWorkers = 8;
	ZoneC.ActiveHazards = 3;
	ZoneC.CompliancePct = 81.0f;
	Zones.Add(ZoneC);

	FConstructionZoneData ZoneD;
	ZoneD.ZoneID = TEXT("ZONE_D_EXCAVATION");
	ZoneD.DisplayName = TEXT("Deep Trench Excavation Zone");
	ZoneD.RiskLevel = ERiskLevel::Critical;
	ZoneD.RiskScore = 92.0f;
	ZoneD.Status = TEXT("RESTRICTED");
	ZoneD.ColorMaterial = FLinearColor(0.93f, 0.20f, 0.20f, 1.0f); // Red
	ZoneD.ActiveWorkers = 5;
	ZoneD.ActiveHazards = 4;
	ZoneD.CompliancePct = 74.0f;
	Zones.Add(ZoneD);

	FConstructionZoneData ZoneE;
	ZoneE.ZoneID = TEXT("ZONE_E_STORAGE");
	ZoneE.DisplayName = TEXT("Steel & Rebar Material Storage");
	ZoneE.RiskLevel = ERiskLevel::Medium;
	ZoneE.RiskScore = 38.0f;
	ZoneE.Status = TEXT("ACTIVE");
	ZoneE.ColorMaterial = FLinearColor(0.95f, 0.75f, 0.15f, 1.0f);
	ZoneE.ActiveWorkers = 4;
	ZoneE.ActiveHazards = 0;
	ZoneE.CompliancePct = 92.0f;
	Zones.Add(ZoneE);

	FConstructionZoneData ZoneF;
	ZoneF.ZoneID = TEXT("ZONE_F_EQUIPMENT");
	ZoneF.DisplayName = TEXT("Heavy Machinery Staging");
	ZoneF.RiskLevel = ERiskLevel::High;
	ZoneF.RiskScore = 68.0f;
	ZoneF.Status = TEXT("ACTIVE");
	ZoneF.ColorMaterial = FLinearColor(0.95f, 0.45f, 0.12f, 1.0f);
	ZoneF.ActiveWorkers = 4;
	ZoneF.ActiveHazards = 1;
	ZoneF.CompliancePct = 85.0f;
	Zones.Add(ZoneF);

	FConstructionZoneData ZoneG;
	ZoneG.ZoneID = TEXT("ZONE_G_RESTRICTED");
	ZoneG.DisplayName = TEXT("High Voltage Hazard Area");
	ZoneG.RiskLevel = ERiskLevel::Critical;
	ZoneG.RiskScore = 88.0f;
	ZoneG.Status = TEXT("RESTRICTED");
	ZoneG.ColorMaterial = FLinearColor(0.93f, 0.20f, 0.20f, 1.0f);
	ZoneG.ActiveWorkers = 2;
	ZoneG.ActiveHazards = 2;
	ZoneG.CompliancePct = 78.0f;
	Zones.Add(ZoneG);

	// 2. Initialize Simulated Workers (W001 to W043)
	Workers.Empty();
	for (int32 i = 1; i <= 43; ++i)
	{
		FWorkerData W;
		W.WorkerID = FString::Printf(TEXT("W%03d"), i);
		
		if (i == 18)
		{
			W.Role = TEXT("Labourer");
			W.CurrentZone = TEXT("ZONE_C_CRANE");
			W.bHelmetStatus = false;
			W.bVestStatus = true;
			W.bHarnessStatus = false;
			W.RiskLevel = ERiskLevel::High;
			W.ViolationCount = 3;
			W.ActionStatus = ECorrectiveActionStatus::Open;
		}
		else if (i % 5 == 0)
		{
			W.Role = TEXT("Rigging Specialist");
			W.CurrentZone = TEXT("ZONE_C_CRANE");
			W.bHelmetStatus = true;
			W.bVestStatus = true;
			W.bHarnessStatus = true;
			W.RiskLevel = ERiskLevel::Medium;
			W.ViolationCount = 1;
			W.ActionStatus = ECorrectiveActionStatus::InProgress;
		}
		else
		{
			W.Role = (i % 3 == 0) ? TEXT("Steel Fixer") : ((i % 2 == 0) ? TEXT("Site Inspector") : TEXT("Electrician"));
			W.CurrentZone = (i % 4 == 0) ? TEXT("ZONE_B_BUILDING") : TEXT("ZONE_A_ENTRANCE");
			W.bHelmetStatus = true;
			W.bVestStatus = true;
			W.bHarnessStatus = true;
			W.RiskLevel = ERiskLevel::Low;
			W.ViolationCount = 0;
			W.ActionStatus = ECorrectiveActionStatus::Verified;
		}

		W.Position = FVector((i % 7) * 400.0f, (i / 7) * 400.0f, 0.0f);
		Workers.Add(W);
	}

	// 3. Drone Telemetry
	DroneTelemetry.DroneID = TEXT("DRONE-01");
	DroneTelemetry.Status = TEXT("PATROLLING");
	DroneTelemetry.AltitudeMeters = 32.0f;
	DroneTelemetry.SpeedMS = 4.2f;
	DroneTelemetry.BatteryPct = 82.0f;
	DroneTelemetry.CurrentZone = TEXT("ZONE_C_CRANE");

	// 4. CCTV Cameras
	CCTVArray.Empty();
	FCCTVCameraData C1; C1.CameraID = TEXT("CCTV-01"); C1.LocationName = TEXT("Entrance Gate"); CCTVArray.Add(C1);
	FCCTVCameraData C2; C2.CameraID = TEXT("CCTV-02"); C2.LocationName = TEXT("Building East"); CCTVArray.Add(C2);
	FCCTVCameraData C3; C3.CameraID = TEXT("CCTV-03"); C3.LocationName = TEXT("Crane Zone"); CCTVArray.Add(C3);
	FCCTVCameraData C4; C4.CameraID = TEXT("CCTV-04"); C4.LocationName = TEXT("Excavation Pit"); CCTVArray.Add(C4);
	FCCTVCameraData C5; C5.CameraID = TEXT("CCTV-05"); C5.LocationName = TEXT("Material Yard"); CCTVArray.Add(C5);

	// 5. Active Hazards
	Hazards.Empty();
	FSafetyHazardData H1;
	H1.HazardID = TEXT("HZ-001");
	H1.Type = TEXT("PPE Violation");
	H1.WorkerID = TEXT("W018");
	H1.Severity = ERiskLevel::High;
	H1.ZoneID = TEXT("ZONE_C_CRANE");
	H1.Status = TEXT("OPEN");
	H1.Timestamp = TEXT("14:32:11");
	Hazards.Add(H1);

	// 6. Insurance Risk Breakdown
	InsuranceRisk.WorkerRisk = 65.0f;
	InsuranceRisk.EquipmentRisk = 72.0f;
	InsuranceRisk.SiteRisk = 81.0f;
	InsuranceRisk.ComplianceRisk = 55.0f;
	InsuranceRisk.IncidentRisk = 68.0f;
	InsuranceRisk.OverallInsuranceRisk = 69.0f;
	InsuranceRisk.StatusLevel = ERiskLevel::High;

	// 7. AI Recommendation
	AIRecommendation = FAIAgentRecommendation();

	RecalculateMetrics();
}

void USimulatedDataProvider::UpdateTick(float DeltaTime)
{
	// Patrol Path simulation
	PatrolTimer += DeltaTime;
	if (PatrolTimer >= 5.0f)
	{
		PatrolTimer = 0.0f;
		PatrolWaypointIndex = (PatrolWaypointIndex + 1) % 5;
		
		static const FString Waypoints[] = {
			TEXT("ZONE_A_ENTRANCE"),
			TEXT("ZONE_B_BUILDING"),
			TEXT("ZONE_C_CRANE"),
			TEXT("ZONE_D_EXCAVATION"),
			TEXT("ZONE_E_STORAGE")
		};

		DroneTelemetry.CurrentZone = Waypoints[PatrolWaypointIndex];
		DroneTelemetry.BatteryPct = FMath::Max(10.0f, DroneTelemetry.BatteryPct - 0.2f);
	}
}

FConstructionZoneData USimulatedDataProvider::GetZoneDataByID(const FString& ZoneID) const
{
	for (const FConstructionZoneData& Z : Zones)
	{
		if (Z.ZoneID.Equals(ZoneID, ESearchCase::IgnoreCase))
			return Z;
	}
	return FConstructionZoneData();
}

FWorkerData USimulatedDataProvider::GetWorkerByID(const FString& WorkerID) const
{
	for (const FWorkerData& W : Workers)
	{
		if (W.WorkerID.Equals(WorkerID, ESearchCase::IgnoreCase))
			return W;
	}
	return FWorkerData();
}

void USimulatedDataProvider::TriggerSimulatedPPEViolation(const FString& WorkerID, const FString& ZoneID)
{
	for (FWorkerData& W : Workers)
	{
		if (W.WorkerID.Equals(WorkerID, ESearchCase::IgnoreCase))
		{
			W.bHelmetStatus = false;
			W.RiskLevel = ERiskLevel::Critical;
			W.ViolationCount += 1;
			W.ActionStatus = ECorrectiveActionStatus::Open;
			break;
		}
	}

	for (FConstructionZoneData& Z : Zones)
	{
		if (Z.ZoneID.Equals(ZoneID, ESearchCase::IgnoreCase))
		{
			Z.RiskScore = 94.0f;
			Z.RiskLevel = ERiskLevel::Critical;
			Z.ColorMaterial = FLinearColor(0.93f, 0.20f, 0.20f, 1.0f);
			Z.ActiveHazards += 1;
			Z.CompliancePct = FMath::Max(50.0f, Z.CompliancePct - 15.0f);
			break;
		}
	}

	FSafetyHazardData NewHazard;
	NewHazard.HazardID = FString::Printf(TEXT("HZ-%03d"), Hazards.Num() + 1);
	NewHazard.Type = TEXT("Unsafe PPE Violation");
	NewHazard.WorkerID = WorkerID;
	NewHazard.Severity = ERiskLevel::Critical;
	NewHazard.ZoneID = ZoneID;
	NewHazard.Status = TEXT("OPEN");
	NewHazard.Timestamp = FDateTime::Now().ToString(TEXT("%H:%M:%S"));
	Hazards.Insert(NewHazard, 0);

	RecalculateMetrics();
}

void USimulatedDataProvider::TriggerResolveViolation(const FString& WorkerID)
{
	for (FWorkerData& W : Workers)
	{
		if (W.WorkerID.Equals(WorkerID, ESearchCase::IgnoreCase))
		{
			W.bHelmetStatus = true;
			W.bVestStatus = true;
			W.RiskLevel = ERiskLevel::Low;
			W.ActionStatus = ECorrectiveActionStatus::Verified;
			break;
		}
	}

	for (FSafetyHazardData& H : Hazards)
	{
		if (H.WorkerID.Equals(WorkerID, ESearchCase::IgnoreCase) && H.Status.Equals(TEXT("OPEN")))
		{
			H.Status = TEXT("VERIFIED");
		}
	}

	for (FConstructionZoneData& Z : Zones)
	{
		if (Z.ZoneID.Contains(TEXT("CRANE")))
		{
			Z.RiskScore = 35.0f;
			Z.RiskLevel = ERiskLevel::Medium;
			Z.ColorMaterial = FLinearColor(0.95f, 0.75f, 0.15f, 1.0f);
			Z.ActiveHazards = FMath::Max(0, Z.ActiveHazards - 1);
			Z.CompliancePct = 94.0f;
		}
	}

	RecalculateMetrics();
}

void USimulatedDataProvider::RecalculateMetrics()
{
	int32 TotalCompliant = 0;
	for (const FWorkerData& W : Workers)
	{
		if (W.bHelmetStatus && W.bVestStatus)
			TotalCompliant++;
	}

	float OverallCompliance = (float)TotalCompliant / (float)Workers.Num() * 100.0f;
	
	InsuranceRisk.ComplianceRisk = 100.0f - OverallCompliance;
	InsuranceRisk.WorkerRisk = (1.0f - (float)TotalCompliant / Workers.Num()) * 100.0f + 25.0f;
	InsuranceRisk.OverallInsuranceRisk = (InsuranceRisk.WorkerRisk + InsuranceRisk.EquipmentRisk + InsuranceRisk.SiteRisk + InsuranceRisk.ComplianceRisk + InsuranceRisk.IncidentRisk) / 5.0f;
	
	if (InsuranceRisk.OverallInsuranceRisk > 80.0f)
		InsuranceRisk.StatusLevel = ERiskLevel::Critical;
	else if (InsuranceRisk.OverallInsuranceRisk > 60.0f)
		InsuranceRisk.StatusLevel = ERiskLevel::High;
	else if (InsuranceRisk.OverallInsuranceRisk > 30.0f)
		InsuranceRisk.StatusLevel = ERiskLevel::Medium;
	else
		InsuranceRisk.StatusLevel = ERiskLevel::Low;
}
