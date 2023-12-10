import { ref, set } from "firebase/database";
import { handleMarkerDragEnd } from "../../utils/markerUtils/handleMarkerDragEnd";
import { CustomMarker } from "../../types/CustomMarker";

export const createNewMarker = (
  key: string,
  newPosition: google.maps.LatLng,
  map: google.maps.Map | null,
  setMarkers: Function,
  currentQuest: number,
  database: any,
  markers: { [key: string]: CustomMarker },
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

    const newQuestMarkerRef = ref(
      database,
      `Quests/Quest${currentQuest}/${key}/Location`,
    );
    set(newQuestMarkerRef, {
      lat: newPosition.lat(),
      lng: newPosition.lng(),
    });

    setMarkers((prevMarkers: { [key: string]: CustomMarker }) => ({
      ...prevMarkers,
      [key]: newMarker,
    }));
  }
};

export default createNewMarker;
