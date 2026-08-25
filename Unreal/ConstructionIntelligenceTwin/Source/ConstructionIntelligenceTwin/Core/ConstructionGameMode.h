#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "Data/DataProviderInterface.h"
#include "ConstructionGameMode.generated.h"

UENUM(BlueprintType)
enum class ECameraViewMode : uint8
{
	Overview        UMETA(DisplayName = "1. Site Overview Camera"),
	DroneCamera     UMETA(DisplayName = "2. Inspection Drone Camera"),
	CCTVCamera      UMETA(DisplayName = "3. CCTV Surveillance View"),
	WorkerInspector UMETA(DisplayName = "4. Worker Inspection Camera")
};

UCLASS(BlueprintType, Blueprintable)
class CONSTRUCTIONINTELLIGENCETWIN_API AConstructionGameMode : public AGameModeBase
{
	GENERATED_BODY()

public:
	AConstructionGameMode();

	virtual void BeginPlay() override;
	virtual void Tick(float DeltaSeconds) override;

	UFUNCTION(BlueprintCallable, Category = "Construction|Camera")
	void SetCameraMode(ECameraViewMode NewMode);

	UFUNCTION(BlueprintCallable, Category = "Construction|Simulation")
	void TriggerSimulatePPEViolation();

	UFUNCTION(BlueprintCallable, Category = "Construction|Simulation")
	void TriggerResolveViolation();

	UFUNCTION(BlueprintPure, Category = "Construction|Data")
	TScriptInterface<IDataProviderInterface> GetDataProvider() const { return DataProvider; }

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Construction|Config")
	bool bUsePythonBackend;

	UPROPERTY(BlueprintReadOnly, Category = "Construction|State")
	ECameraViewMode CurrentCameraMode;

private:
	UPROPERTY()
	TScriptInterface<IDataProviderInterface> DataProvider;
};
