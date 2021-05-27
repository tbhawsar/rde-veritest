import React, { useEffect, useState } from "react"
import Timer from 'react-compound-timer'
import StartStopButton from './StartStopButton'
import useInterval from '../hooks/useInterval'
import { useIsMount } from './UseIsMount'
import "../css/tracker.css"
const haversine = require('haversine')

// import useSound from 'use-sound' // Leave this for adding sound notifications for later

const Tracker = () => {

    // BC variables:
    let urbanMax = 33;
    let ruralMax = 55;
    let motorwayMax = 80;

    // State Variables:
    const [delay] = useState(1000);
    const [isOn, setIsOn] = useState(false)

    // Output Data Array
    const [coordinates, setCoordinates] = useState([]);

    // Output Data
    const [speed, setSpeed] = useState(0);
    const [gpsSpeed, setGpsSpeed] = useState(0);
    const [altitude, setAltitude] = useState(0);
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const [timestamp, setTimestamp] = useState(0);
    const [distance, setDistance] = useState(0);
    const [accuracy, setAccuracy] = useState(0);

    // Trip Segment Distances
    const [slowDist, setSlowDist] = useState(0);
    const [mediumDist, setMediumDist] = useState(0);
    const [fastDist, setFastDist] = useState(0);

    // Geolocation:
    const isMount = useIsMount();

    useEffect(() => {
        if (!isMount) {
            if ("geolocation" in navigator && "watchPosition" in navigator.geolocation) {
                const id = navigator.geolocation.watchPosition(
                    (pos) => {

                        let deltaTime = (pos.timestamp - timestamp) / 3.6e+6; // ms -> hr
                        // console.log("⏳ Time Difference [hrs]: " + deltaTime)
                        // console.log("🔃 Latitude Difference: " + (pos.coords.latitude - latitude))
                        // console.log("🔁 Longitude Difference: " + (pos.coords.longitude - longitude))

                        let start = {
                            latitude: latitude,
                            longitude: longitude,
                        }

                        let end = {
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude,
                        }

                        let havDis = haversine(start, end, { unit: 'km' })
                        // console.log("💨 Distance Travelled: " + havDis)

                        deltaTime = (deltaTime === 0) ? 1 : deltaTime; // set to 1 to mask NaN error
                        let speed = (havDis / deltaTime);
                        // console.log("🏎 Calculated Speed: " + speed + "m/s")

                        // Coordinates array data:
                        setLatitude(pos.coords.latitude);
                        setLongitude(pos.coords.longitude);
                        setAltitude(pos.coords.altitude);
                        setGpsSpeed(pos.coords.speed);
                        setTimestamp(pos.timestamp);
                        setAccuracy(pos.coords.accuracy);
                        setSpeed(speed);

                        // To start logging
                        if (latitude === 0 && longitude === 0) {
                            return
                        }

                        // To stop logging
                        if (isOn === false) {
                            navigator.geolocation.clearWatch(id);
                        }

                        setDistance(prev => prev + havDis)

                        // Segment distances
                        if (speed < urbanMax) {
                            setSlowDist(prev => prev + havDis)
                        } else if (speed < ruralMax) {
                            setMediumDist(prev => prev + havDis)
                        } else if (speed < motorwayMax) {
                            setFastDist(prev => prev + havDis)
                        }

                    },

                    positionError(),

                    {
                        enableHighAccuracy: true,
                        maximumAge: 0
                    }
                );

            } else {
                console.log('Geolocation is not available.');
            }
        }

    }, [urbanMax, ruralMax, motorwayMax, latitude, longitude, timestamp, isOn, isMount])

    function positionError() {
        console.error('Error has been detected.');
    }

    useInterval(() => {
        setCoordinates(coordinates.concat([latitude, longitude, altitude, speed, gpsSpeed, timestamp, accuracy]));
        console.log(JSON.stringify(coordinates));
        localStorage.setItem("coordinates", JSON.stringify(coordinates));
    }, isOn ? delay : null)

    return (
        <div>
            <Timer
                initialTime={0}
                startImmediately={false}
                onStart={() => {
                    console.log('onStart hook');
                    setIsOn(true);
                }}
                onStop={() => {
                    console.log('onStop hook');
                    setIsOn(false);
                }}
                onReset={() => {
                    console.log('onReset hook')
                    setIsOn(false);
                    setCoordinates([]);
                    // localStorage.setItem("coordinates", JSON.stringify(coordinates));
                }}
            >
                {({ start, resume, pause, stop, reset, timerState }) => (
                    <React.Fragment>
                        <div>
                            <Timer.Hours /> Hrs&nbsp;
                            <Timer.Minutes /> Min&nbsp;
                            <Timer.Seconds /> Sec&nbsp;
                        </div>

                        <div>
                            <StartStopButton startWatch={start} stopWatch={stop} />
                            <button onClick={reset}>Reset</button>
                        </div>

                    </React.Fragment>
                )}
            </Timer >

            <div>TESTS E, F</div>
            <div> -------------- SPEED: -------------- </div>
            <div className="Data-Label">{speed} </div>
            <div className="Data-Label">GPS: {gpsSpeed} </div>
            <div> ------------------------------------- </div>
            <div>altitude is: {altitude} [m]</div>
            <div>latitude is: {latitude} [&deg;]</div>
            <div>longitude is: {longitude} [&deg;]</div>
            <div>GPS accuracy is: {accuracy} [m] </div>
            <div> ------------- BC VERIFICATION: ------------- </div>
            <div>cumulative distance is: {distance} [km]</div>
            <div>trip segment is:&nbsp;
                    {speed < urbanMax &&
                    "URBAN"
                }
                {speed > urbanMax && speed < ruralMax &&
                    "RURAL"
                }
                {speed > ruralMax && speed < motorwayMax &&
                    "MOTORWAY"
                }
                    &nbsp;[U/R/M]</div>
            {/* <div>U share is: ____ [%]</div>
            <div>R share is: ____ [%]</div>
            <div>M share is: ____ [%]</div> */}
            <div>U distance share is: {slowDist} [km]</div>
            <div>R distance share is: {mediumDist} [km]</div>
            <div>M distance share is: {fastDist} [km]</div>
        </div >
    )

}

export default Tracker

