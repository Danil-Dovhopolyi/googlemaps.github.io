import { ref, set } from "firebase/database";

const deleteAllQuests = (
  database: any,
  setMarkers: Function,
  setCurrentQuest: Function,
  setMap: Function,
  markers: { [key: string]: google.maps.Marker },
) => {
  const questsRef = ref(database, "Quests");
  set(questsRef, null)
    .then(() => {
      console.log("All quests deleted successfully!");
      Object.values(markers).forEach((marker) => {
        if (marker) {
          marker.setMap(null);
        }
      });
      setMarkers({});
      setCurrentQuest(1);
    })
    .catch((error) => {
      console.error("Error deleting quests:", error);
    });
};

export default deleteAllQuests;
