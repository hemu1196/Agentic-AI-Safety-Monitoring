#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Data/ConstructionDataTypes.h"
#include "WorkerVisualizer.generated.h"

UCLASS(BlueprintType, Blueprintable)
class CONSTRUCTIONINTELLIGENCETWIN_API AWorkerVisualizer : public AActor
{
	GENERATED_BODY()

public:
	AWorkerVisualizer();

	virtual void BeginPlay() override;
	virtual void Tick(float DeltaSeconds) override;

	UFUNCTION(BlueprintCallable, Category = "Construction|Worker")
	void UpdateWorkerData(const FWorkerData& NewData);

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Worker")
	FWorkerData WorkerData;

	UPROPERTY(BlueprintReadOnly, Category = "Construction|Worker")
	FLinearColor RiskIndicatorColor;
};
