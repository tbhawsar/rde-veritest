import React, { useState } from "react"
import Timer from 'react-compound-timer'
import StartStopButton from './StartStopButton'
import useInterval from '../hooks/useInterval'
// import "../css/tracker.css"

const haversine = require('haversine')

// import useSound from 'use-sound' // Leave this for adding sound notifications for later

// BC variables:
let urbanMax = 33;
let ruralMax = 55;
let motorwayMax = 80;

const Tracker = () => {

    const [delay] = useState(1000);
    const [isOn, setIsOn] = useState(false)

    const [coordinates, setCoordinates] = useState([]);

    const [speed, setSpeed] = useState(0);
    const [gpsSpeed, setGpsSpeed] = useState(0);
    const [altitude, setAltitude] = useState(0);
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const [timestamp, setTimestamp] = useState(0);
    const [distance, setDistance] = useState(0);
    const [accuracy, setAccuracy] = useState(0);

    const [slowDist, setSlowDist] = useState(0);
    const [mediumDist, setMediumDist] = useState(0);
    const [fastDist, setFastDist] = useState(0);


    useInterval(() => {
        if ("geolocation" in navigator && "getCurrentPosition" in navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {

                    let deltaTime = (pos.timestamp - timestamp) / 3.6e+6; // ms -> hr
                    // console.log("⏳ Time Difference: " + deltaTime)
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

                    setLatitude(pos.coords.latitude);
                    setLongitude(pos.coords.longitude);
                    setAltitude(pos.coords.altitude);
                    setSpeed(speed);
                    setGpsSpeed(pos.coords.speed);
                    setTimestamp(pos.timestamp);
                    setAccuracy(pos.coords.accuracy);

                    // start logging

                    if (latitude === 0 && longitude === 0) {
                        return
                    }

                    setDistance(prev => prev + havDis)

                    if (speed < 33) {
                        setSlowDist(prev => prev + havDis)
                    } else if (speed < 55) {
                        setMediumDist(prev => prev + havDis)
                    } else if (speed < 80) {
                        setFastDist(prev => prev + havDis)
                    }

                    setCoordinates(coordinates.concat([latitude, longitude, altitude, speed, timestamp, accuracy]));
                    console.log(JSON.stringify(coordinates));
                    localStorage.setItem("coordinates", JSON.stringify(coordinates));

                },
                () => { console.log('couldnt be bothered to correctly capture the error so... here you are') }
                , {
                    enableHighAccuracy: false,
                    maximumAge: 0
                });
        } else {
            console.log("Geolocation not available!")
        }
    },
        isOn ? delay : null,
    )

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
            <div>TESTS C, D</div>
            <div> ------------- RAW DATA: ------------- </div>
            <div className="Data-Label">speed is: {speed} [km/h]</div>
            <div className="Data-Label">GPS speed is: {gpsSpeed} [km/h]</div>
            <div> ------------------------------------- </div>
            <div>altitude is: {altitude} [m]</div>
            <div>latitude is: {latitude} [&deg;]</div>
            <div>longitude is: {longitude} [&deg;]</div>
            <div>GPS accuracy is: {accuracy} [m] </div>
            <div> ------------- BC VERIFICATION: ------------- </div>
            <div>cumulative distance is: {distance} [km]</div>
            <div>trip segment is:&nbsp;
                    {speed < urbanMax &&
                    "U"
                }
                {speed > urbanMax && speed < ruralMax &&
                    "R"
                }
                {speed > ruralMax && speed < motorwayMax &&
                    "M"
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
