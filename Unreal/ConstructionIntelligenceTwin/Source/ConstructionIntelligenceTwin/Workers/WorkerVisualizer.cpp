#include "WorkerVisualizer.h"

AWorkerVisualizer::AWorkerVisualizer()
{
	PrimaryActorTick.bCanEverTick = true;
	RiskIndicatorColor = FLinearColor(0.06f, 0.72f, 0.50f, 1.0f);
}

void AWorkerVisualizer::BeginPlay()
{
	Super::BeginPlay();
}

void AWorkerVisualizer::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
}

void AWorkerVisualizer::UpdateWorkerData(const FWorkerData& NewData)
{
	WorkerData = NewData;

	switch (WorkerData.RiskLevel)
	{
	case ERiskLevel::Low:
		RiskIndicatorColor = FLinearColor(0.06f, 0.72f, 0.50f, 1.0f); // Green
		break;
	case ERiskLevel::Medium:
		RiskIndicatorColor = FLinearColor(0.95f, 0.75f, 0.15f, 1.0f); // Yellow
		break;
	case ERiskLevel::High:
		RiskIndicatorColor = FLinearColor(0.95f, 0.45f, 0.12f, 1.0f); // Orange
		break;
	case ERiskLevel::Critical:
		RiskIndicatorColor = FLinearColor(0.93f, 0.20f, 0.20f, 1.0f); // Red
		break;
	}
}
