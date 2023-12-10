import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, DataSnapshot, remove } from "firebase/database";
import { handleMarkerDragEnd } from "../../utils/markerUtils/handleMarkerDragEnd";
import { firebaseConfig } from "../../config/IfirebaseConfig";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export const loadMarkersFromFirebase = (
  currentQuest: number,
  map: google.maps.Map | null,
  setMarkers: Function,
  markers: { [key: string]: google.maps.Marker },
) => {
  Object.values(markers).forEach((marker) => {
    marker.setMap(null);
  });
  const markersRef = ref(database, `Quests/Quest${currentQuest}`);
  get(markersRef)
    .then((snapshot: DataSnapshot) => {
      const markersData = snapshot.val();
      if (markersData) {
        const newMarkers: { [key: string]: google.maps.Marker } = {};
        Object.keys(markersData).forEach((key) => {
          const markerData = markersData[key];
          const position = markerData.Location;
          const marker = new window.google.maps.Marker({
            position: {
              lat: position.lat,
              lng: position.lng,
            },
            map,
            label: key,
            draggable: true,
          });

          newMarkers[key] = marker;
        });

        // Set markers retrieved from Firebase
        setMarkers(newMarkers);

        // Attach dragend listeners for all markers
        attachDragEndListeners(newMarkers, setMarkers, currentQuest);
      }
    })
    .catch((error) => {
      console.error("Error fetching markers:", error);
    });
};

const attachDragEndListeners = (
  markers: { [key: string]: google.maps.Marker },
  setMarkers: Function,
  currentQuest: number,
) => {
  Object.keys(markers).forEach((key) => {
    const marker = markers[key];

    marker.addListener("dragend", (event: any) => {
      handleMarkerDragEnd(
        key,
        event,
        markers,
        setMarkers,
        currentQuest,
        database,
      );
    });
  });
};
