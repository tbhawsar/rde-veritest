import React from "react"
import Timer from "react-compound-timer";

function idleTimer(props) {
    return (
        <Timer
            lastUnit="s"
            checkpoints={[
                {
                    time: props.idleTime*1000,
                    callback: () => {
                        console.log('IDLING EXCEEDED');
                    },
                },
            ]}
        >
            {({ start, resume, pause, stop, reset, timerState }) => (
                <React.Fragment>
                    <div>
                        <Timer.Seconds /> seconds
                    </div>
                    <br />
                    <div>

                    </div>
                </React.Fragment>
            )}
        </Timer>
    )
}
export default idleTimer;