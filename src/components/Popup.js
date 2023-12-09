import React from "react";
import video from "../videos/variant-mapping-demo.mp4";

/*
A popup giving instructions on how to use the application for the user

Arguments:
    props: Object indicating whether the close button was triggered

Returns:
    popup div: container for popup
    popup-inner div: container for content of popup and close button
    video: embed tutorial video
*/
export default function Popup(props) {
  return props.trigger ? (
    <div className="popup">
      <div className="popup-inner">
        <button className="close-btn" onClick={() => props.setTrigger(false)}>
          x
        </button>
        <br/>
        <video width="600" height="250" controls>
          <source src={video} type="video/mp4" />
        </video>
        <h3>How to use:</h3>
        <ol>
          <li>
            Select the protein gene you would like to map from the sidebar.
          </li>
          <li>
            Where it says "Enter Mutation Data", enter any mutation sequences
            along with the type and phenotype. You may also change the size of
            the marker if desired.
          </li>
          <li>
            If you would like to automatically insert sequences from an Excel
            spreadsheet, hover over the upload button and select the file.
            Ensure it is in the format specified.
          </li>
          <li>
            Customize the figure to your liking by adding/deleting mutations,
            toggling the legend and labels on/off, changing the legend position,
            altering the colors using the color pickers in the legend, filtering
            mutation by clicking on the legend text, moving the labels, etc.
          </li>
          <li>
            Download the figure as a PNG when the figure it to your liking. If
            the image is not high enough quality, download it as an SVG.
            <br />
            *Note: It may be necessary to download the figure as a PNG before
            downloading it as an SVG.*
          </li>
          <li>
            If needed, download the Excel spreadsheet corresponding to the
            mutation table.
          </li>
        </ol>
      </div>
    </div>
  ) : (
    ""
  );
}
