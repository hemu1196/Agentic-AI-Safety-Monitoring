#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Data/ConstructionDataTypes.h"
#include "InspectionDroneController.generated.h"

UCLASS(BlueprintType, Blueprintable)
class CONSTRUCTIONINTELLIGENCETWIN_API AInspectionDroneController : public AActor
{
	GENERATED_BODY()

public:
	AInspectionDroneController();

	virtual void BeginPlay() override;
	virtual void Tick(float DeltaSeconds) override;

	UFUNCTION(BlueprintCallable, Category = "Construction|Drone")
	void UpdateTelemetry(const FDroneTelemetryData& NewTelemetry);

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Drone")
	FDroneTelemetryData Telemetry;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Drone")
	TArray<FVector> PatrolWaypoints;

	UPROPERTY(BlueprintReadOnly, Category = "Construction|Drone")
	int32 CurrentWaypointIndex;
};
