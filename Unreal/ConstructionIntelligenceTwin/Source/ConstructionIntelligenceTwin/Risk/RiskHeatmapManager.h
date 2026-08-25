#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Data/ConstructionDataTypes.h"
#include "RiskHeatmapManager.generated.h"

UCLASS(BlueprintType, Blueprintable)
class CONSTRUCTIONINTELLIGENCETWIN_API ARiskHeatmapManager : public AActor
{
	GENERATED_BODY()

public:
	ARiskHeatmapManager();

	virtual void BeginPlay() override;
	virtual void Tick(float DeltaSeconds) override;

	UFUNCTION(BlueprintCallable, Category = "Construction|Risk")
	ERiskLevel EvaluateRiskLevel(float Score) const;

	UFUNCTION(BlueprintCallable, Category = "Construction|Risk")
	FLinearColor GetColorForRiskLevel(ERiskLevel Level) const;

	UPROPERTY(BlueprintReadOnly, Category = "Construction|Risk")
	FInsuranceRiskBreakdown CurrentInsuranceBreakdown;
};
