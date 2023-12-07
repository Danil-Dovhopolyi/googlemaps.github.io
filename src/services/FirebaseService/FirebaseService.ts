import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, DataSnapshot } from "firebase/database";
import { handleMarkerDragEnd } from "../../utils/markerUtils/handleMarkerDragEnd";
import { firebaseConfig } from "../../config/IfirebaseConfig";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export const loadMarkersFromFirebase = (
  currentQuest: number,
  map: google.maps.Map | null,
  setMarkers: Function,
) => {
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

          marker.addListener("dragend", (event: any) => {
            createDragEndHandler(
              key,
              event,
              newMarkers,
              setMarkers,
              currentQuest,
              database,
            );
          });

          newMarkers[key] = marker;
        });
        setMarkers(newMarkers);
      }
    })
    .catch((error) => {
      console.error("Error fetching markers:", error);
    });

  const createDragEndHandler = (
    markerKey: string,
    event: any,
    markers: { [key: string]: google.maps.Marker },
    setMarkers: Function,
    currentQuest: number,
    database: any,
  ) => {
    const draggedMarker = event?.target;
    if (draggedMarker) {
      const position = draggedMarker.getPosition();
      if (position) {
        handleMarkerDragEnd(
          markerKey,
          position,
          markers,
          setMarkers,
          currentQuest,
          database,
        );
      }
    }
  };
};
