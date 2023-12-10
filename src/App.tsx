import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { loadMarkersFromFirebase } from "./services/FirebaseService/FirebaseService";
import { handleMarkerDragEnd } from "./utils/markerUtils/handleMarkerDragEnd";
import deleteAllQuests from "./services/questService/deleteAllQuest";
import handleMapClick from "./utils/markerUtils/handleMapClick";
import { CustomMarker } from "./types/CustomMarker";
import { getDatabase, ref, remove, get, child } from "firebase/database";
import { handleMarkerRightClick } from "./services/markerService/deleteMarkeronrightClick";

const App: React.FC = () => {
  const database = getDatabase();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<{ [key: string]: CustomMarker }>({});
  const [currentQuest, setCurrentQuest] = useState<number>(() => {
    const savedQuest = localStorage.getItem("currentQuest");
    return savedQuest ? Number(savedQuest) : 1;
  });
  const [totalQuests, setTotalQuests] = useState<number>(0);
  const [isLastQuest, setIsLastQuest] = useState<boolean>(false);

  useEffect(() => {
    loadMarkersFromFirebase(currentQuest, map, setMarkers, markers);
  }, [currentQuest, map]);

  useEffect(() => {
    localStorage.setItem("currentQuest", String(currentQuest));
  }, [currentQuest]);

  useEffect(() => {
    const questsRef = ref(database, "/Quests");
    get(child(questsRef, "/"))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const quests = snapshot.val();
          const questsCount = Object.keys(quests).length;
          setTotalQuests(questsCount);
          setIsLastQuest(currentQuest >= questsCount);
        }
      })
      .catch((error) => {
        console.error("Error fetching quests:", error);
      });
  }, [database, currentQuest]);
  useEffect(() => {
    setIsLastQuest(currentQuest >= totalQuests);
  }, [currentQuest, totalQuests]);
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
  const goToPreviousQuest = () => {
    if (currentQuest > 1) {
      setCurrentQuest((prevQuest) => prevQuest - 1);
    }
  };
  const goToNextQuest = () => {
    if (currentQuest < totalQuests) {
      setCurrentQuest((prevQuest) => prevQuest + 1);
    } else {
      console.log("This is the last quest!");
    }
  };
  console.log(currentQuest, totalQuests, isLastQuest);
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

              const position = marker.getPosition()?.toJSON();

              if (!position) return null;

              const { lat, lng } = position;
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
                  onRightClick={() =>
                    handleMarkerRightClick(
                      key,
                      currentQuest,
                      markers,
                      setMarkers,
                    )
                  }
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
            className={`bg-green-900 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4 ${
              currentQuest === 1
                ? "bg-gray-400 cursor-not-allowed opacity-50"
                : ""
            }`}
            onClick={goToPreviousQuest}
            disabled={currentQuest === 1}
          >
            Go to Previous Quest
          </button>
          <button
            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-4 mt-2 ${
              isLastQuest ? "bg-gray-400 cursor-not-allowed opacity-50" : ""
            }`}
            onClick={goToNextQuest}
            disabled={isLastQuest}
          >
            Go to Next Quest
          </button>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleDeleteAllQuests}
          >
            Delete All Quests
          </button>
          <div className="mt-4">
            <p className="text-xl font-semibold">
              Current Quest: {currentQuest}
            </p>
          </div>
        </div>
      </LoadScript>
    </div>
  );
};

export default App;
