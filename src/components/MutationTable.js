import React from "react";

/*
Displays table for mutation data

Props:
    data: an Object containing the data on the structure of voltage-gated sodium channels
    scna: the selected sodium channel
    mutations: an array of all the mutations the user has previously entered
    setMutationList: a function to add mutations to the current array of mutations

Returns:
    table element: displays mutation sequence, mutation type, phenotype, domain, and region with checkboxes to delete mutations
*/
export default function MutationTable({
  data,
  scna,
  mutations,
  setMutationList,
}) {
  const [checked, setChecked] = React.useState([]);
  React.useEffect(() => {
    setChecked(new Array(mutations.length).fill(false));
  }, [mutations]);

  function handleOnChange(position) {
    const updatedCheckedState = checked.map((item, index) =>
      index === position ? !item : item
    );
    setChecked(updatedCheckedState);
  }

  function deleteRows() {
    const filtered = mutations.filter((d, i) => !checked[i]);
    setMutationList(filtered);
  }

  const proteinAccessor = (d) =>
    d[scna].includes("�-�") ? d[scna].split("�-�") : d[scna].split("-");

  // function findMutationDomain(mutation_data) {
  //   for (let i = 0; i < 57; i++) {
  //     if (
  //       parseInt(mutation_data) >= proteinAccessor(data.data[i])[0] &&
  //       parseInt(mutation_data) <= proteinAccessor(data.data[i])[1]
  //     ) {
  //       return data.data[i].Domain;
  //     }
  //   }
  // }

  function findMutationDomainNumber(mutation_data) {
    let index = 0;
    for (let i = 0; i < data.data.length; i++) {
      if (parseInt(mutation_data) >= proteinAccessor(data.data[i])[0] &&
      parseInt(mutation_data) <= proteinAccessor(data.data[i])[1]) {
        index = i;
      }
      }
    if (index === 0 || index === 14 || index === 28 || index === 42 || index === 56) {
      return "N/A";
    } else if (index < 15) {
      return "I";
    } else if (index < 29) {
      return "II";
    } else if (index < 43) {
      return "III";
    } else {
      return "IV";
    }
  }

  function findMutationRegion(mutation_data) {
    for (let i = 0; i < 57; i++) {
      if (
        parseInt(mutation_data) >= proteinAccessor(data.data[i])[0] &&
        parseInt(mutation_data) <= proteinAccessor(data.data[i])[1]
      ) {
        if (data.data[i].Region.includes("Domain")) {
          return data.data[i].Region.substring(0, 2)
        }
        return data.data[i].Region;
      }
    }
  }

  function renderTableData(data) {
    return data.map((element, i) => (
      <tr key={i} value={i}>
        <td value={i}>
          <input
            type="checkbox"
            name={element.mutationSeq}
            value="checkbox"
            checked={checked[i] || false}
            onChange={() => handleOnChange(i)}
          />
        </td>
        <td value="mutationSeq">{element.mutationSeq}</td>
        <td value="type">
          {element.type.charAt(0).toUpperCase() +
            element.type.substr(1).toLowerCase()}
        </td>
        <td value="phenotype">{element.phenotype}</td>
        {/* <td value="domain">
          {findMutationDomain(element.mutationSeq.replace(/\D/g, ""))}
        </td> */}
        <td value="domain-number">
          {findMutationDomainNumber(element.mutationSeq.replace(/\D/g, ""))}
        </td>
        <td value="region">
          {findMutationRegion(element.mutationSeq.replace(/\D/g, ""))}
        </td>
      </tr>
    ));
  }

  return (
    <div className="table">
      <h4>Mutation Table</h4>
      <input type="button" value="Delete from table" onClick={deleteRows} />
      <div id="table">
        <table>
          <thead>
            <tr value="heading">
              <th>Select</th>
              <th>Sequence</th>
              <th>Type</th>
              <th>Phenotype</th>
              <th>Domain</th>
              <th>Region</th>
            </tr>
          </thead>
          <tbody value="data">{renderTableData(mutations)}</tbody>
        </table>
      </div>
    </div>
  );
}
