#pragma once

#include "CoreMinimal.h"
#include "UObject/Interface.h"
#include "ConstructionDataTypes.h"
#include "DataProviderInterface.generated.h"

UINTERFACE(MinimalAPI, Blueprintable)
class UDataProviderInterface : public UInterface
{
	GENERATED_BODY()
};

class CONSTRUCTIONINTELLIGENCETWIN_API IDataProviderInterface
{
	GENERATED_BODY()

public:
	virtual void InitializeProvider() = 0;
	virtual void UpdateTick(float DeltaTime) = 0;
	
	// Site & Zone Data
	virtual TArray<FConstructionZoneData> GetZonesData() const = 0;
	virtual FConstructionZoneData GetZoneDataByID(const FString& ZoneID) const = 0;
	
	// Worker Data
	virtual TArray<FWorkerData> GetWorkersData() const = 0;
	virtual FWorkerData GetWorkerByID(const FString& WorkerID) const = 0;
	
	// Telemetry & CCTV
	virtual FDroneTelemetryData GetDroneTelemetry() const = 0;
	virtual TArray<FCCTVCameraData> GetCCTVData() const = 0;
	
	// Hazards & Risk
	virtual TArray<FSafetyHazardData> GetActiveHazards() const = 0;
	virtual FInsuranceRiskBreakdown GetInsuranceRiskBreakdown() const = 0;
	virtual FAIAgentRecommendation GetAIRecommendation() const = 0;
	
	// Simulation Trigger Commands
	virtual void TriggerSimulatedPPEViolation(const FString& WorkerID, const FString& ZoneID) = 0;
	virtual void TriggerResolveViolation(const FString& WorkerID) = 0;
};
