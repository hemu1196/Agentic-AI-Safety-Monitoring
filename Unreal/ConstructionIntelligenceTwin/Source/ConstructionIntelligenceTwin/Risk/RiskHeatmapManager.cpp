#include "RiskHeatmapManager.h"

ARiskHeatmapManager::ARiskHeatmapManager()
{
	PrimaryActorTick.bCanEverTick = true;
}

void ARiskHeatmapManager::BeginPlay()
{
	Super::BeginPlay();
}

void ARiskHeatmapManager::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
}

ERiskLevel ARiskHeatmapManager::EvaluateRiskLevel(float Score) const
{
	if (Score > 80.0f) return ERiskLevel::Critical;
	if (Score > 60.0f) return ERiskLevel::High;
	if (Score > 30.0f) return ERiskLevel::Medium;
	return ERiskLevel::Low;
}

FLinearColor ARiskHeatmapManager::GetColorForRiskLevel(ERiskLevel Level) const
{
	switch (Level)
	{
	case ERiskLevel::Low:
		return FLinearColor(0.06f, 0.72f, 0.50f, 1.0f); // Green
	case ERiskLevel::Medium:
		return FLinearColor(0.95f, 0.75f, 0.15f, 1.0f); // Yellow
	case ERiskLevel::High:
		return FLinearColor(0.95f, 0.45f, 0.12f, 1.0f); // Orange
	case ERiskLevel::Critical:
		return FLinearColor(0.93f, 0.20f, 0.20f, 1.0f); // Red
	default:
		return FLinearColor::White;
	}
}
