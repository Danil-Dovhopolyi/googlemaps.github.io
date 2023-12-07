import { ref, get, set } from "firebase/database";

const checkMarkerInPreviousQuests = async (
  currentQuest: number,
  key: string,
  newPosition: google.maps.LatLng,
  database: any,
) => {
  let markerFound = false;

  for (let i = 1; i < currentQuest; i++) {
    const questRef = ref(database, `Quests/Quest${i}/${key}/Location`);

    try {
      const snapshot = await get(questRef);
      const markerData = snapshot.val();

      if (markerData) {
        markerFound = true;
        const updatedQuestMarkerRef = ref(
          database,
          `Quests/Quest${i}/${key}/Location`,
        );
        await set(updatedQuestMarkerRef, {
          lat: newPosition.lat(),
          lng: newPosition.lng(),
        });
        break;
      }
    } catch (error) {
      console.error("Error checking marker in previous quests:", error);
    }
  }

  return markerFound;
};

export default checkMarkerInPreviousQuests;
