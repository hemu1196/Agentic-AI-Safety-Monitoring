#include "ConstructionZoneManager.h"

AConstructionZoneManager::AConstructionZoneManager()
{
	PrimaryActorTick.bCanEverTick = true;
	ZoneID = TEXT("ZONE_A_ENTRANCE");
	ZoneDisplayName = TEXT("Site Entrance");
}

void AConstructionZoneManager::BeginPlay()
{
	Super::BeginPlay();
}

void AConstructionZoneManager::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
}

void AConstructionZoneManager::UpdateZoneRiskVisuals(const FString& InZoneID, ERiskLevel RiskLevel, float RiskScore)
{
	if (ZoneID.Equals(InZoneID, ESearchCase::IgnoreCase))
	{
		CurrentZoneData.RiskLevel = RiskLevel;
		CurrentZoneData.RiskScore = RiskScore;

		switch (RiskLevel)
		{
		case ERiskLevel::Low:
			CurrentZoneData.ColorMaterial = FLinearColor(0.06f, 0.72f, 0.50f, 1.0f);
			break;
		case ERiskLevel::Medium:
			CurrentZoneData.ColorMaterial = FLinearColor(0.95f, 0.75f, 0.15f, 1.0f);
			break;
		case ERiskLevel::High:
			CurrentZoneData.ColorMaterial = FLinearColor(0.95f, 0.45f, 0.12f, 1.0f);
			break;
		case ERiskLevel::Critical:
			CurrentZoneData.ColorMaterial = FLinearColor(0.93f, 0.20f, 0.20f, 1.0f);
			break;
		}

		UE_LOG(LogTemp, Log, TEXT("Zone %s updated to Risk Score %.1f (%d)"), *ZoneID, RiskScore, (int32)RiskLevel);
	}
}
