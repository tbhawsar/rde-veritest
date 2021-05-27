import React, { useState } from "react";
import useInterval from "../hooks/useInterval";
import StartStopButton from "./StartStopButton";
import Timer from "react-compound-timer";

import Sound from "react-sound";
import startSound from "../sounds/start.mp3"
import stopSound from "../sounds/stop.mp3"
import failSound from "../sounds/failSoftShort.mp3"
import passSound from "../sounds/pass.mp3"

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
// import { createMuiTheme } from '@material-ui/core/styles';
import MyModal from './MyModal'

// import { ReactComponent as Ruler } from '../assets/ruler.svg';
import { ReactComponent as Percent } from '../assets/percent.svg';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignContent: 'center',
    alignItems: 'center',
    // padding: '0 5em',
    textAlign: 'center',
    maxWidth: 444,
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  gridItem: {
    padding: '5px !important',
  },
  insideGridItem: {
    boxShadow: '0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)',
    backgroundColor: '#2c384e',
    margin: 0.1,
    padding: '12px !important',
    fontSize: 'large',
  },
  grid: {
    padding: '1em',
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

const haversine = require('haversine')

function WatchTracker() {
  // Sounds
  const [startPlaying, setStartPlaying] = useState(false);
  const [stopPlaying, setStopPlaying] = useState(false);
  const [passPlaying, setPassPlaying] = useState(false);
  const [failPlaying, setFailPlaying] = useState(false);

  let id, options;

  // BCs
  let dataRate = 500; //[ms]

  let urbanMax = 33;
  let ruralMax = 55;
  let motorwayMax = 80;

  let uMaxShare = 60; //[%]
  let uMinShare = 5;
  let rMaxShare = 40;
  let rMinShare = 5;
  let mMaxShare = 40;
  let mMinShare = 5;

  let urmMinDist = 0.2; //[km]

  let maxAltChange = 100; //[m]

  let maxTestTime = 15; //[min]
  let minTestTime = 6; //[min]

  const [minTimeReached, setMinTimeReached] = useState(false);
  const [maxTimeReached, setMaxTimeReached] = useState(false);

  let idleTime = 200; //[s]
  const [idleIndex, setIdleIndex] = useState(0); //[s]

  let coldStartEnd = 1; //[min]
  const [isColdStart, setIsColdStart] = useState(true);

  // Data
  const [coordinates, setCoordinates] = useState([0, 0, 0, 0, 0, 0, 0]);

  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [gpsSpeed, setGpsSpeed] = useState(0);
  const [altitude, setAltitude] = useState(0);
  const [timestamp, setTimestamp] = useState(0);

  const [startAlt, setStartAlt] = useState(0);
  const [endAlt, setEndAlt] = useState(0);

  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);

  const [urbanDist, setUrbanDist] = useState(0);
  const [ruralDist, setRuralDist] = useState(0);
  const [motorwayDist, setMotorwayDist] = useState(0);

  const [urbanShare, setUrbanShare] = useState(0);
  const [ruralShare, setRuralShare] = useState(0);
  const [motorwayShare, setMotorwayShare] = useState(0);

  // Phases 
  // const [phase, setPhase] = useState("Pre-Test");

  const [testStatus, setTestStatus] = useState(0);

  // 0 = PRE-TEST
  // 1 = IN PROGRESS
  // 2 = PASS
  // 3 = FAIL 
  const errorStatus = [
    "MAX IDLING TIME!",
    "MAX SPEED!",
    "HIGH TIME!",
    "LOW TIME!",
    "U MIN DISTANCE!",
    "R MIN DISTANCE!",
    "M MIN DISTANCE!",
    "U MIN SHARE!",
    "R MIN SHARE!",
    "M MIN SHARE!",
    "U MAX SHARE!",
    "R MAX SHARE!",
    "M MAX SHARE!",
    "MAX ALTITUDE!",
  ]

  // Failure Switches
  const [error4, setError4] = useState(false);
  const [error5, setError5] = useState(false);
  const [error6, setError6] = useState(false);
  const [error7, setError7] = useState(false);
  const [error8, setError8] = useState(false);
  const [error9, setError9] = useState(false);
  const [error10, setError10] = useState(false);
  const [error11, setError11] = useState(false);
  const [error12, setError12] = useState(false);
  const [error13, setError13] = useState(false);
  const [error14, setError14] = useState(false);
  const [error15, setError15] = useState(false);
  const [error16, setError16] = useState(false);
  const [error17, setError17] = useState(false);

  // Indexes and Switches
  const [index, setIndex] = useState(0);
  const [isOn, setIsOn] = useState(false);

  function success(pos) {
    setLatitude(pos.coords.latitude);
    setLongitude(pos.coords.longitude);
    setAccuracy(pos.coords.accuracy);
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
    // console.log("💨 " + distance);

    let startTime = coordinates[index - 2];
    let endTime = timestamp;
    let deltaT = (endTime - startTime) / 3.6e+6; // ms -> hr;
    deltaT = (deltaT === 0) ? 1 : deltaT; // set to 1 to mask NaN error

    // console.log("⏳ " + deltaT)

    if (havDis > 0) { setSpeed(havDis / deltaT) };

    if (
      speed >= 0 && speed < 1 && start.latitude === 0 && start.longitude === 0
    ) {
      setIdleIndex(prev => (prev + 2 * (dataRate / 1000))); // stopwatch count in [s]
    } else if (speed >= 0 && speed < 1) {
      setIdleIndex(prev => (prev + (dataRate / 1000)));
    } else if (speed > 1) {
      setIdleIndex(0.0);
    }

    // if (speed === 0 && isOn === false) {
    //   setPhase("Pre-Test")
    // } else if (isColdStart === true) {
    //   setPhase("Cold Start")
    // } else if (speed < urbanMax) {
    //   setPhase("U");
    // } else if (speed < ruralMax) {
    //   setPhase("R");
    // } else if (speed < motorwayMax) {
    //   setPhase("M")
    // } else {
    //   setPhase("EXTREME")
    // }

    if (speed < urbanMax && speed > 0) {
      setUrbanDist(prev => prev + havDis);
    }
    if (speed < ruralMax && speed > urbanMax) {
      setRuralDist(prev => prev + havDis);
    }
    if (speed < motorwayMax && speed > ruralMax) {
      setMotorwayDist(prev => prev + havDis)
    }

    setUrbanShare(distance === 0 ? 0 : (urbanDist / distance) * 100);
    setRuralShare(distance === 0 ? 0 : (ruralDist / distance) * 100);
    setMotorwayShare(distance === 0 ? 0 : (motorwayDist / distance) * 100);

    // BC VERIFICATION
    // Ordered for checking priority and code efficiency
    setTestStatus(1); // set to in-progress the beginning
    // HARD FAILURES (Break on 4, 5 and 6) 
    // Time
    if (idleIndex >= idleTime) {
      setError4(errorStatus[4 - 4]);
      setIsOn(false);
      stopWatch();
    }

    // Speed
    if (speed > motorwayMax) {
      setError5(errorStatus[5 - 4]);
      setIsOn(false);
      stopWatch();
    }

    // Time
    if (maxTimeReached) {
      setError6(errorStatus[6 - 4]);
      setIsOn(false);
      stopWatch();
    }

    // SOFT FAILURES
    // Time 
    if (!minTimeReached) {
      setError7(errorStatus[7 - 4]);
    } else setError7(false);

    // Distance [km]
    if (urbanDist < urmMinDist) {
      setError8(errorStatus[8 - 4]);
    } else setError8(false);
    if (ruralDist < urmMinDist) {
      setError9(errorStatus[9 - 4]);
    } else setError9(false);
    if (motorwayDist < urmMinDist) {
      setError10(errorStatus[10 - 4]);
    } else setError10(false);

    // Min Distance Share [%]
    if (urbanShare < uMinShare) {
      setError11(errorStatus[11 - 4]);
    } else setError11(false);
    if (ruralShare < rMinShare) {
      setError12(errorStatus[12 - 4]);
    } else setError12(false);
    if (motorwayShare < mMinShare) {
      setError13(errorStatus[13 - 4]);
    } else setError13(false);

    // Max Distance Share [%]
    if (urbanShare > uMaxShare) {
      setError14(errorStatus[14 - 4]);
    } else setError14(false);
    if (ruralShare > rMaxShare) {
      setError15(errorStatus[15 - 4]);
    } else setError15(false);
    if (motorwayShare > mMaxShare) {
      setError16(errorStatus[16 - 4]);
    } else setError16(false);

  }, isOn ? dataRate : null
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

    setStartAlt(coordinates[2]);
    setEndAlt(altitude);

    if (Math.abs(startAlt - endAlt) > maxAltChange) {
      setError17(errorStatus[17 - 4]);
    }

    if (error4 || error5 || error6 || error7 || error8 || error9 || error10 || error11 || error12 || error13 || error14 || error15 || error16 || error17) {
      setTestStatus(3)
      setFailPlaying(true);

      return;
    } else {
      setTestStatus(2)
      console.log("Test Passed.")
      setPassPlaying(true);
    }
  }

  const classes = useStyles();
  return (
    <div className={classes.root}>
      <React.Fragment>
        <Sound
          volume={75}
          playStatus={startPlaying ? Sound.status.PLAYING : Sound.status.STOPPED}
          url={startSound}
          onFinishedPlaying={() => setStartPlaying(!startPlaying)}
        />
        <Sound
          volume={75}
          playStatus={stopPlaying ? Sound.status.PLAYING : Sound.status.STOPPED}
          url={stopSound}
          onFinishedPlaying={() => setStopPlaying(!stopPlaying)}
        />
        <Sound
          volume={75}
          playStatus={passPlaying ? Sound.status.PLAYING : Sound.status.STOPPED}
          url={passSound}
          onFinishedPlaying={() => setPassPlaying(!passPlaying)}
        />
        <Sound
          volume={75}
          playStatus={failPlaying ? Sound.status.PLAYING : Sound.status.STOPPED}
          url={failSound}
          onFinishedPlaying={() => setFailPlaying(!failPlaying)}
        />
        <Timer
          initialTime={0}
          startImmediately={false}
          lastUnit="m"
          checkpoints={[
            {
              time: coldStartEnd * 60000,
              callback: () => setIsColdStart(false),
            },
            {
              time: maxTestTime * 60000,
              callback: () => setMaxTimeReached(true),
            },
            {
              time: minTestTime * 60000,
              callback: () => setMinTimeReached(true),
            }
          ]}
          onStart={() => {
            // console.log('onStart hook');
            startWatch();
            setIsOn(true);
            setTestStatus(1);
            setStartPlaying(true);
          }}
          onStop={() => {
            // console.log('onStop hook');
            stopWatch();
            setIsOn(false);
            // setPhase("Post-Test");
            setStopPlaying(true);
          }}
          onReset={() => {
            // console.log('onReset hook')
            setTestStatus(0);
            setFailPlaying(false);
            navigator.geolocation.clearWatch(id);
            setCoordinates([0, 0, 0, 0, 0, 0, 0]);
            setIndex(0);
            setIdleIndex(0);
            setUrbanDist(0);
            setRuralDist(0);
            setMotorwayDist(0);
            setUrbanShare(0);
            setRuralShare(0);
            setMotorwayShare(0);
            setAccuracy(0);
            setSpeed(0);
            setGpsSpeed(0);
            // setPhase("Pre-Test");
            setDistance(0);
            // setErrorStatusDisplay([]);
            // console.log("Reset.")
            // localStorage.setItem("coordinates", JSON.stringify(coordinates));
          }}
        >
          {({ start, resume, pause, stop, reset, timerState }) => (
            <React.Fragment>
              <Grid className={classes.grid} container spacing={3}>

                <Grid style={{ width: '90%' }} className={classes.gridItem} item xs={6}>
                  <StartStopButton startWatch={start} stopWatch={stop} resetWatch={reset} />
                </Grid>

                <Grid style={{ width: '90%' }} className={classes.gridItem} item xs={6}>
                  <Button style={{ width: 'inherit' }} variant="contained" onClick={reset} disabled={isOn}>
                    Reset
                  </Button>
                </Grid>

              </Grid>
              <Grid className={classes.grid} container spacing={3}>

                <Grid className={classes.gridItem} item xs={6}>
                  <div className={classes.insideGridItem}>
                    {/* Time
                  <br /> */}
                    <Timer.Minutes /> min&nbsp;
                  <Timer.Seconds /> sec&nbsp;
                  </div>
                </Grid>

                <Grid className={classes.gridItem} item xs={6}>
                  <div className={classes.insideGridItem}>
                    {/* Distance (km) */}
                    {/* <br /> */}
                    {distance === 0 ? 0 : Math.round(distance * 100) / 100} km
                  </div>
                </Grid>

              </Grid>
            </React.Fragment>
          )}
        </Timer>

        <Grid className={classes.grid} container spacing={3}>

          {/* <div>Speed  [km/h]/[mph] :</div> */}
          {/* <Grid className={classes.gridItem} item xs={12}>
            <div className={classes.insideGridItem}>Speed</div>
          </Grid> */}

          <Grid className={classes.gridItem} item xs={6}>
            <div className={classes.insideGridItem}>{Math.round(speed * 10) / 10} km/h</div>
          </Grid>
          <Grid className={classes.gridItem} item xs={6}>
            <div className={classes.insideGridItem}>{Math.round((speed / 1.609344498) * 10) / 10} mph</div>
          </Grid>

        </Grid>


        {/* <Grid className={classes.grid} container spacing={3}> */}

        {/* <div className="Data-Label">, </div> */}

        <div>Test Status (PASS/FAIL):</div>
        <div className="Data-Label">{testStatus === 3 && "FAIL"} {testStatus === 2 && "PASS"} {testStatus === 1 && "IN PROGRESS"} {testStatus === 0 && "Pre-Test"}</div>
        {/* <div>Failure Reason (s): </div> */}
        <div>Idling Time (s):</div>
        <div className="Data-Label">{idleIndex.toFixed(1)}</div>
        {/* </Grid> */}

        <br />
        <div>Distance Shares</div>
        <Grid className={classes.grid} container spacing={3}>

          {/* <Grid className={classes.gridItem} item xs={12}>
            <div>Distance Shares (U,R,M) [km]:</div>
          </Grid> */}
          <Grid className={classes.gridItem} item xs={3}>
            <div className={classes.insideGridItem}>_</div>
          </Grid>
          <Grid className={classes.gridItem} item xs={3}>
            <div className={classes.insideGridItem}>U</div>
          </Grid>
          <Grid className={classes.gridItem} item xs={3}>
            <div className={classes.insideGridItem}>R</div>
          </Grid>
          <Grid className={classes.gridItem} item xs={3}>
            <div className={classes.insideGridItem}>M</div>
          </Grid>


          <Grid className={classes.gridItem} item xs={3}>
            <div className={classes.insideGridItem}>
              {/* <Ruler fill="white" width='1rem' /> (km) */}
             km
            </div>
          </Grid>
          <Grid className={classes.gridItem} item xs={3}>
            <div className={classes.insideGridItem} style={{ fontSize: 'large' }}>{Math.round(urbanDist * 1000) / 1000}</div>
          </Grid>
          <Grid className={classes.gridItem} item xs={3}>
            <div className={classes.insideGridItem} style={{ fontSize: 'large' }}>{Math.round(ruralDist * 1000) / 1000}</div>
          </Grid>
          <Grid className={classes.gridItem} item xs={3}>
            <div className={classes.insideGridItem} style={{ fontSize: 'large' }}>{Math.round(motorwayDist * 1000) / 1000}</div>
          </Grid>

          {/* <Grid className={classes.gridItem} item xs={12}>
            <div>Trip segment (U,R,M):</div>
          </Grid>

          <Grid className={classes.gridItem} item xs={3}>
            <div>
              {phase}
            </div>
          </Grid> */}

          {/* <Grid className={classes.gridItem} item xs={12}>
            <div >% Shares (U,R,M) [km]:</div>
          </Grid> */}

          <Grid className={classes.gridItem} item xs={3}>
            <div className={classes.insideGridItem}>
              <Percent fill="#fafafa" width='1rem' />
            </div>
          </Grid>
          <Grid className={classes.gridItem} item xs={3}>
            <div className={classes.insideGridItem}>{Math.round(urbanShare)}</div>
          </Grid>
          <Grid className={classes.gridItem} item xs={3}>
            <div className={classes.insideGridItem} >{Math.round(ruralShare)}</div>
          </Grid>
          <Grid className={classes.gridItem} item xs={3}>
            <div className={classes.insideGridItem}>{Math.round(motorwayShare)}</div>
          </Grid>

        </Grid>

        <div className="Data-Small">{isColdStart && isOn ? "Cold Start" : null}</div>
        <div className="Data-Small">{speed > motorwayMax && isOn ? "EXTREME" : null}</div>
        <br />
        <br />

        <MyModal />



      </React.Fragment>
    </div>
  )

}

export default WatchTracker