import React from "react";
import Popup from "./Popup";

/*
Triggers a popup providing directions for the application

Returns:
    div: container for the below items
    a tag: a link that triggers a popup when clicked
    Popup component: When on, provides instructions on the app
*/
export default function HelpBtn() {
  const [popupOn, setPopupOn] = React.useState(false)

  return (
    <div className="help">
      <a href="#help" onClick={() => setPopupOn(true)}>
        Help
      </a>
      <Popup trigger={popupOn} setTrigger={setPopupOn}>
        <h3>Popup</h3>
      </Popup>
    </div>
  );
}
