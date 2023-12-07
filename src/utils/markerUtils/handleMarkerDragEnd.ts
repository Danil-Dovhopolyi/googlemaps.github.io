import { DataSnapshot, get, ref, set } from "firebase/database";

export const handleMarkerDragEnd = (
  markerKey: string,
  position: google.maps.LatLng,
  markers: { [key: string]: google.maps.Marker },
  setMarkers: Function,
  currentQuest: number,
  database: any,
) => {
  const updatedMarkers = { ...markers };
  updatedMarkers[markerKey].setPosition(position);
  setMarkers(updatedMarkers);

  let markerUpdated = false;

  for (let i = 1; i < currentQuest; i++) {
    const questRef = ref(database, `Quests/Quest${i}/${markerKey}/Location`);
    get(questRef)
      .then((snapshot: DataSnapshot) => {
        const markerData = snapshot.val();
        if (markerData && !markerUpdated) {
          markerUpdated = true;
          const updatedQuestMarkerRef = ref(
            database,
            `Quests/Quest${i}/${markerKey}/Location`,
          );
          set(updatedQuestMarkerRef, {
            lat: position.lat(),
            lng: position.lng(),
          });
        }
      })
      .catch((error) => {
        console.error("Error checking marker in previous quests:", error);
      });

    if (markerUpdated) break;
  }

  if (!markerUpdated) {
    const currentQuestMarkerRef = ref(
      database,
      `Quests/Quest${currentQuest}/${markerKey}/Location`,
    );
    get(currentQuestMarkerRef)
      .then((snapshot: DataSnapshot) => {
        const markerData = snapshot.val();
        if (markerData) {
          const updatedQuestMarkerRef = ref(
            database,
            `Quests/Quest${currentQuest}/${markerKey}/Location`,
          );
          set(updatedQuestMarkerRef, {
            lat: position.lat(),
            lng: position.lng(),
          });
        } else {
          console.error(
            `Marker ${markerKey} doesn't exist in the current quest.`,
          );
        }
      })
      .catch((error) => {
        console.error("Error updating marker in the current quest:", error);
      });
  }
};
