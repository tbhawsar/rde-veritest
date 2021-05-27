import React, { useState } from "react"
// import Sound from "react-sound";
// import start from "../sounds/start.mp3"
// import stop from "../sounds/stop.mp3"
import Button from '@material-ui/core/Button';


const StartStopButton = (props) => {

    let [startDetect, setStartDetect] = useState(false);
    const [text, setText] = useState("Start Test");


    const startButtonStyles = {
        background: "green",
        borderRadius: "5px",
        // fontSize: "2rem",
        color: "white",
        padding: "6px 6px 6px",
        width: 'inherit',
    }

    const stopButtonStyles = {
        background: "red",
        borderRadius: "5px",
        // fontSize: "2rem",
        color: "white",
        padding: "6px 6px 6px",
        width: 'inherit',
    }

    let [buttonStyles, setButtonStyles] = useState(startButtonStyles);

    const StartHandler = () => {
        setStartDetect(startDetect = !startDetect);
        setText(startDetect ? "Stop Test" : "Start Test")
        setButtonStyles(startDetect ? stopButtonStyles : startButtonStyles)
        if (startDetect === true) {
            props.startWatch();
        } else if (startDetect === false) {
            props.stopWatch();
        }
    }

    return (
        <Button variant="contained" style={buttonStyles} onClick={StartHandler}>{text}</Button>
    )
}

export default StartStopButton