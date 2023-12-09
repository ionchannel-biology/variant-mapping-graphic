import React from "react";

/*
Navigation for the user to select desired sodium channel

Props:
    scna: the selected sodium channel
    setScna: a function to update the selected sodium channel
    setMutationList: a function used to clear all mutations to the current array of mutations

Returns:
    nav element: navigation bar containing header and a tags to select desired sodium channel
*/
export default function Sidebar({ scna, setScna, setMutationList}) {
  const scnaList = ["scn1a", "scn2a", "scn3a", "scn4a", "scn5a", "scn8a", "scn9a", "scn10a", "scn11a"]
  const kcnqList = ["kcnq1", "kcnq2", "kcnq3", "kcnq4", "kcnq5"]

  function handleScnaChange(event) {
    event.preventDefault()
    setScna(event.target.href.slice(event.target.href.lastIndexOf("/") + 1));
    setMutationList([]);
  };

  return (
    <nav className="sidenav">
      <div className="side-header">
        <img className="xenon-logo" src={require("../icons/xenon_logo.png")} alt="Xenon Logo"/>
        <span className="title-text">
          <h2>XENON</h2>
          <h3>Variant Mapping</h3>
        </span>
      </div>
      <div className="side-content">
        <p className="caption" role="heading" aria-level="2">
          <span className="caption-text">Sodium</span>
        </p>
        {scnaList.map((element, i) => (<a key={i} className={element === scna ? "active" : "inactive"} href={element} onClick={handleScnaChange}>{element}</a>))}
        <p className="caption" role="heading" aria-level="2">
          <span className="caption-text">Potassium</span>
        </p>
        {kcnqList.map((element, i) => (<a key={i} className={element === scna ? "active" : "inactive"} href={element} onClick={handleScnaChange}>{element}</a>))}
      </div>
    </nav>
  );
}
