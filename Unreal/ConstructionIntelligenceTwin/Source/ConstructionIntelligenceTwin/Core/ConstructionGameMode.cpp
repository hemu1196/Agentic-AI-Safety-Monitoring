#include "ConstructionGameMode.h"
#include "Data/SimulatedDataProvider.h"
#include "Data/PythonRestProvider.h"
#include "Kismet/GameplayStatics.h"

AConstructionGameMode::AConstructionGameMode()
	: bUsePythonBackend(false)
	, CurrentCameraMode(ECameraViewMode::Overview)
{
	PrimaryActorTick.bCanEverTick = true;
}

void AConstructionGameMode::BeginPlay()
{
	Super::BeginPlay();

	if (bUsePythonBackend)
	{
		UPythonRestProvider* Provider = NewObject<UPythonRestProvider>(this);
		Provider->InitializeProvider();
		DataProvider = Provider;
		UE_LOG(LogTemp, Log, TEXT("ConstructionGameMode: Initialized Python REST Data Provider."));
	}
	else
	{
		USimulatedDataProvider* Provider = NewObject<USimulatedDataProvider>(this);
		Provider->InitializeProvider();
		DataProvider = Provider;
		UE_LOG(LogTemp, Log, TEXT("ConstructionGameMode: Initialized Autonomous Simulated Data Provider."));
	}

	SetCameraMode(ECameraViewMode::Overview);
}

void AConstructionGameMode::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);

	if (DataProvider.GetInterface())
	{
		DataProvider->UpdateTick(DeltaSeconds);
	}
}

void AConstructionGameMode::SetCameraMode(ECameraViewMode NewMode)
{
	CurrentCameraMode = NewMode;
	UE_LOG(LogTemp, Log, TEXT("Camera Mode Switched to: %d"), (int32)NewMode);
}

void AConstructionGameMode::TriggerSimulatePPEViolation()
{
	if (DataProvider.GetInterface())
	{
		DataProvider->TriggerSimulatedPPEViolation(TEXT("W018"), TEXT("ZONE_C_CRANE"));
		UE_LOG(LogTemp, Warning, TEXT("SIMULATION MODE TRIGGERED: Worker W018 PPE Violation in Crane Zone!"));
	}
}

void AConstructionGameMode::TriggerResolveViolation()
{
	if (DataProvider.GetInterface())
	{
		DataProvider->TriggerResolveViolation(TEXT("W018"));
		UE_LOG(LogTemp, Log, TEXT("SIMULATION MODE: Worker W018 Violation VERIFIED & RESOLVED!"));
	}
}
