#include "InspectionDroneController.h"

AInspectionDroneController::AInspectionDroneController()
	: CurrentWaypointIndex(0)
{
	PrimaryActorTick.bCanEverTick = true;
	
	PatrolWaypoints.Add(FVector(0.0f, 0.0f, 3200.0f));       // BASE
	PatrolWaypoints.Add(FVector(1000.0f, 0.0f, 3200.0f));    // ZONE A
	PatrolWaypoints.Add(FVector(2500.0f, 1500.0f, 3500.0f)); // ZONE B
	PatrolWaypoints.Add(FVector(4000.0f, 2000.0f, 4000.0f)); // ZONE C
	PatrolWaypoints.Add(FVector(3000.0f, 4000.0f, 3000.0f)); // ZONE D
	PatrolWaypoints.Add(FVector(1000.0f, 3500.0f, 3200.0f)); // ZONE E
}

void AInspectionDroneController::BeginPlay()
{
	Super::BeginPlay();
}

void AInspectionDroneController::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);

	if (PatrolWaypoints.Num() > 0)
	{
		FVector Target = PatrolWaypoints[CurrentWaypointIndex];
		FVector CurrentLocation = GetActorLocation();
		FVector NewLocation = FMath::VInterpTo(CurrentLocation, Target, DeltaSeconds, 0.8f);
		SetActorLocation(NewLocation);

		if (FVector::DistSquared(NewLocation, Target) < 40000.0f)
		{
			CurrentWaypointIndex = (CurrentWaypointIndex + 1) % PatrolWaypoints.Num();
		}
	}
}

void AInspectionDroneController::UpdateTelemetry(const FDroneTelemetryData& NewTelemetry)
{
	Telemetry = NewTelemetry;
}
