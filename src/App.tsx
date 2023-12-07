import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { getDatabase } from "firebase/database";
import { loadMarkersFromFirebase } from "./services/FirebaseService/FirebaseService";
import { handleMarkerDragEnd } from "./utils/markerUtils/handleMarkerDragEnd";
import deleteAllQuests from "./services/questService/deleteAllQuest";
import handleMapClick from "./utils/markerUtils/handleMapClick";
import { CustomMarker } from "./types/CustomMarker";
const App: React.FC = () => {
  const database = getDatabase();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<{ [key: string]: CustomMarker }>({});
  const [currentQuest, setCurrentQuest] = useState<number>(1);

  useEffect(() => {
    loadMarkersFromFirebase(currentQuest, map, setMarkers);
  }, [currentQuest, map]);

  const handleMapLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  const onClickHandler = (event: google.maps.MapMouseEvent) => {
    handleMapClick(event, map, markers, setMarkers, currentQuest, database);
  };

  const handleDeleteAllQuests = () => {
    deleteAllQuests(database, setMarkers, setCurrentQuest, setMap, markers);
  };

  const createNextQuest = () => {
    const markersForCurrentQuest = Object.values(markers).filter(
      (marker) => marker.quest === currentQuest,
    );

    if (markersForCurrentQuest.length < 1) {
      return;
    }

    setCurrentQuest((prevQuest) => prevQuest + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <LoadScript googleMapsApiKey="AIzaSyBTq8aU0nTc86gNW9FVRbE8zxn_pNMxbhc">
        <div className="w-9/12 h-3/4 overflow-hidden border-2 border-gray-300 shadow-lg">
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            zoom={8}
            center={{ lat: 49.837363291794276, lng: 24.026272907959175 }}
            onLoad={handleMapLoad}
            onClick={onClickHandler}
          >
            {Object.keys(markers).map((key) => {
              const marker = markers[key];
              if (!marker) return null;

              const position = marker.getPosition();
              if (!position) return null;

              const markerPosition = position.toJSON();

              if (!markerPosition) return null;

              const { lat, lng } = markerPosition;

              return (
                <Marker
                  key={key}
                  position={{ lat, lng }}
                  label={key}
                  draggable={true}
                  onDragEnd={(e) => {
                    if (e.latLng) {
                      handleMarkerDragEnd(
                        key,
                        e.latLng,
                        markers,
                        setMarkers,
                        currentQuest,
                        database,
                      );
                    }
                  }}
                />
              );
            })}
          </GoogleMap>
        </div>
        <div className="mt-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
            onClick={createNextQuest}
          >
            Create Next Quest
          </button>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleDeleteAllQuests}
          >
            Delete All Quests
          </button>
        </div>
      </LoadScript>
    </div>
  );
};

export default App;
