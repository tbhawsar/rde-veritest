import React, { useEffect, useState } from "react"
import './css/App.css';
import StartStopButton from './components/StartStopButton'

const App = () => {

    let watchPos;
    // let [stopWatch2, setStopWatch2] = useState(false);


    function startWatch() {
      if ("geolocation" in navigator && "getCurrentPosition" in navigator.geolocation) {
        watchPos = navigator.geolocation.getCurrentPosition(setPosition, positionError, {
          enableHighAccuracy: true,
          maximumAge: 0
        });
      } else {
        console.log("Geolocation not available!")
      }

    };

    // setStopWatch2(stopWatch2 = true);

    let coordinates = [];

    let [speed, setSpeed] = useState(0);
    let [altitude, setAltitude] = useState(0);
    // let [distance, setDistance] = useState(0);
    let [latitude, setLatitude] = useState(0);
    let [longitude, setLongitude] = useState(0);


    function setPosition(pos) {

        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setAltitude(pos.coords.altitude);
        setSpeed(pos.coords.speed);

        coordinates.push([latitude, longitude, altitude, speed]);
        console.log(coordinates);
        console.log(localStorage.setItem("coordinates", JSON.stringify(coordinates)));
    }

    // function stopWatch() {
    //   navigator.geolocation.clearWatch(watchPos);
    //   watchPos = undefined;
    //   console.log("Tracking Stopped.")
    //   console.log(coordinates);
    // }

    function positionError(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                console.error("User denied Geolocation request.");
                break;
            case error.POSITION_UNAVAILABLE:
                console.error("Position unavailable.");
                break;
            case error.TIMEOUT:
                console.error("Request timed out.");
                break;
            case error.UNKNOWN_ERROR:
                console.error("An unknown error occured.");
                break;
            default:
                console.warn('ERROR(' + error.code + '): ' + error.message);
                break;
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1 className="App-title">RDE VeriTest (Dev)</h1>
                <div>
                    <StartStopButton startWatch={handleStart} stopWatch={handleReset} />
                </div>
                <div className="Data-Label">speed is: {speed} [km/h]</div>
                {/* <div className="Data-Label">time is: {time} [hh:mm:ss]</div> */}
                <div className="Data-Label">cumulative distance is: ___ [km]</div>
                <div className="Data-Label">altitude is: {altitude} [m]</div>
                <div className="Data-Label">latitude is: {latitude} [&deg;]</div>
                <div className="Data-Label">longitude is: {longitude} [&deg;]</div>
                <p>Timer: {timer}</p>
            </header>
        </div>
    );

};

export default App;
