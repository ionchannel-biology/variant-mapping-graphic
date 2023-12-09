import React from "react";
import * as d3 from "d3";
import bilayer from "../images/potassium-phospholipid-bilayer.PNG";
import Toggle from "./Toggle";
import LegendSlider from "./LegendSlider";

/*
Figure with legend and WITHOUT zoom functionality

Props:
    data: an Object containing the data on the structure of voltage-gated sodium channels
    scna: the selected sodium channel
    mutations: an array of all the mutations the user has previously entered
    visibleMutations: an array of the current filtered mutations
    setVisibleMutations: function when to alter visibleMutations when selected filter is changed
    dimensions: Object for the specified measurements of the application and figure
    mutationSize: a number for the current size of the markers
    colourData: an Object containing colours for the segments and markers
    setColourData: a function to modify the colours set by default or previously set by the user
Returns:
    Toggle: controls whether the legend and labels appear on the figure
    LegendSlider: controls the x-position of the legend
    svg: the figure of the annotated sodium channel
*/
export default function VariantMapping({
  data,
  scna,
  mutations,
  visibleMutations,
  setVisibleMutations,
  dimensions,
  mutationSize,
  colourData,
  setColourData,
}) {
  React.useEffect(() => {
    setVisibleMutations(mutations);
  }, [mutations, setVisibleMutations]);

  const [legendXPosition, setLegendXPosition] = React.useState(530);
  const [legendYPosition, setLegendYPosition] = React.useState(300);

  // Access Data
  const allSegments = data.data.slice(0, 15).filter(function (d) {
    return d.Region.match(/Domain I/);
  });

  const pathData = data.data.slice(0, 16).filter(function (d) {
    return (
      d.Region.match("Cytoplasmic") ||
      d.Region.match("Extracellular") ||
      d.Region.match("Pore-forming")
    );
  });

  const proteinAccessor = (d) =>
    d[scna].includes("�-�") ? d[scna].split("�-�") : d[scna].split("-");

  // Legend Constants
  const segments = [
    `Voltage-Sensing Segment (S1-S3)`,
    "Positively Charged Voltage-Sensing (S4)",
    "Pore-Forming Region (S5 and S6)",
  ];

  const types = [
    ...new Set(mutations.map((mutation) => mutation.type.toLowerCase())),
  ];
  const phenotypes = [
    ...new Set(mutations.map((mutation) => mutation.phenotype)),
  ];

  const shape = d3
    .scaleOrdinal()
    .domain([
      "missense",
      "silent",
      "frameshift",
      "splice-site",
      "nonsense",
      "insertion",
      "deletion",
    ])
    .range(d3.symbols.map((s) => d3.symbol().size(mutationSize).type(s)()));

  // Colour Picker
  const rainbow = [
    "#001A8F",
    "#400D6E",
    "#8D1291",
    "#1569B7",
    "#3CB9B3",
    "#33FF96",
    "#8DFF5C",
    "#FF8585",
    "#DF7861",
    "#FFB370",
    "#85C88A",
    "#EBD671",
    "#39AEA9",
  ];
  const color = function (i) {
    return rainbow[i];
  };
  const pie = d3.pie().sort(null);
  const arc = d3.arc().innerRadius(7).outerRadius(7);
  const newarc = d3.arc().innerRadius(7).outerRadius(12);

  // Toggle
  const [selectedToggles, setSelectedToggles] = React.useState([]);

  function onChangeSelection(name) {
    const newSelectedToggles = selectedToggles.includes(name)
      ? selectedToggles.filter((item) => item !== name)
      : [...selectedToggles, name];
    setSelectedToggles(newSelectedToggles);
  }

  // Create Chart Dimensions
  const svgRef = React.useRef(null);
  const { width, height, margin, boundedWidth } = dimensions;

  React.useEffect(() => {
    // Draw Canvas
    const wrapper = d3.select(svgRef.current);
    wrapper.selectAll("*").remove();

    const bounds = wrapper
      .append("g")
      .attr("class", "bound")
      .style(
        "transform",
        `translate(${margin.left + 250}px, ${margin.top -10}px)`
      );

    function toDataURL(src, callback, outputFormat) {
      var img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = function () {
        var canvas = document.createElement("CANVAS");
        var ctx = canvas.getContext("2d");
        var dataURL;
        canvas.height = this.naturalHeight;
        canvas.width = this.naturalWidth;
        ctx.drawImage(this, 0, 0);
        dataURL = canvas.toDataURL(outputFormat);
        callback(dataURL);
      };
      img.src = src;
      if (img.complete || img.complete === undefined) {
        img.src =
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
        img.src = src;
      }
    }

    // Add phospholipid layer background
    bounds
      .append("svg:image")
      .attr("class", "image")
      .each(function () {
        toDataURL(bilayer, (dataUrl) => {
          d3.select(this).attr("xlink:href", dataUrl);
        });
      })
      .attr("transform", (d) => `translate(-115,0)`);

    // Create scales
    const xScaleSegment = d3
      .scaleLinear()
      .domain([0, 4, 5])
      .range([0, boundedWidth - 700, boundedWidth - 575])
      .clamp(true);

    const dot_array = pathData
      .map(proteinAccessor)
      .flatMap((d) => [
        d[0],
        `${(parseInt(d[1]) - parseInt(d[0])) / 4 + parseInt(d[0])}`,
        `${(parseInt(d[0]) + parseInt(d[1])) / 2}`,
        `${parseInt(d[1]) - (parseInt(d[1]) - parseInt(d[0])) / 4}`,
        d[1],
      ]);
    const xScaleDots = d3
      .scaleLinear()
      .domain(pathData.flatMap(proteinAccessor))
      .range([
        // Cytoplasm + S1
        -56, 12, 12,
        // Extracellular + S2
        62, 62,
        // Cytoplasm + S3
        113, 113,
        // Extracellular + S4
        162, 162,
        // Cytoplasm + S5
        212, 212,
        // Extracellular
        260,
        // Pore-forming
        260, 290,
        // Extracellular
        291, 338,
        // Cytoplasm
        338, 560
      ])
      .clamp(true);

    const yScaleDots = d3
      .scaleLog()
      .domain(dot_array)
      .range([
        // Cytoplasm
        150, 170 + 2.5 * (dot_array[1] - dot_array[0]), 200 + (dot_array[2] - dot_array[0]), 165 + 2 * (dot_array[3] - dot_array[2]), 150,
        // Extracellular
        19, -5 - 1.2 * (dot_array[6] - dot_array[5]), -15 - 0.75 * (dot_array[7] - dot_array[5]), -7 - 1.2 * (dot_array[8] - dot_array[7]), 19,
        // Cytoplasm
        150, 165 + 1.5 * (dot_array[11] - dot_array[10]), 185, 165 + 1.5 * (dot_array[13] - dot_array[12]), 150,
        // Extracellular
        19, -7 + (dot_array[16] - dot_array[15]), -15 - 0.75 * (dot_array[17] - dot_array[15]), -12 + (dot_array[18] - dot_array[17]), 19,
        // Cytoplasm
        150, 165 + 1.5 * (dot_array[21] - dot_array[20]), 170 + 1.5 * (dot_array[22] - dot_array[20]), 165 + 1.5 * (dot_array[23] - dot_array[22]), 150,
        // Extracellular
        20, -3 - (dot_array[26] - dot_array[25]), -15 - 0.75 * (dot_array[27] - dot_array[25]), -7 - 1.2 * (dot_array[28] - dot_array[27]), 20,
        // Pore-Forming
        25, 60, 80, 60, 25,
        // Extracellular
        20, 0 + (dot_array[36] - dot_array[35]), -1 - (dot_array[37] - dot_array[35]), (dot_array[38] - dot_array[37]), 20,
        // Cytoplasm
        150, 80 + 1.68 * (dot_array[41] - dot_array[40]), 61 + 2.1 * (dot_array[42] - dot_array[41]), 63 + 1.63 * (dot_array[43] - dot_array[42]), 110
      ])
      .clamp(true);

    // Draw/bind data
    const domainGroups = bounds
      .selectAll(".domain")
      .data(["Domain I"])
      .enter()
      .append("g")
      .attr("class", "domain");
    //.attr("transform", (d) => `translate(${xScaleDomain(d[0])},0)`);

    const domainSegments = domainGroups.selectAll(".segment").data(allSegments);
    domainSegments
      .join("rect")
      .attr("class", "segment")
      .attr("fill", function (d, i) {
        if (i === 3) {
          return colourData["S4Colour"];
        } else if (i === 0 || i === 1 || i === 2) {
          return colourData["S1S3Colour"];
        } else {
          return colourData["S5S6Colour"];
        }
      })
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("height", 125)
      .attr("width", 25)
      .attr("x", (d, i) => xScaleSegment(i))
      .attr("y", 22)
      .attr("rx", 2);
    domainSegments.exit().remove();

    const pathGroup = domainGroups
      .selectAll(".path-group")
      .data([pathData])
      .enter()
      .append("g")
      .attr("class", "path-group");

    pathGroup
      .selectAll(".path")
      .data((d) => d)
      .enter()
      .append("path")
      .attr("class", (d, i) => d[scna])
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2.2)
      .attr("d", function (d, i) {
        // First cytoplasm
        if (i === 0) {
          return `M-57,145 Q-30,${
            253 +
            (d[scna].toString().split("-")[1] -
              d[scna].toString().split("-")[0])
          } 12,146`;
          // Pore-forming
        } else if (i === 6) {
          return `M260,22 Q275,${
            120 +
            (d[scna].toString().split("-")[1] -
              d[scna].toString().split("-")[0])
          } 290,22`;
          // Last extracellular
        } else if (i === 7) {
          return `M290,22 C295,0 315,-${
            20 +
            (d[scna].toString().split("-")[1] -
              d[scna].toString().split("-")[0])
          } 337,22`;
          // Regular extracellular
        } else if (i === 1 || i === 3 || i === 5) {
          return `M${(i - 1) * 50 + 15},22 Q${i * 50 - 10},-${
            50 +
            (d[scna].toString().split("-")[1] -
              d[scna].toString().split("-")[0])
          } ${i * 50 + 10},22`;
          // Regular cytoplasm
        } else if (i === 2 || i === 4) {
          return `M${(i - 1) * 50 + 10},147 Q${i * 50 - 10},${
            200 +
            (d[scna].toString().split("-")[1] -
              d[scna].toString().split("-")[0])
          } ${i * 50 + 12},147`;
        }
          return `M337,147 Q${i * 55},${
            (d[scna].toString().split("-")[1] -
              d[scna].toString().split("-")[0] + i * 1.2)
          } ${i * 70},110`;
          // OTHER POSSIBLE PATHS
          // return `M337,147 C${i * 60},${
          //   1.25 * (d[scna].toString().split("-")[1] -
          //     d[scna].toString().split("-")[0])
          // } ${i * 80},${
          //   90 - 0.5 *
          //   (d[scna].toString().split("-")[1] -
          //     d[scna].toString().split("-")[0])} 542,192`
          // return "M337,147 C357,180 330,250 400,122 M400,122.7 C400,122.7 405,110 425,150";
      });
    function dragstarted(event, d) {
      d3.select(this).raise().attr("stroke-width", 2);
    }

    function dragged(event, d) {
      d3.select(this).attr("transform", `translate(${event.x}, ${event.y})`);
    }

    function dragended(event, d) {
      d3.select(this).attr("stroke-width", 1);
    }

    const markers = bounds
      .selectAll(".mutation-markers")
      .data(visibleMutations)
      .enter()
      .append("g")
      .attr("class", "marker");
    markers
      .append("path")
      .attr("class", (d) => d.type.toLowerCase())
      .attr("id", (d) => d.phenotype.toLowerCase())
      .attr("fill", function (d) {
        return colourData[d.phenotype + "Colour"];
      })
      .attr("stroke", "black")
      .attr(
        "transform",
        (d) =>
          `translate(${xScaleDots(
            d.mutationSeq.replace(/\D/g, "")
          )}, ${yScaleDots(d.mutationSeq.replace(/\D/g, ""))})`
      )
      .attr("d", (d) => shape(d.type.toLowerCase()));
    markers.exit().remove();

    // USED TO TEST MARKERS
    // const markers = bounds
    //   .selectAll(".mutation-markers")
    //   .data(d3.range(1, 872))
    //   .enter()
    //   .append("g")
    //   .attr("class", "marker");
    // markers.append("circle")
    // .attr("class", "mutation-dots")
    // .attr("fill", "green")
    // .attr("stroke", "black")
    // .attr("cx", (d) => xScaleDots(d))
    // .attr("cy", (d) => yScaleDots(d))
    // .attr("r", 4.0);

    if (selectedToggles.includes("labels")) {
      const tooltip = markers
        .append("g")
        .attr("class", "tooltip")
        .attr(
          "transform",
          (d) =>
            `translate(${xScaleDots(d.mutationSeq.replace(/\D/g, "")) + 8}, ${
              yScaleDots(d.mutationSeq.replace(/\D/g, "")) - 8
            })`
        )
        .call(
          d3
            .drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );

      tooltip
        .append("rect")
        .attr("rx", 4)
        .attr("width", (d) => (d.mutationSeq.length + 1) * 8)
        .attr("height", 17)
        .style("fill", "white")
        .style("opacity", 0.75)
        .style("stroke", "black");

      tooltip
        .append("text")
        .text((d) => d.mutationSeq)
        .attr("text-align", "middle")
        .attr("x", 7)
        .attr("y", 12)
        .style("font-size", "13px");
    }

    // Draw peripherals
    domainGroups
      .selectAll(".domain-label")
      .data((d) => [d])
      .enter()
      .append("text")
      .attr("class", "label domain-label")
      .attr("x", (d, i) => i * 100 + 50)
      .attr("y", 200)
      .text((d) => d[0].substring(6))
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    // LEGEND
    if (selectedToggles.includes("legend")) {
      const legendGroup = wrapper
        .append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${legendXPosition}, ${legendYPosition})`);

      const colourPickerGroup = legendGroup
        .selectAll("colourPicker-group")
        .data(["colour"])
        .enter()
        .append("g")
        .attr("class", "colour-picker");

      const wheel = colourPickerGroup
        .datum([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
        .selectAll("path")
        .data(pie)
        .enter()
        .append("path")
        .attr("fill", function (d, i) {
          return color(i);
        })
        .attr("d", arc)
        .each(function (d) {
          this._current = d;
        }); // store the initial angles

      function getColourPickerX(i) {
        if (i < 3) {
          return 20;
        } else {
          return 280;
        }
      }

      function getColourPickerY(i) {
        if (i < 3) {
          return 30 + i * 40;
        } else {
          return 30 + (i - 3) * 20;
        }
      }

      // Store the displayed angles in _current.
      // Then, interpolate from _current to the new angles.
      // During the transition, _current is updated in-place by d3.interpolate.
      function arcTween(a) {
        const i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function (t) {
          return newarc(i(t));
        };
      }

      function generateColourPicker(circleIndex) {
        colourPickerGroup.attr(
          "transform",
          `translate(${getColourPickerX(circleIndex)}, ${getColourPickerY(
            circleIndex
          )})`
        );
        wheel.transition().duration(800).attrTween("d", arcTween);
      }

      function handleWheelClick(key) {
        wheel.on("click", function () {
          const fill = d3.select(this).attr("fill");
          setColourData((prevColourData) => {
            return { ...prevColourData, [key]: fill };
          });
          wheel.transition().duration(200).attrTween("d", arcTween);
        });
      }

      legendGroup
        .selectAll("segment-colour")
        .data(segments)
        .enter()
        .append("circle")
        .attr("class", (d, i) => `${Object.keys(colourData)[i]}`)
        .attr("id", (d, i) => i)
        .attr("cx", 20)
        .attr("cy", function (d, i) {
          return 30 + i * 40;
        })
        .attr("r", 6)
        .style("fill", function (d, i) {
          return Object.values(colourData).slice(0, 3)[i];
        })
        .on("click", function (d, i) {
          let [circleIndex] = d3.select(this).attr("id");
          generateColourPicker(circleIndex);
          handleWheelClick(Object.keys(colourData)[circleIndex]);
        });

      function wrap(text, width) {
        text.each(function () {
          let text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            // dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", x).attr("y", y);
          while ((word = words.pop())) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text
                .append("tspan")
                .attr("x", x)
                .attr("y", y)
                .attr("dy", ++lineNumber * lineHeight + "em")
                .text(word);
            }
          }
        });
      }

      legendGroup
        .selectAll("segment-labels")
        .data(segments)
        .enter()
        .append("text")
        .attr("x", 35)
        .attr("y", function (d, i) {
          return 30 + i * 40;
        })
        .text(function (d) {
          return d;
        })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("font-size", "12px")
        .call(wrap, 110);

      // Types
      legendGroup
        .append("text")
        .text("Types")
        .attr("x", 165)
        .attr("y", 10)
        .style("font-size", "13px")
        .style("font-weight", "500");
      legendGroup
        .selectAll("type-legend")
        .data(types)
        .enter()
        .append("path")
        .attr("transform", (d, i) => `translate(170, ${30 + i * 22})`)
        .attr("d", (d) => shape(d.toLowerCase()));

      legendGroup
        .selectAll("type-labels")
        .data(types)
        .enter()
        .append("text")
        .attr("class", "legend-text")
        .attr("x", 185)
        .attr("y", function (d, i) {
          return 35 + i * 22;
        })
        .text(function (d) {
          return d.charAt(0).toUpperCase() + d.substr(1).toLowerCase();
        })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("font-size", "13px")
        .on("click", function (d, i) {
          setVisibleMutations(
            mutations.filter((d) => d.type.toLowerCase() === i)
          );
        })
        .call(wrap, 110);

      // Phenotypes
      legendGroup
        .append("text")
        .text("Phenotypes")
        .attr("x", 270)
        .attr("y", 10)
        .style("font-size", "13px")
        .style("font-weight", "500");

      legendGroup
        .selectAll("phenotype-dots")
        .data(phenotypes)
        .enter()
        .append("circle")
        .attr("class", (d, i) => d + "Colour")
        .attr("id", (d, i) => i + 3)
        .attr("cx", 280)
        .attr("cy", function (d, i) {
          return 30 + i * 20;
        })
        .attr("r", 6)
        .style("fill", function (d, i) {
          return colourData[d + "Colour"];
        })
        .on("click", function () {
          let [circleIndex] = d3.select(this).attr("id");
          generateColourPicker(circleIndex);
          handleWheelClick(d3.select(this).attr("class"));
        });

      legendGroup
        .selectAll("phenotype-labels")
        .data(phenotypes)
        .enter()
        .append("text")
        .attr("class", "legend-text")
        .attr("x", 295)
        .attr("y", function (d, i) {
          return 32 + i * 20;
        })
        .text(function (d) {
          return d;
        })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("font-size", "13px")
        .on("click", function (d, i) {
          setVisibleMutations(mutations.filter((d) => d.phenotype === i));
        });

      legendGroup
        .selectAll("phenotype-labels")
        .data(["Show All"])
        .enter()
        .append("text")
        .attr("class", "legend-text")
        .attr("x", 220)
        .attr("y", -15)
        .text((d) => d)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("font-size", "13px")
        .on("click", function (d, i) {
          setVisibleMutations(mutations);
        });
    }
  });
  return (
    <div id="variant-map">
      <Toggle
        selectedToggles={selectedToggles}
        onChangeSelection={onChangeSelection}
      />
      <LegendSlider
        legendXPosition={legendXPosition}
        legendYPosition={legendYPosition}
        setLegendXPosition={setLegendXPosition}
        setLegendYPosition={setLegendYPosition}
      />
      <svg
        id="variant-mapping"
        ref={svgRef}
        width={width + 50}
        height={height}
      />
    </div>
  );
}
