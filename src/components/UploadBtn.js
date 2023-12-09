import React from "react";
import * as d3 from "d3";
import * as XLSX from "xlsx/xlsx.mjs";

/*
A dropdown to allow the user to upload an Excel spreadsheet of mutation data with the headings mutationSeq, type, and phenotype

Props:
    mutations: an array of all the mutations the user has previously entered
    setMutationList: a function to add mutations to the current array of mutations
    colourData: an Object containing colours for the segments and markers
    setColourData: a function to modify the colours set by default or previously set by the user

Returns:
    dropdown div: container to hold dropdown button
    button: a button for users to hover and access options
    dropdown-content div: container for options including downloading figure as PNG, downloading figure as SVG, or downloading table as Excel
*/
export default function UploadBtn({
  mutations,
  setMutationList,
  colourData,
  setColourData,
}) {
  const [error, setError] = React.useState();
  const colors = d3
    .scaleOrdinal()
    .domain(mutations.flatMap((mutation) => mutation.phenotype))
    .range(d3.schemeSpectral[11]);

  function handleFile(e) {
    let file = e.target.files[0];
    let reader = new FileReader();
    try {
      reader.onload = function (e) {
        let workbook = XLSX.readFile(e.target.result);
        let rowObject = XLSX.utils.sheet_to_row_object_array(
          workbook.Sheets["Sheet1"]
        );
        setMutationList((prevMutations) => [
          ...prevMutations,
          ...rowObject.filter(
            (mutation) =>
              !prevMutations.some(
                (prevMutation) =>
                  prevMutation.mutationSeq.replace(/\D/g, "") ===
                  mutation.mutationSeq.replace(/\D/g, "")
              )
          ),
        ]);
        for (let i = 0; i < rowObject.length; i++) {
          if (
            !Object.keys(colourData).includes(rowObject[i].phenotype + "Colour")
          ) {
            setColourData((prevColourData) => {
              return {
                ...prevColourData,
                [rowObject[i].phenotype + "Colour"]: colors(
                  rowObject[i].phenotype + "Colour"
                ),
              };
            });
          }
        }
      };
    } catch (err) {
      setError(err);
      console.log(error);
    }
    reader.readAsArrayBuffer(file);
  }

  return (
    <div className="dropdown">
      <button className="dropbtn">UPLOAD</button>
      <div className="dropdown-content" id="upload">
          <input
            type="file"
            id="input_dom_element"
            accept=".csv, .xls, .xlsb, .xlsx"
            onChange={handleFile}
          />
        <div id="upload-note">
          <p>NOTE: Accepts csv, xls, xlsb, or xlsx only. Headings MUST be:</p>
          <ul>
            <li>mutationSeq</li>
            <li>type</li>
            <li>phenotype</li>
          </ul>
          <table>
            <thead>
              <tr>
                <th>mutationSeq</th>
                <th>type</th>
                <th>phenotype</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>L1092P</td>
                <td>Missense</td>
                <td>DS</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
