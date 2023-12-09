import React from "react";
import Papa from "papaparse";
import file from "./data/mapping-lookup.csv";

import "./App.css";
import MutationForm from "./components/MutationForm";
import Sidebar from "./components/Sidebar";
import UploadBtn from "./components/UploadBtn";
import DownloadBtn from "./components/DownloadBtn";
import VariantMapping from "./components/VariantMapping";
import PotassiumMapping from "./components/PotassiumMapping";
import MutationTable from "./components/MutationTable";
import HelpBtn from "./components/HelpBtn";
import ErrorBoundary from "./components/ErrorBoundary";

const dimensions = {
  width: window.innerWidth < 1300 ? 920 : 1290,
  height: 455,
  margin: {
    top: 70,
    right: window.innerWidth < 1300 ? 10 : 196,
    bottom: 10,
    left: window.innerWidth < 1300 ? 10 : 196,
  },
};

dimensions.boundedWidth =
  dimensions.width - dimensions.margin.left - dimensions.margin.right;
dimensions.boundedHeight =
  dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

export default function App() {
  const [dataset, setDataset] = React.useState({ data: [] });
  React.useEffect(() => {
    Papa.parse(file, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (data) => {
        setDataset(data);
      },
    });
  }, []);

  const [scna, setScna] = React.useState("scn1a");
  const [mutationList, setMutationList] = React.useState([]);
  const [visibleMutations, setVisibleMutations] = React.useState([]);
  const [mutationSize, setMutationSize] = React.useState(65);
  const [colourData, setColourData] = React.useState({
    S1S3Colour: "#85C88A",
    S4Colour: "#EBD671",
    S5S6Colour: "#39AEA9",
  });

  return (
    <div className="App">
      <Sidebar
        scna={scna}
        setScna={setScna}
        setMutationList={setMutationList}
      />
      <ErrorBoundary>
      <div className="header">
        <div className="heading">
          <h1>{scna}</h1>
          {scna.includes("scn") ? <p>Sodium Voltage-Gated Channel Alpha Subunit {scna.match(/\d+/g)}</p> : <p>Potassium Voltage-Gated Channel Subfamily Q Member {scna.match(/\d+/g)}</p>}
          {scna.includes("scn") ? <p>
            Nav 1.
            {scna.match(/\d+/g) < 6
              ? scna.match(/\d+/g)
              : scna.match(/\d+/g) - 2}
          </p> : <p>Kv 7.{scna.match(/\d+/g) < 6
              ? scna.match(/\d+/g)
              : scna.match(/\d+/g) - 2}</p>}
        </div>
        <div id="btn-group">
            <UploadBtn
              mutations={mutationList}
              setMutationList={setMutationList}
              colourData={colourData}
              setColourData={setColourData}
            />
          <DownloadBtn scna={scna} />
        </div>
        <HelpBtn />
      </div>
      {scna.includes("scn") ? <VariantMapping
        data={dataset}
        scna={scna}
        mutations={mutationList}
        visibleMutations={
          visibleMutations.length ? visibleMutations : mutationList
        }
        setVisibleMutations={setVisibleMutations}
        dimensions={dimensions}
        mutationSize={mutationSize}
        colourData={colourData}
        setColourData={setColourData}
      /> : <PotassiumMapping
        data={dataset}
        scna={scna}
        mutations={mutationList}
        visibleMutations={
          visibleMutations.length ? visibleMutations : mutationList
        }
        setVisibleMutations={setVisibleMutations}
        dimensions={dimensions}
        mutationSize={mutationSize}
        colourData={colourData}
        setColourData={setColourData}
      />}
      <MutationForm
        data={dataset}
        scna={scna}
        mutations={mutationList}
        setMutationList={setMutationList}
        mutationSize={mutationSize}
        setMutationSize={setMutationSize}
        colourData={colourData}
        setColourData={setColourData}
      />
      <MutationTable
        data={dataset}
        scna={scna}
        mutations={mutationList}
        setMutationList={setMutationList}
      />
      </ErrorBoundary>
    </div>
  );
}
