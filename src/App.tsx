import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, DataSnapshot, set, remove } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyBRyysDhXpN6DhR9oDK277Qd8aP-dDc2is",
    authDomain: "maps-1911d.firebaseapp.com",
    projectId: "maps-1911d",
    storageBucket: "maps-1911d.appspot.com",
    messagingSenderId: "287979007816",
    appId: "1:287979007816:web:b3824e9821c3941e0a8d7d",
    measurementId: "G-C3Q05K26GC"
};


initializeApp(firebaseConfig);
const database = getDatabase();

const App: React.FC = () => {
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [markers, setMarkers] = useState<{ [key: string]: google.maps.Marker }>({});
    const [currentQuest, setCurrentQuest] = useState<number>(1);

    useEffect(() => {
        loadMarkersFromFirebase();
    }, []);

    const loadMarkersFromFirebase = () => {
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

                        marker.addListener('dragend', (event:any) => {
                            const draggedMarker = event?.target;
                            if (draggedMarker) {
                                const position = draggedMarker.getPosition();
                                if (position) {
                                    handleMarkerDragEnd(key, position);
                                }
                            }
                        });

                        newMarkers[key] = marker;
                    });
                    setMarkers(newMarkers);
                }
            })
            .catch((error) => {
                console.error('Error fetching markers:', error);
            });
    };

    const handleMapLoad = (map: google.maps.Map) => {
        setMap(map);
    };
    const handleMarkerDragEnd = (markerKey: string, position: google.maps.LatLng) => {
        const updatedMarkers = { ...markers };
        updatedMarkers[markerKey].setPosition(position);
        setMarkers(updatedMarkers);

        let markerUpdated = false;

        // Check if the marker exists in any previous quests
        for (let i = 1; i < currentQuest; i++) {
            const questRef = ref(database, `Quests/Quest${i}/${markerKey}/Location`);
            get(questRef)
                .then((snapshot: DataSnapshot) => {
                    const markerData = snapshot.val();
                    if (markerData && !markerUpdated) {
                        markerUpdated = true;
                        const updatedQuestMarkerRef = ref(database, `Quests/Quest${i}/${markerKey}/Location`);
                        set(updatedQuestMarkerRef, { lat: position.lat(), lng: position.lng() });
                    }
                })
                .catch((error) => {
                    console.error('Error checking marker in previous quests:', error);
                });

            if (markerUpdated) break;
        }

        if (!markerUpdated) {
            const currentQuestMarkerRef = ref(database, `Quests/Quest${currentQuest}/${markerKey}/Location`);
            get(currentQuestMarkerRef)
                .then((snapshot: DataSnapshot) => {
                    const markerData = snapshot.val();
                    if (markerData) {
                        const updatedQuestMarkerRef = ref(database, `Quests/Quest${currentQuest}/${markerKey}/Location`);
                        set(updatedQuestMarkerRef, { lat: position.lat(), lng: position.lng() });
                    } else {
                        console.error(`Marker ${markerKey} doesn't exist in the current quest.`);
                    }
                })
                .catch((error) => {
                    console.error('Error updating marker in the current quest:', error);
                });
        }
    };



    const handleMapClick = (event: google.maps.MapMouseEvent) => {
        if (map) {
            const newPosition = event.latLng;
            if (!newPosition) return;

            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const numerical = Object.keys(markers).length + 1;
            const key = `${alphabet[numerical - 1]}${numerical}`;

            let markerFound = false;
            let questToUpdate = 0;

            // Check if the marker exists in any previous quests
            for (let i = 1; i < currentQuest; i++) {
                const questRef = ref(database, `Quests/Quest${i}/${key}/Location`);
                get(questRef)
                    .then((snapshot: DataSnapshot) => {
                        const markerData = snapshot.val();
                        if (markerData) {
                            // Marker exists in a previous quest, update its position
                            markerFound = true;
                            questToUpdate = i;
                            const updatedQuestMarkerRef = ref(database, `Quests/Quest${i}/${key}/Location`);
                            set(updatedQuestMarkerRef, { lat: newPosition.lat(), lng: newPosition.lng() });
                        }
                    })
                    .catch((error) => {
                        console.error('Error checking marker in previous quests:', error);
                    });

                if (markerFound) break;
            }

            if (!markerFound) {
                const newMarker = new window.google.maps.Marker({
                    position: newPosition,
                    label: key,
                    draggable: true,
                });

                newMarker.setMap(map);

                newMarker.addListener('dragend', (e: any) => handleMarkerDragEnd(key, e.latLng));

                setMarkers((prevMarkers) => ({
                    ...prevMarkers,
                    [key]: newMarker,
                }));

                const newQuestMarkerRef = ref(database, `Quests/Quest${currentQuest}/${key}/Location`);
                set(newQuestMarkerRef, { lat: newPosition.lat(), lng: newPosition.lng() });
            }
        }
    };





    const deleteAllQuests = () => {
        const questsRef = ref(database, 'Quests');
        set(questsRef, null)
            .then(() => {
                console.log('All quests deleted successfully!');
                Object.values(markers).forEach((marker) => {
                    if (marker) {
                        marker.setMap(null);
                    }
                });
                setMarkers({});
                setCurrentQuest(1);
            })
            .catch((error) => {
                console.error('Error deleting quests:', error);
            });
    };

    const createNextQuest = () => {
        setCurrentQuest((prevQuest) => prevQuest + 1);
    };

    return (
        <LoadScript googleMapsApiKey="AIzaSyBTq8aU0nTc86gNW9FVRbE8zxn_pNMxbhc">
            <GoogleMap
                mapContainerStyle={{ width: '100%', height: '400px' }}
                zoom={8}
                center={{ lat: 49.837363291794276, lng: 24.026272907959175 }}
                onLoad={handleMapLoad}
                onClick={handleMapClick}
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
                                    handleMarkerDragEnd(key, e.latLng);
                                }
                            }}
                        />
                    );
                })}
            </GoogleMap>
            <button onClick={createNextQuest}>Create Next Quest</button>
            <button onClick={deleteAllQuests}>Delete All Quests</button>

        </LoadScript>
    );
};

export default App;