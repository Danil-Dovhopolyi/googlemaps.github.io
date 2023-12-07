import { ref, set } from "firebase/database";
import { handleMarkerDragEnd } from "../../utils/markerUtils/handleMarkerDragEnd";
import { CustomMarker } from "../../types/CustomMarker";
export const createNewMarker = async (
  key: string,
  newPosition: google.maps.LatLng,
  map: google.maps.Map | null,
  setMarkers: Function,
  currentQuest: number,
  database: any,
  markers: { [key: string]: google.maps.Marker },
) => {
  const newMarker = new window.google.maps.Marker({
    position: newPosition,
    label: key,
    draggable: true,
  }) as CustomMarker;

  newMarker.quest = currentQuest;

  if (map) {
    newMarker.setMap(map);

    newMarker.addListener("dragend", (e: any) => {
      handleMarkerDragEnd(
        key,
        e.latLng,
        markers,
        setMarkers,
        currentQuest,
        database,
      );
    });

    setMarkers((prevMarkers: any) => ({
      ...prevMarkers,
      [key]: newMarker,
    }));

    const newQuestMarkerRef = ref(
      database,
      `Quests/Quest${currentQuest}/${key}/Location`,
    );
    await set(newQuestMarkerRef, {
      lat: newPosition.lat(),
      lng: newPosition.lng(),
    });
  }
};

export default createNewMarker;
