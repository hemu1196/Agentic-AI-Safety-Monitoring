#pragma once

#include "CoreMinimal.h"
#include "UObject/NoExportTypes.h"
#include "DataProviderInterface.h"
#include "SimulatedDataProvider.generated.h"

UCLASS(BlueprintType, Blueprintable)
class CONSTRUCTIONINTELLIGENCETWIN_API USimulatedDataProvider : public UObject, public IDataProviderInterface
{
	GENERATED_BODY()

public:
	USimulatedDataProvider();

	virtual void InitializeProvider() override;
	virtual void UpdateTick(float DeltaTime) override;
	
	virtual TArray<FConstructionZoneData> GetZonesData() const override { return Zones; }
	virtual FConstructionZoneData GetZoneDataByID(const FString& ZoneID) const override;
	
	virtual TArray<FWorkerData> GetWorkersData() const override { return Workers; }
	virtual FWorkerData GetWorkerByID(const FString& WorkerID) const override;
	
	virtual FDroneTelemetryData GetDroneTelemetry() const override { return DroneTelemetry; }
	virtual TArray<FCCTVCameraData> GetCCTVData() const override { return CCTVArray; }
	
	virtual TArray<FSafetyHazardData> GetActiveHazards() const override { return Hazards; }
	virtual FInsuranceRiskBreakdown GetInsuranceRiskBreakdown() const override { return InsuranceRisk; }
	virtual FAIAgentRecommendation GetAIRecommendation() const override { return AIRecommendation; }
	
	virtual void TriggerSimulatedPPEViolation(const FString& WorkerID, const FString& ZoneID) override;
	virtual void TriggerResolveViolation(const FString& WorkerID) override;

private:
	void RecalculateMetrics();

	UPROPERTY()
	TArray<FConstructionZoneData> Zones;

	UPROPERTY()
	TArray<FWorkerData> Workers;

	UPROPERTY()
	FDroneTelemetryData DroneTelemetry;

	UPROPERTY()
	TArray<FCCTVCameraData> CCTVArray;

	UPROPERTY()
	TArray<FSafetyHazardData> Hazards;

	UPROPERTY()
	FInsuranceRiskBreakdown InsuranceRisk;

	UPROPERTY()
	FAIAgentRecommendation AIRecommendation;

	float PatrolTimer;
	int32 PatrolWaypointIndex;
};
