#include "PythonRestProvider.h"
#include "Json.h"
#include "JsonUtilities.h"

UPythonRestProvider::UPythonRestProvider()
	: ServerURL(TEXT("http://localhost:8000/api/v1/unreal/site-state"))
	, PollInterval(1.0f)
	, TimeSinceLastPoll(0.0f)
{
}

void UPythonRestProvider::InitializeProvider()
{
	PollPythonServer();
}

void UPythonRestProvider::UpdateTick(float DeltaTime)
{
	TimeSinceLastPoll += DeltaTime;
	if (TimeSinceLastPoll >= PollInterval)
	{
		TimeSinceLastPoll = 0.0f;
		PollPythonServer();
	}
}

void UPythonRestProvider::PollPythonServer()
{
	TSharedRef<IHttpRequest, ESPMode::ThreadSafe> HttpRequest = FHttpModule::Get().CreateRequest();
	HttpRequest->OnProcessRequestComplete().BindUObject(this, &UPythonRestProvider::OnPythonServerResponse);
	HttpRequest->SetURL(ServerURL);
	HttpRequest->SetVerb(TEXT("GET"));
	HttpRequest->SetHeader(TEXT("Content-Type"), TEXT("application/json"));
	HttpRequest->ProcessRequest();
}

void UPythonRestProvider::OnPythonServerResponse(FHttpRequestPtr Request, FHttpResponsePtr Response, bool bWasSuccessful)
{
	if (!bWasSuccessful || !Response.IsValid() || Response->GetResponseCode() != 200)
	{
		return;
	}

	FString ResponseBody = Response->GetContentAsString();
	TSharedPtr<FJsonObject> JsonObject;
	TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(ResponseBody);

	if (FJsonSerializer::Deserialize(Reader, JsonObject) && JsonObject.IsValid())
	{
		// Parse Workers array
		const TArray<TSharedPtr<FJsonValue>>* WorkersJson;
		if (JsonObject->TryGetArrayField(TEXT("workers"), WorkersJson))
		{
			Workers.Empty();
			for (const auto& Val : *WorkersJson)
			{
				TSharedPtr<FJsonObject> Obj = Val->AsObject();
				if (!Obj.IsValid()) continue;

				FWorkerData W;
				W.WorkerID = Obj->GetStringField(TEXT("worker_id"));
				W.Role = Obj->GetStringField(TEXT("role"));
				W.CurrentZone = Obj->GetStringField(TEXT("zone"));
				W.bHelmetStatus = Obj->GetBoolField(TEXT("helmet"));
				W.bVestStatus = Obj->GetBoolField(TEXT("vest"));
				W.bHarnessStatus = Obj->GetBoolField(TEXT("harness"));
				W.RiskLevel = (ERiskLevel)Obj->GetIntegerField(TEXT("risk_level"));
				Workers.Add(W);
			}
		}

		// Parse Drone object
		const TSharedPtr<FJsonObject>* DroneObj;
		if (JsonObject->TryGetObjectField(TEXT("drone"), DroneObj))
		{
			DroneTelemetry.DroneID = (*DroneObj)->GetStringField(TEXT("drone_id"));
			DroneTelemetry.Status = (*DroneObj)->GetStringField(TEXT("status"));
			DroneTelemetry.AltitudeMeters = (*DroneObj)->GetNumberField(TEXT("altitude"));
			DroneTelemetry.SpeedMS = (*DroneObj)->GetNumberField(TEXT("speed"));
			DroneTelemetry.BatteryPct = (*DroneObj)->GetNumberField(TEXT("battery"));
			DroneTelemetry.CurrentZone = (*DroneObj)->GetStringField(TEXT("zone"));
		}
	}
}

FConstructionZoneData UPythonRestProvider::GetZoneDataByID(const FString& ZoneID) const
{
	for (const FConstructionZoneData& Z : Zones)
	{
		if (Z.ZoneID.Equals(ZoneID, ESearchCase::IgnoreCase))
			return Z;
	}
	return FConstructionZoneData();
}

FWorkerData UPythonRestProvider::GetWorkerByID(const FString& WorkerID) const
{
	for (const FWorkerData& W : Workers)
	{
		if (W.WorkerID.Equals(WorkerID, ESearchCase::IgnoreCase))
			return W;
	}
	return FWorkerData();
}

void UPythonRestProvider::TriggerSimulatedPPEViolation(const FString& WorkerID, const FString& ZoneID)
{
	TSharedRef<IHttpRequest, ESPMode::ThreadSafe> HttpRequest = FHttpModule::Get().CreateRequest();
	HttpRequest->SetURL(TEXT("http://localhost:8000/api/v1/unreal/simulate-event"));
	HttpRequest->SetVerb(TEXT("POST"));
	HttpRequest->SetHeader(TEXT("Content-Type"), TEXT("application/json"));
	
	FString Payload = FString::Printf(TEXT("{\"event_type\":\"PPE_VIOLATION\",\"worker_id\":\"%s\",\"zone\":\"%s\"}"), *WorkerID, *ZoneID);
	HttpRequest->SetContentAsString(Payload);
	HttpRequest->ProcessRequest();
}

void UPythonRestProvider::TriggerResolveViolation(const FString& WorkerID)
{
	TSharedRef<IHttpRequest, ESPMode::ThreadSafe> HttpRequest = FHttpModule::Get().CreateRequest();
	HttpRequest->SetURL(TEXT("http://localhost:8000/api/v1/unreal/simulate-event"));
	HttpRequest->SetVerb(TEXT("POST"));
	HttpRequest->SetHeader(TEXT("Content-Type"), TEXT("application/json"));
	
	FString Payload = FString::Printf(TEXT("{\"event_type\":\"RESOLVE_VIOLATION\",\"worker_id\":\"%s\"}"), *WorkerID);
	HttpRequest->SetContentAsString(Payload);
	HttpRequest->ProcessRequest();
}
