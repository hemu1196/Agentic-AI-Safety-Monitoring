#pragma once

#include "CoreMinimal.h"
#include "ConstructionDataTypes.generated.h"

/** Risk Level Classification */
UENUM(BlueprintType)
enum class ERiskLevel : uint8
{
	Low        UMETA(DisplayName = "Low (0-30)"),
	Medium     UMETA(DisplayName = "Medium (31-60)"),
	High       UMETA(DisplayName = "High (61-80)"),
	Critical   UMETA(DisplayName = "Critical (81-100)")
};

/** Corrective Action Status */
UENUM(BlueprintType)
enum class ECorrectiveActionStatus : uint8
{
	Open        UMETA(DisplayName = "Open"),
	InProgress  UMETA(DisplayName = "In Progress"),
	Resolved    UMETA(DisplayName = "Resolved"),
	Verified    UMETA(DisplayName = "Verified")
};

/** Site Zone Data Structure */
USTRUCT(BlueprintType)
struct FConstructionZoneData
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Zone")
	FString ZoneID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Zone")
	FString DisplayName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Zone")
	ERiskLevel RiskLevel;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Zone")
	float RiskScore;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Zone")
	FString Status;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Zone")
	FLinearColor ColorMaterial;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Zone")
	int32 ActiveWorkers;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Zone")
	int32 ActiveHazards;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Zone")
	float CompliancePct;

	FConstructionZoneData()
		: ZoneID(TEXT("ZONE_A_ENTRANCE"))
		, DisplayName(TEXT("Site Entrance"))
		, RiskLevel(ERiskLevel::Low)
		, RiskScore(20.0f)
		, Status(TEXT("ACTIVE"))
		, ColorMaterial(FLinearColor(0.06f, 0.72f, 0.50f, 1.0f))
		, ActiveWorkers(5)
		, ActiveHazards(0)
		, CompliancePct(96.0f)
	{}
};

/** Worker Data Structure */
USTRUCT(BlueprintType)
struct FWorkerData
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Worker")
	FString WorkerID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Worker")
	FString Role;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Worker")
	FVector Position;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Worker")
	FString CurrentZone;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Worker")
	bool bHelmetStatus;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Worker")
	bool bVestStatus;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Worker")
	bool bHarnessStatus;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Worker")
	ERiskLevel RiskLevel;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Worker")
	int32 ViolationCount;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Worker")
	ECorrectiveActionStatus ActionStatus;

	FWorkerData()
		: WorkerID(TEXT("W001"))
		, Role(TEXT("Electrician"))
		, Position(FVector(0,0,0))
		, CurrentZone(TEXT("ZONE_A_ENTRANCE"))
		, bHelmetStatus(true)
		, bVestStatus(true)
		, bHarnessStatus(true)
		, RiskLevel(ERiskLevel::Low)
		, ViolationCount(0)
		, ActionStatus(ECorrectiveActionStatus::Verified)
	{}
};

/** Inspection Drone Telemetry Data */
USTRUCT(BlueprintType)
struct FDroneTelemetryData
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Drone")
	FString DroneID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Drone")
	FString Status;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Drone")
	float AltitudeMeters;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Drone")
	float SpeedMS;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Drone")
	float BatteryPct;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Drone")
	FString CurrentZone;

	FDroneTelemetryData()
		: DroneID(TEXT("DRONE-01"))
		, Status(TEXT("PATROLLING"))
		, AltitudeMeters(32.0f)
		, SpeedMS(4.2f)
		, BatteryPct(82.0f)
		, CurrentZone(TEXT("ZONE_C_CRANE"))
	{}
};

/** CCTV Camera Data */
USTRUCT(BlueprintType)
struct FCCTVCameraData
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|CCTV")
	FString CameraID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|CCTV")
	FString LocationName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|CCTV")
	FString Status;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|CCTV")
	FRotator ViewDirection;

	FCCTVCameraData()
		: CameraID(TEXT("CCTV-01"))
		, LocationName(TEXT("Site Entrance"))
		, Status(TEXT("ONLINE"))
		, ViewDirection(FRotator(-15.0f, 45.0f, 0.0f))
	{}
};

/** Incident / Hazard Log Entry */
USTRUCT(BlueprintType)
struct FSafetyHazardData
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Hazard")
	FString HazardID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Hazard")
	FString Type;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Hazard")
	FString WorkerID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Hazard")
	ERiskLevel Severity;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Hazard")
	FString ZoneID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Hazard")
	FString Status;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Hazard")
	FString Timestamp;

	FSafetyHazardData()
		: HazardID(TEXT("HZ-001"))
		, Type(TEXT("PPE Violation"))
		, WorkerID(TEXT("W018"))
		, Severity(ERiskLevel::High)
		, ZoneID(TEXT("ZONE_C_CRANE"))
		, Status(TEXT("OPEN"))
		, Timestamp(TEXT("14:32:11"))
	{}
};

/** Insurance Risk Breakdown */
USTRUCT(BlueprintType)
struct FInsuranceRiskBreakdown
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Insurance")
	float WorkerRisk;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Insurance")
	float EquipmentRisk;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Insurance")
	float SiteRisk;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Insurance")
	float ComplianceRisk;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Insurance")
	float IncidentRisk;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Insurance")
	float OverallInsuranceRisk;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Insurance")
	ERiskLevel StatusLevel;

	FInsuranceRiskBreakdown()
		: WorkerRisk(65.0f)
		, EquipmentRisk(72.0f)
		, SiteRisk(81.0f)
		, ComplianceRisk(55.0f)
		, IncidentRisk(68.0f)
		, OverallInsuranceRisk(69.0f)
		, StatusLevel(ERiskLevel::High)
	{}
};

/** Agentic AI Recommendations */
USTRUCT(BlueprintType)
struct FAIAgentRecommendation
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|AI")
	FString RiskDetectedZone;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|AI")
	TArray<FString> Reasons;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|AI")
	TArray<FString> RecommendedActions;

	FAIAgentRecommendation()
	{
		RiskDetectedZone = TEXT("ZONE_C_CRANE");
		Reasons.Add(TEXT("Repeated PPE violations"));
		Reasons.Add(TEXT("High-risk crane activity"));
		Reasons.Add(TEXT("Equipment certificate expiring"));
		Reasons.Add(TEXT("Open corrective actions"));

		RecommendedActions.Add(TEXT("1. Enforce mandatory PPE correction"));
		RecommendedActions.Add(TEXT("2. Inspect crane certification"));
		RecommendedActions.Add(TEXT("3. Review Worker W018 history"));
		RecommendedActions.Add(TEXT("4. Increase drone patrol frequency"));
	}
};
