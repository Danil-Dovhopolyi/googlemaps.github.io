import checkMarkerInPreviousQuests from "../../services/markerService/checkMarkerInPreviousQuests";
import createNewMarker from "../../services/markerService/createNewMaker";
import { CustomMarker } from "../../types/CustomMarker";
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

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numerical = Object.keys(markers).length + 1;
    const key = `${alphabet[numerical - 1]}${numerical}`;

    const markerFound = await checkMarkerInPreviousQuests(
      currentQuest,
      key,
      newPosition,
      database,
    );

    if (!markerFound) {
      // Create a new marker and associate it with the current quest
      await createNewMarker(
        key,
        newPosition,
        map,
        setMarkers,
        currentQuest,
        database,
        markers,
      );
    }
  }
};

export default handleMapClick;
