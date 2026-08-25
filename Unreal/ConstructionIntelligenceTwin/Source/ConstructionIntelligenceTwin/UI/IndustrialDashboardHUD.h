#pragma once

#include "CoreMinimal.h"
#include "GameFramework/HUD.h"
#include "Data/ConstructionDataTypes.h"
#include "IndustrialDashboardHUD.generated.h"

UCLASS(BlueprintType, Blueprintable)
class CONSTRUCTIONINTELLIGENCETWIN_API AIndustrialDashboardHUD : public AHUD
{
	GENERATED_BODY()

public:
	AIndustrialDashboardHUD();

	virtual void DrawHUD() override;

	UFUNCTION(BlueprintCallable, Category = "Construction|UI")
	void SelectWorkerForInspection(const FString& WorkerID);

	UFUNCTION(BlueprintCallable, Category = "Construction|UI")
	void SelectZoneForInspection(const FString& ZoneID);

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|UI")
	FString SelectedWorkerID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|UI")
	FString SelectedZoneID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|UI")
	bool bShowEventFeed;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|UI")
	bool bShowTacticalMap;
};
