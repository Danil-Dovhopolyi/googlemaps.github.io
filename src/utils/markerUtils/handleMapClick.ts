import createNewMarker from "../../services/markerService/createNewMaker";
import { CustomMarker } from "../../types/CustomMarker";
import { fetchMarkerCountForCurrentQuest } from "./fetchMarkerCountFromQuest";
const handleMapClick = async (
  event: google.maps.MapMouseEvent,
  map: google.maps.Map | null,
  markers: { [key: string]: CustomMarker },
  setMarkers: Function,
  currentQuest: number,
  database: any,
) => {
  if (map) {
    const newPosition = event.latLng;
    if (!newPosition) return;

    try {
      const markerCount = await fetchMarkerCountForCurrentQuest(
        currentQuest,
        database,
      );

      const key = `Marker_${markerCount + 1}_Quest${currentQuest}`;

      createNewMarker(
        key,
        newPosition,
        map,
        setMarkers,
        currentQuest,
        database,
        markers,
      );
    } catch (error) {
      console.error("Error handling map click:", error);
    }
  }
};

export default handleMapClick;
