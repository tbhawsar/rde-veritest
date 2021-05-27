import React, { useState } from "react";
import useInterval from "../hooks/useInterval";
import StartStopButton from "./StartStopButton";
import Timer from 'react-compound-timer'

const haversine = require('haversine')

function WatchTracker() {
  let id, options;

  let urbanMax = 33;
  let ruralMax = 55;
  let motorwayMax = 80;

  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [gpsSpeed, setGpsSpeed] = useState(0);
  const [altitude, setAltitude] = useState(0);
  const [timestamp, setTimestamp] = useState(0);

  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [displaySpd, setDisplaySpd] = useState(0);

  const [urbanDist, setUrbanDist] = useState(0);
  const [ruralDist, setRuralDist] = useState(0);
  const [motorwayDist, setMotorwayDist] = useState(0);

  const [urbanShare, setUrbanShare] = useState(0);
  const [ruralShare, setRuralShare] = useState(0);
  const [motorwayShare, setMotorwayShare] = useState(0);

  const [phase, setPhase] = useState("Pre-Test");

  const [testPass, setTestPass] = useState("FAIL");

  const [coordinates, setCoordinates] = useState([0, 0, 0, 0, 0, 0, 0]);

  const [index, setIndex] = useState(0);

  const [isOn, setIsOn] = useState(false);

  function success(pos) {

    setLatitude(pos.coords.latitude);
    setLongitude(pos.coords.longitude);
    setAccuracy(pos.coords.accuracy);
    // setGpsSpeed(Math.round(pos.coords.speed * 100) / 100);
    setGpsSpeed(pos.coords.speed);
    setAltitude(pos.coords.altitude);
    setTimestamp(pos.timestamp);

  }

  useInterval(() => {
    setGpsSpeed((gpsSpeed === null) ? 0 : gpsSpeed); // set to 0 to mask null value
    setCoordinates(
      coordinates.concat(...[
        latitude,
        longitude,
        altitude,
        speed,
        gpsSpeed,
        timestamp,
        accuracy
      ])
    )

    if (speed === 0 && isOn === false) {
      setPhase("Pre-Test")
    } else if (speed < urbanMax) {
      setPhase("U");
    } else if (speed < ruralMax) {
      setPhase("R");
    } else if (speed < motorwayMax) {
      setPhase("M")
    } else {
      setPhase("EXTREME")
    }

    console.log(JSON.stringify(coordinates));
    localStorage.setItem("coordinates", JSON.stringify(coordinates));

    // log lats and longs (new):
    // console.log("🔃 " + latitude)
    // console.log("🔁 " + longitude)

    let end = {
      latitude: latitude,
      longitude: longitude,
    }

    let oldLat = coordinates[index];
    let oldLng = coordinates[index + 1];

    setIndex(i => i + 7)

    let start = {
      latitude: oldLat,
      longitude: oldLng,
    }

    // log lats and longs (old):
    // console.log("🔃old " + start.latitude)
    // console.log("🔁old " + start.longitude)

    let havDis = haversine(start, end, { unit: 'km' })

    if (start.latitude === 0 && start.longitude === 0) {
      return
    }

    setDistance(prev => prev + havDis);

    // log cumulative distance:
    console.log("💨 " + distance);

    let startTime = coordinates[index - 2];
    let endTime = timestamp;
    let deltaT = (endTime - startTime) / 3.6e+6; // ms -> hr;
    deltaT = (deltaT === 0) ? 1 : deltaT; // set to 1 to mask NaN error

    console.log("⏳ " + deltaT)

    setSpeed(havDis / deltaT);
    let displaySpd = Math.round((havDis / deltaT) * 10) / 10 // round to 1dp
    setDisplaySpd(displaySpd);

    if (speed < urbanMax) {
      setUrbanDist(prev => prev + havDis);
    } else if (speed < ruralMax) {
      setRuralDist(prev => prev + havDis);
    } else if (speed < motorwayMax) {
      setMotorwayDist(prev => prev + havDis)
    } else if (speed > motorwayMax) {
      // console.log("Max Speed Exceeded!")
      setTestPass("FAIL");
    }

    setUrbanShare(distance === 0 ? 0 : Math.round((urbanDist / distance) * 100));
    setRuralShare(distance === 0 ? 0 : Math.round((ruralDist / distance) * 100));
    setMotorwayShare(distance === 0 ? 0 : Math.round((motorwayDist / distance) * 100));

  }, isOn ? 2000 : null
  )

  function error(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
  }

  options = {
    enableHighAccuracy: true,
    maximumAge: 0
  };

  function startWatch() {
    // console.log("Starting Watch.")
    if ("geolocation" in navigator && "watchPosition" in navigator.geolocation) {
      id = navigator.geolocation.watchPosition(success, error, options);
    } else {
      console.log("Geolocation not available.")
    }
  }

  function stopWatch() {
    // console.log("Stopping Watch.");
    navigator.geolocation.clearWatch(id);
    setDistance(0);
  }

  return (
    <React.Fragment>
      <div>[TEST F]</div>
      <Timer
        initialTime={0}
        startImmediately={false}
        onStart={() => {
          // console.log('onStart hook');
          startWatch();
          setIsOn(true);
        }}
        onStop={() => {
          // console.log('onStop hook');
          stopWatch();
          setIsOn(false);
          setPhase("Post-Test");
        }}
        onReset={() => {
          // console.log('onReset hook')
          stopWatch();
          setIsOn(false);
          setCoordinates([0, 0, 0, 0, 0, 0, 0]);
          setIndex(0);
          setUrbanDist(0);
          setRuralDist(0);
          setMotorwayDist(0);
          setUrbanShare(0);
          setRuralShare(0);
          setMotorwayShare(0);
          setAccuracy(0);
          setSpeed(0);
          setGpsSpeed(0);
          setPhase("Pre-Test");
          console.log("Reset.")
          // localStorage.setItem("coordinates", JSON.stringify(coordinates));
        }}
      >
        {({ start, resume, pause, stop, reset, timerState }) => (
          <React.Fragment>
            <Timer.Hours /> Hrs&nbsp;
            <Timer.Minutes /> Min&nbsp;
            <Timer.Seconds /> Sec&nbsp;
            <StartStopButton startWatch={start} stopWatch={stop} resetWatch={reset} />
            <button onClick={reset}>Reset</button>
          </React.Fragment>
        )}
      </Timer>
      <div>Speed (GPS, Derived) [km/h]:</div>
      <div className="Data-Label">{gpsSpeed}</div>
      <div className="Data-Label">{displaySpd}</div>
      <div>Distance Shares (U,R,M) [km]:</div>
      <div className="Data-Label">{urbanDist}, {ruralDist}, {motorwayDist}</div>
      <div>Trip segment (U,R,M):</div>
      <div className="Data-Label">
        {phase}
      </div>
      <div>% Shares (U,R,M) [km]:</div>
      <div className="Data-Label">{urbanShare}, {ruralShare}, {motorwayShare}</div>
      <div>GPS Accuracy [m]:</div>
      <div className="Data-Label">{accuracy === null ? 0 : Math.round(accuracy)}</div>
      <div>Test Status (P/F):</div>
      <div className="Data-Label">{testPass}</div>
    </React.Fragment>
  )

}

export default WatchTracker