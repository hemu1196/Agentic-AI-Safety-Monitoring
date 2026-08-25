#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Data/ConstructionDataTypes.h"
#include "ConstructionZoneManager.generated.h"

UCLASS(BlueprintType, Blueprintable)
class CONSTRUCTIONINTELLIGENCETWIN_API AConstructionZoneManager : public AActor
{
	GENERATED_BODY()

public:
	AConstructionZoneManager();

	virtual void BeginPlay() override;
	virtual void Tick(float DeltaSeconds) override;

	UFUNCTION(BlueprintCallable, Category = "Construction|Zones")
	void UpdateZoneRiskVisuals(const FString& ZoneID, ERiskLevel RiskLevel, float RiskScore);

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Zones")
	FString ZoneID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Zones")
	FString ZoneDisplayName;

	UPROPERTY(BlueprintReadOnly, Category = "Construction|Zones")
	FConstructionZoneData CurrentZoneData;
};
