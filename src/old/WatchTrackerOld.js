
function WatchTracker() {
  let id, options;


  let coordinates = [];
  function success(pos) {

    coordinates.push(...[
      pos.coords.latitude,
      pos.coords.longitude,
      pos.coords.accuracy
    ]);

    console.log(JSON.stringify(coordinates));
    localStorage.setItem("coordinates", JSON.stringify(coordinates));
  }

  function error(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
  }

  options = {
    enableHighAccuracy: true,
    maximumAge: 0
  };

  function startWatch() {
    console.log("Starting Watch.")
    id = navigator.geolocation.watchPosition(success, error, options);
  }

  function stopWatch() {
    console.log("Stopping Watch.");
    navigator.geolocation.clearWatch(id);
  }

  return (
    <div>
      <div>[TESTS E, F]</div>
      <button onClick={startWatch}>start</button>
      <button onClick={stopWatch}>stop</button>
    </div>
  )

}

export default WatchTracker