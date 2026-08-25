#include "IndustrialDashboardHUD.h"

AIndustrialDashboardHUD::AIndustrialDashboardHUD()
	: SelectedWorkerID(TEXT("W018"))
	, SelectedZoneID(TEXT("ZONE_C_CRANE"))
	, bShowEventFeed(true)
	, bShowTacticalMap(true)
{
}

void AIndustrialDashboardHUD::DrawHUD()
{
	Super::DrawHUD();

	// Custom HUD rendering logic can be supplemented by UMG Widget Blueprints in UE Editor
}

void AIndustrialDashboardHUD::SelectWorkerForInspection(const FString& WorkerID)
{
	SelectedWorkerID = WorkerID;
	UE_LOG(LogTemp, Log, TEXT("UI Inspector: Worker %s selected."), *WorkerID);
}

void AIndustrialDashboardHUD::SelectZoneForInspection(const FString& ZoneID)
{
	SelectedZoneID = ZoneID;
	UE_LOG(LogTemp, Log, TEXT("UI Inspector: Zone %s selected."), *ZoneID);
}
