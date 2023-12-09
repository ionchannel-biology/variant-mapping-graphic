import React from "react";
import * as d3 from "d3";

/*
Input for the user to enter mutation sequence, mutation type, phenotype, and marker size

Props:
    data: an Object containing the data on the structure of voltage-gated sodium channels
    scna: the sodium channel selected by the user
    mutations: an array of all the mutations the user has previously entered
    setMutationList: a function to add mutations to the current array of mutations
    mutationSize: a number for the current size of the markers
    setMutationSize: a function to add mutations to the current array of mutations
    colourData: an Object containing colours for the segments and markers
    setColourData: a function to modify the colours set by default or previously set by the user

Returns:
    form element: contains an input for a mutation sequence, a datalist for mutation types, a datalist for phenotypes, and a slider for marker size
*/
export default function MutationForm({
  data,
  scna,
  mutations,
  setMutationList,
  mutationSize,
  setMutationSize,
  colourData,
  setColourData,
}) {
  const proteinAccessor = (d) =>
    d[scna].includes("�-�") ? d[scna].split("�-�") : d[scna].split("-");

  const [mutationData, setMutationData] = React.useState({
    mutationSeq: "",
    type: "",
    phenotype: "",
  });

  const colors = d3
    .scaleOrdinal()
    .domain(mutations.flatMap((mutation) => mutation.phenotype))
    .range(d3.schemeSpectral[11]);

  function handleChange(event) {
    setMutationData((prevMutationData) => {
      return { ...prevMutationData, [event.target.name]: event.target.value };
    });
  }

  function onFocusClear(event) {
    event.target.value = "";
  }

  function handleOnSliderChange(event) {
    setMutationSize(event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const error = document.getElementById("error");
    if (
      scna.includes("scn") &&
      parseInt(mutationData.mutationSeq.replace(/\D/g, "")) >
        parseInt(data.data.flatMap(proteinAccessor).pop())
    ) {
      error.textContent =
        "Mutation sequence out of range. Please enter a different sequence.";
      error.style.color = "red";
    } else if (
      scna.includes("kcnq") &&
      parseInt(mutationData.mutationSeq.replace(/\D/g, "")) >
        parseInt(data.data.flatMap(proteinAccessor)[29])
    ) {
      error.textContent =
        "Mutation sequence out of range. Please enter a different sequence.";
      error.style.color = "red";
    } else if (
      mutations.filter(
        (mutation) =>
          mutation.mutationSeq.replace(/\D/g, "") ===
          mutationData.mutationSeq.replace(/\D/g, "")
      ).length
    ) {
      error.textContent =
        "Mutation sequence with that location has already inputted. Please delete it from the table or enter a different sequence.";
      error.style.color = "red";
    } else {
      error.textContent = "";
      // setMutationList((prevMutations) =>
      //   // Can't have same mutation sequence
      //   prevMutations.filter(
      //     (mutation) =>
      //       mutation.mutationSeq === mutationData.mutationSeq.toUpperCase()
      //   ).length
      //     ? prevMutations
      //     : [...prevMutations, mutationData]
      // );
      setMutationList((prevMutations) => [...prevMutations, mutationData]);
      if (
        !Object.keys(colourData).includes(mutationData.phenotype + "Colour")
      ) {
        setColourData((prevColourData) => {
          return {
            ...prevColourData,
            [mutationData.phenotype + "Colour"]: colors(
              mutationData.phenotype + "Colour"
            ),
          };
        });
      }
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h4>Enter Mutation Data</h4>
        <div className="inputField">
          <label htmlFor="mutationSeq" className="form-label">
            Sequence
          </label>
          <input
            type="text"
            className="form-control"
            name="mutationSeq"
            value={mutationData.mutationSeq}
            onChange={handleChange}
            placeholder="Enter Mutation"
            required
          />
        </div>
        <div className="inputField">
          <label htmlFor="type" className="form-label">
            Mutation Type
          </label>
          <input
            type="text"
            className="form-control"
            value={mutationData.type}
            onChange={handleChange}
            onFocus={onFocusClear}
            placeholder="Select or enter a mutation type"
            list="tlist"
            name="type"
            required
          />
          <datalist id="tlist">
            <option value="Missense" />
            <option value="Silent" />
            <option value="Frameshift" />
            <option value="Splice-site" />
            <option value="Nonsense" />
            <option value="Insertion" />
            <option value="Deletion" />
          </datalist>
        </div>
        <div className="inputField">
          <label htmlFor="phenotype" className="form-label">
            Phenotype
          </label>
          <input
            type="text"
            className="form-control"
            value={mutationData.phenotype}
            onChange={handleChange}
            onFocus={onFocusClear}
            placeholder="Select or enter a phenotype"
            list="plist"
            name="phenotype"
            required
          />
          <datalist id="plist">
            <option value="DS"/>
            <option value="LO-DS" />
            <option value="FS+" />
            <option value="GEFS+" />
            <option value="GTCS" />
            <option value="DEE" />
            <option value="UEE (Unspecified)" />
          </datalist>
        </div>
        <br />
        <div className="slider">
          <label>Marker Size</label>
          <br />
          <input
            type="range"
            min="70"
            max="200"
            value={mutationSize}
            className="slider"
            onChange={handleOnSliderChange}
          ></input>
        </div>
        <br />
        <button type="submit" className="btn btn-primary mb-3">
          Submit
        </button>
        <span id="error"></span>
      </form>
    </div>
  );
}
