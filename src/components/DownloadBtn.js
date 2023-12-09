import * as XLSX from "xlsx/xlsx.mjs";
import saveSvgAsPng from "save-svg-as-png";

/*
Converts the figure as a PNG to allow for download as a PNG or SVG
Converts the table to a XLSX for download as an Excel file

Props:
    scna: the sodium channel selected by the user

Returns:
    div element: a dropdown container
    downloadPNG a tag: link to call function to download the figure as a PNG when user requests
    downloadSVG a tag: link to call function to download the figure as a SVG when user requests
    downloadTable a tag: link to call function to download the table as an Excel file when user requests
*/
export default function DownloadBtn({ scna }) {
  const d3_save_svg = require("d3-save-svg");
  const imageOptions = {
    scale: 5,
    encoderOptions: 1,
    backgroundColor: "white",
  };

  function handleDownloadPng(event) {
    event.preventDefault();
    saveSvgAsPng.saveSvgAsPng(
      document.getElementById("variant-mapping"),
      "variant-map.png",
      imageOptions
    );
  }

  function handleDownloadSvg(event) {
    event.preventDefault();
    let config = {
      filename: "variant-map",
    };
    d3_save_svg.save(
      document.getElementById("variant-mapping"),
      config
    );
  }

  function downloadTableExcel(event) {
    event.preventDefault();
    let table_elt = document.getElementById("table");
    let workbook = XLSX.utils.table_to_book(table_elt);
    XLSX.writeFile(workbook, `${scna}-variant-map.xlsx`);
  }

  return (
    <div className="dropdown">
      <button className="dropbtn">DOWNLOAD</button>
      <div className="dropdown-content">
        <a href="downloadPNG" onClick={handleDownloadPng}>
          Figure as PNG
        </a>
        <a href="downloadSVG" onClick={handleDownloadSvg}>
          Figure as SVG
        </a>
        <a href="downloadTable" onClick={downloadTableExcel}>
          Table as XLSX
        </a>
      </div>
    </div>
  );
}
