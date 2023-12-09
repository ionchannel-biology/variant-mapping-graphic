import React from "react";

/*
Controls whether legend and labels are on/off

Props:
    selectedToggles: an Array of the element(s) that are toggled on
    onChangeSelection: a function to add or remove element(s) that are toggled on/off

Returns:
    div: a container to hold checkboxes and labels
    legend input: checkbox to toggle legend on/off
    labels input: checkbox to toggle labels on/off
*/
export default function Toggle({selectedToggles, onChangeSelection}) {
  return (
    <div className="toggleContainer">
        <label>Show: </label>
      <label>
        <input name="legend" type="checkbox" checked={selectedToggles.includes("legend")} onChange={() => onChangeSelection("legend")}/>
        Legend
      </label>
      <label>
        <input name="labels" type="checkbox" checked={selectedToggles.includes("labels")} onChange={() => onChangeSelection("labels")}/>
        Labels
      </label>
    </div>
  );
}
