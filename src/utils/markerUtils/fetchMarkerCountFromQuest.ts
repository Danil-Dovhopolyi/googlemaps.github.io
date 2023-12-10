import { DataSnapshot, get, ref } from "firebase/database";

export const fetchMarkerCountForCurrentQuest = async (
  currentQuest: number,
  database: any,
): Promise<number> => {
  try {
    const markersRef = ref(database, `Quests/Quest${currentQuest}`);
    const snapshot = await get(markersRef);

    const markersArray: any[] = []; // Array to hold markers

    snapshot.forEach((childSnapshot) => {
      markersArray.push(childSnapshot.val()); // Push marker data into the array
    });

    const markerCount = markersArray.length; // Get count of markers in the array

    return markerCount;
  } catch (error) {
    console.error("Error fetching marker count:", error);
    throw error;
  }
};
