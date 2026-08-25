#include "ConstructionIntelligenceTwin.h"

DEFINE_LOG_CATEGORY(LogConstructionTwin);

void FConstructionIntelligenceTwinModule::StartupModule()
{
	UE_LOG(LogConstructionTwin, Log, TEXT("ConstructionIntelligenceTwin Module Started Successfully."));
}

void FConstructionIntelligenceTwinModule::ShutdownModule()
{
	UE_LOG(LogConstructionTwin, Log, TEXT("ConstructionIntelligenceTwin Module Shutdown."));
}

IMPLEMENT_PRIMARY_GAME_MODULE(FConstructionIntelligenceTwinModule, ConstructionIntelligenceTwin, "ConstructionIntelligenceTwin");
