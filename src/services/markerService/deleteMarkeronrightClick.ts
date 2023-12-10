import { ref, remove } from "firebase/database";
import { getDatabase } from "firebase/database";
import { CustomMarker } from "../../types/CustomMarker";
export const handleMarkerRightClick = (
  markerKey: string,
  currentQuest: number,
  markers: { [key: string]: CustomMarker },
  setMarkers: Function,
) => {
  console.log("Attempting to delete marker:", markerKey);

  // Find the quest associated with the marker
  const markerQuest = markers[markerKey]?.quest;

  if (markerQuest !== undefined) {
    const database = getDatabase();
    const questRef = ref(database, `Quests/Quest${markerQuest}/${markerKey}`);

    remove(questRef)
      .then(() => {
        console.log("Marker removed from Firebase");
        const updatedMarkers = { ...markers };
        delete updatedMarkers[markerKey];
        setMarkers(updatedMarkers);
      })
      .catch((error: any) => {
        console.error("Error removing marker from Firebase:", error);
      });
  } else {
    console.error(`Marker ${markerKey} not associated with any quest.`);
  }
};
