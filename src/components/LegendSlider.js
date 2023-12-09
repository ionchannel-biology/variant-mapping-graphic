/*
Controls the x-position of the legend

Props:
    legendPosition: the current legend position
    setLegendPosition: a function to set the new legend position
Returns:
    div: container to hold label and slider
    label: tells the user what the slider is for
    input tag: a slider for the user to adjust x axis value
*/

export default function LegendSlider({ legendXPosition, legendYPosition, setLegendXPosition, setLegendYPosition }) {
  function handleOnXSliderChange(event) {
      setLegendXPosition(event.target.value)
  }

  function handleOnYSliderChange(event) {
    setLegendYPosition(event.target.value);
}

  return (
    <div className="legend-slider">
      <label>Legend X-Position</label>
      <input
        type="range"
        min="10"
        max={window.innerWidth < 1300 ? 600 : 900}
        value={legendXPosition}
        onChange={handleOnXSliderChange}
      ></input>
      <br />
    <label>Legend Y-Position</label>
    <input
      type="range"
      min="10"
      max="320"
      value={legendYPosition}
      onChange={handleOnYSliderChange}
    ></input>
    </div>
  );
}
