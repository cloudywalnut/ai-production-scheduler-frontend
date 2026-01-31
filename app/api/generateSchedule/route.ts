// Get the pending errors fixed try tomorrow
import { supabase } from '../../utils/supabase'
import { SceneRow, LocationGroup } from '../../types/types';

function scheduleScenes(scenes: SceneRow[], maxDayTimeHours: number) {
    // Get locations sorted by most scenes first
    const locationSceneMap = getLocationsSortedBySceneCount(scenes);
    const shootingDays = [];
    let currentDayNumber = 1;

    // Continue scheduling until all scenes are assigned
    while (Object.keys(locationSceneMap).length > 0) {
        const dayScenes = [];
        let totalDayTimeUsed = 0;

        for (const locationName in locationSceneMap) {
            // If remaining day time is 4 hours or less, don't change location (avoid pack-up)
            if (maxDayTimeHours - totalDayTimeUsed <= 4) {
                continue;
            }

            // Sort sub-locations with most scenes first - The EXTD, INTD, INTN, EXTN Sort function is inside this function
            locationSceneMap[locationName].scenes = sortSubLocationsBySceneCount(locationSceneMap[locationName].scenes);
            const locationScenes = locationSceneMap[locationName].scenes;

            let sceneIndex = 0;
            while (sceneIndex < locationScenes.length) {
                const scene = locationScenes[sceneIndex];

                // Schedule scene if it fits in the day, or if it's the last scene at this location
                const willSceneFit = totalDayTimeUsed + scene.estimatedTime <= maxDayTimeHours;
                const isLastSceneAtLocation = locationScenes.length === 1;
                
                if (willSceneFit || isLastSceneAtLocation) {
                    dayScenes.push(scene);
                    totalDayTimeUsed += scene.estimatedTime;
                    locationScenes.splice(sceneIndex, 1); // Remove scheduled scene
                } else {
                    sceneIndex++;
                }
            }

            // Remove location if all scenes have been scheduled
            if (locationScenes.length === 0) {
                delete locationSceneMap[locationName];
            }

        }

        // Sort scenes within the day from DAY to EVENING
        const timeOfDayOrder = ["DAY", "EVENING", "NIGHT", "UNKNOWN"];
        dayScenes.sort((sceneA, sceneB) => {
            return timeOfDayOrder.indexOf(sceneA.time_of_day) - timeOfDayOrder.indexOf(sceneB.time_of_day);
        });

        shootingDays.push({
            day: currentDayNumber,
            scenes: dayScenes,
            totalTime: totalDayTimeUsed
        });
        
        currentDayNumber++;
    }

    return shootingDays;
}

// Group scenes by location and sort locations by scene count
function getLocationsSortedBySceneCount(scenes: SceneRow[]) {
    // Group scenes by location
    let locationMap: Record<string, LocationGroup> = {};
    
    for (const scene of scenes) {
        const locationName = scene.location_name;
        
        if (!locationMap[locationName]) {
            locationMap[locationName] = {
                scenes: [],
                sceneCount: 0,
                hasDayScene: false
            };
        }
        
        locationMap[locationName].scenes.push(scene);

        // increment scene count of that Location
        locationMap[locationName].sceneCount = (locationMap[locationName].sceneCount || 0) + 1;

        // set the hasDayScene flag for that Location true if a scene in that Location is a day Scene
        if (scene.time_of_day == "DAY"){
            locationMap[locationName].hasDayScene = true;
        }

    }

    // Object Entries
    const entries = Object.entries(locationMap);

    // Split based on has day scenes or not
    const withDayScene = entries.filter(([, value]) => value.hasDayScene);
    const withoutDayScene = entries.filter(([, value]) => !value.hasDayScene);

    // Sort each group by sceneCount
    withDayScene.sort((a, b) => b[1].sceneCount - a[1].sceneCount);
    withoutDayScene.sort((a, b) => b[1].sceneCount - a[1].sceneCount);

    // Concatenate
    locationMap = Object.fromEntries([
    ...withDayScene,
    ...withoutDayScene
    ])

    return locationMap;

}

// Sort scenes within a location by sub-location (most scenes first)
function sortSubLocationsBySceneCount(locationScenes: SceneRow[]) {
    let subLocationSceneCount: Record<string, {sceneCount: number, hasDayScene: boolean}> = {};
    const sortedScenes = [];

    // Count scenes per sub-location
    locationScenes.forEach(scene => {

        const subLocationName = scene.sub_location_name;
        if (!subLocationSceneCount[subLocationName]) {
            subLocationSceneCount[subLocationName] = {
                sceneCount: 0,
                hasDayScene: false
            };
        }

        // increment scene count of that subLocation
        subLocationSceneCount[subLocationName].sceneCount = (subLocationSceneCount[subLocationName].sceneCount || 0) + 1;
        
        // set the hasDayScene flag for that subLocation true if a scene in that subLocation is a day Scene
        if (scene.time_of_day == "DAY"){
            subLocationSceneCount[subLocationName].hasDayScene = true;
        }    
    
    });


    // Object Entries
    const entries = Object.entries(subLocationSceneCount);

    // Split based on has day scenes or not
    const withDayScene = entries.filter(([, value]) => value.hasDayScene);
    const withoutDayScene = entries.filter(([, value]) => !value.hasDayScene);

    // Sort each group by sceneCount
    withDayScene.sort((a, b) => b[1].sceneCount - a[1].sceneCount);
    withoutDayScene.sort((a, b) => b[1].sceneCount - a[1].sceneCount);

    // Concatenate
    subLocationSceneCount = Object.fromEntries([
    ...withDayScene,
    ...withoutDayScene
    ])


    // Process each sub-location in order
    for (const subLocationName in subLocationSceneCount) {
        const subLocationScenes = locationScenes.filter(scene => 
            scene.sub_location_name === subLocationName
        );
        
        const sortedSubLocationScenes = sortScenesByLocationType(subLocationScenes);
        sortedScenes.push(...sortedSubLocationScenes);
    }

    return sortedScenes;
}

// Sort scenes by location type and time of day
function sortScenesByLocationType(scenes: SceneRow[]) {
    const sortedScenes = [];

    // Order of preference for scheduling:
    // 1. EXT + DAY/EVENING
    sortedScenes.push(...scenes.filter(scene => 
        scene.location_type === "EXT" && 
        (scene.time_of_day === "DAY" || scene.time_of_day === "EVENING")
    ));
    
    // 2. INT + DAY/EVENING
    sortedScenes.push(...scenes.filter(scene => 
        scene.location_type === "INT" && 
        (scene.time_of_day === "DAY" || scene.time_of_day === "EVENING")
    ));
    
    // 3. INT + NIGHT
    sortedScenes.push(...scenes.filter(scene => 
        scene.location_type === "INT" && 
        scene.time_of_day === "NIGHT"
    ));
    
    // 4. EXT + NIGHT
    sortedScenes.push(...scenes.filter(scene => 
        scene.location_type === "EXT" && 
        scene.time_of_day === "NIGHT"
    ));

    // 5. All other scenes
    const knownSceneIds = new Set(sortedScenes.map(scene => scene.scene_number));
    const otherScenes = scenes.filter(scene => !knownSceneIds.has(scene.scene_number));
    
    sortedScenes.push(...otherScenes);
    
    return sortedScenes;
}


export async function POST(req: Request) {
  try {
    const {scriptId} = await req.json();

    const { data, error } = await supabase
    .from('Scripts')
    .select('script')
    .eq('id', scriptId)
    .single(); // 👈 key part

    if (error || !data?.script) {
    throw new Error('Script not found');
    }

    const scheduled = scheduleScenes(data.script, 10);

    await supabase
    .from('Scripts')
    .update({ scheduled_script: scheduled })
    .eq('id', scriptId);

    return new Response(
      JSON.stringify({ success: true }), // convert object to JSON
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in POST handler:", error);
    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}