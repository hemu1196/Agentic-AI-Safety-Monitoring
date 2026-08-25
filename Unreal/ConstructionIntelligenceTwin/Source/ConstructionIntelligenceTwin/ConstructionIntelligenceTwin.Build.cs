using UnrealBuildTool;

public class ConstructionIntelligenceTwin : ModuleRules
{
	public ConstructionIntelligenceTwin(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;
	
		PublicDependencyModuleNames.AddRange(new string[] { 
			"Core", 
			"CoreUObject", 
			"Engine", 
			"InputCore",
			"UMG",
			"Slate",
			"SlateCore",
			"HTTP",
			"Json",
			"JsonUtilities",
			"WebSockets"
		});

		PrivateDependencyModuleNames.AddRange(new string[] {  });
	}
}
