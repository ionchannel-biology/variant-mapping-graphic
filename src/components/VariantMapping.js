import React from "react";
import * as d3 from "d3";
import bilayer from "../images/phospholipid-bilayer.PNG";
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
  const allSegments = data.data.filter(function (d) {
    return d.Region.match(/Domain I/);
  });
  const segmentsByDomain = d3.flatGroup(allSegments, (d) =>
    d.Region.substring(6)
  );

  const pathData = data.data.filter(function (d) {
    return (
      d.Region.match("Cytoplasmic") ||
      d.Region.match("Extracellular") ||
      d.Region.match("Pore-forming")
    );
  });

  const pathByDomain = [
    pathData.slice(0, 8),
    pathData.slice(8, 16),
    pathData.slice(16, 24),
    pathData.slice(24, 36),
  ];

  const proteinAccessor = (d) =>
    d[scna].includes("�-�") ? d[scna].split("�-�") : d[scna].split("-");

  const dot_array = pathData
    .map(proteinAccessor)
    .flatMap((d) => [
      d[0],
      `${(parseInt(d[1]) - parseInt(d[0])) / 4 + parseInt(d[0])}`,
      `${(parseInt(d[0]) + parseInt(d[1])) / 2}`,
      `${parseInt(d[1]) - (parseInt(d[1]) - parseInt(d[0])) / 4}`,
      d[1],
    ]);

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
      .style("transform", `translate(${margin.left}px, ${margin.top}px)`);

      function toDataURL(src, callback, outputFormat) {
        var img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function() {
          var canvas = document.createElement('CANVAS');
          var ctx = canvas.getContext('2d');
          var dataURL;
          canvas.height = this.naturalHeight;
          canvas.width = this.naturalWidth;
          ctx.drawImage(this, 0, 0);
          dataURL = canvas.toDataURL(outputFormat);
          callback(dataURL);
        };
        img.src = src;
        if (img.complete || img.complete === undefined) {
          img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
          img.src = src;
        }
      }
  
    // Add phospholipid layer background
    bounds
      .append("svg:image")
      .attr("class", "image")
      .each(function() {
        toDataURL( bilayer,
        (dataUrl) => {
          d3.select(this).attr("xlink:href", dataUrl);
        }
        )
      })

    // Create scales
    const domainPadding = 0.2;
    const xScaleDomain = d3
      .scaleBand()
      .domain(["Domain I", "Domain II", "Domain III", "Domain IV"])
      .range([30, boundedWidth - 60])
      .padding(domainPadding);

    const xScaleSegment = d3
      .scaleLinear()
      .domain([0, 4, 5])
      .range([0, 85, 130])
      .clamp(true);

    const xScaleDots = d3
      .scaleLinear()
      .domain(pathData.flatMap(proteinAccessor))
      .range([
        // Domain I
        16.5, 77, 77, 98, 98, 119, 119, 140, 140, 161, 161, 179.5, 181, 193,
        194, 208, 206,
        // Domain II
        270, 269, 291, 291, 312, 312, 333, 333, 353, 353, 373, 374, 385, 386,
        400, 400,
        // Domain III
        461, 461, 482, 482, 503, 503, 525, 525, 546, 546, 566, 567, 577, 578,
        592, 592,
        // Domain IV
        654, 654, 675, 675, 697, 697, 717, 717, 740, 740, 757, 758, 769, 770,
        785, 785, 872,
      ])
      .clamp(true);

    const yScaleDots = d3
      .scaleLog()
      .domain(dot_array)
      .range([
        // Domain I
        117,
        127 + 1.5 * (dot_array[1] - dot_array[0]),
        130 + (dot_array[2] - dot_array[0]),
        127 + 1.5 * (dot_array[3] - dot_array[2]),
        118,
        19,
        12,
        9,
        12,
        19,
        120,
        130,
        135,
        130,
        120,
        19,
        12,
        7,
        13,
        19,
        119,
        132,
        137,
        130,
        119,
        19,
        7 - (dot_array[26] - dot_array[25]),
        18 - 1.1 * (dot_array[29] - dot_array[27]),
        7 - (dot_array[29] - dot_array[28]),
        19,
        25,
        30,
        45,
        30,
        22,
        12,
        6,
        0,
        6,
        18,
        // Domain II
        118,
        128 + 1.6 * (dot_array[41] - dot_array[40]),
        129 + (dot_array[44] - dot_array[42]),
        130 + 1.6 * (dot_array[44] - dot_array[43]),
        119,
        20,
        12,
        7,
        12,
        21,
        119,
        128,
        136,
        128,
        119,
        19,
        12,
        7,
        12,
        19,
        119,
        130,
        135,
        130,
        119,
        18,
        0,
        -2,
        0,
        18,
        25,
        38,
        55,
        38,
        12,
        8,
        4,
        0,
        5,
        18,
        // Domain III
        120,
        122 + 1.79 * (dot_array[81] - dot_array[80]),
        129 + (dot_array[84] - dot_array[82]),
        122 + 1.79 * (dot_array[81] - dot_array[80]),
        119,
        18,
        12,
        7,
        12,
        19,
        119,
        130,
        135,
        130,
        119,
        18,
        12,
        7,
        12,
        19,
        119,
        130,
        135,
        130,
        119,
        18,
        -3,
        12 - (dot_array[109] - dot_array[107]),
        -3,
        18,
        27,
        40,
        57,
        38,
        12,
        8,
        4,
        0,
        5,
        18,
        // Domain IV
        119,
        125 + 1.6 * (dot_array[121] - dot_array[120]),
        129 + (dot_array[124] - dot_array[122]),
        125 + 1.6 * (dot_array[124] - dot_array[123]),
        119,
        18,
        12,
        7,
        12,
        19,
        119,
        130,
        135,
        130,
        119,
        18,
        12,
        7,
        12,
        19,
        119,
        130,
        135,
        130,
        119,
        18,
        5,
        2,
        5,
        18,
        20,
        40,
        57,
        38,
        12,
        8,
        0,
        -6,
        -3,
        18,
        // Last Cytoplasm
        120,
        190,
        170,
        122,
        150,
      ])
      .clamp(true);

    // Draw/bind data
    const domainGroups = bounds
      .selectAll(".domain")
      .data(segmentsByDomain)
      .enter()
      .append("g")
      .attr("class", "domain")
      .attr("transform", (d) => `translate(${xScaleDomain(d[0])},0)`);

    const domainSegments = domainGroups
      .selectAll(".segment")
      .data((d) => d[1].map(proteinAccessor));
    domainSegments
      .join("rect")
      .attr("class", "segment")
      .attr("fill", function (d, i) {
        if (i === 3) {
          return colourData["S4Colour"];
        } else if (i === 4 || i === 5) {
          return colourData["S5S6Colour"];
        } else {
          return colourData["S1S3Colour"];
        }
      })
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("height", 95)
      .attr("width", 17)
      .attr("x", (d, i) => xScaleSegment(i))
      .attr("y", 22)
      .attr("rx", 2);
    domainSegments.exit().remove();

    const pathGroup = domainGroups
      .selectAll(".path-group")
      .data([pathByDomain])
      .enter()
      .append("g")
      .attr("class", "path-group");

    pathGroup
      .selectAll(".path")
      .data((d, i) => d[i].map(proteinAccessor))
      .enter()
      .append("path")
      .attr("class", "loop")
      .attr(
        "id",
        (d) => d.toString().split(",")[1] - d.toString().split(",")[0]
      )
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2.2)
      .attr("d", function (d, i) {
        // First cytoplasm
        if (i === 0) {
          return `M-54,116.5 Q-25,${
            142 + (d.toString().split(",")[1] - d.toString().split(",")[0])
          } 9,116.5`;
          // Pore-forming
        } else if (i === 6) {
          return `M112.85,22 Q119,${
            50 + (d.toString().split(",")[1] - d.toString().split(",")[0])
          } 125,10`;
          // Last extracellular
        } else if (i === 7) {
          return `M124.8,11 C125,0 137,-${
            2 + (d.toString().split(",")[1] - d.toString().split(",")[0])
          } 140,22`;
          // Regular extracellular
        } else if (i === 1 || i === 3 || i === 5) {
          return `M${(i - 1) * 21 + 8},22 Q${i * 21 - 5},-${
            d.toString().split(",")[1] - d.toString().split(",")[0]
          } ${i * 21 + 8},22`;
          // Regular cytoplasm
        } else if (i === 2 || i === 4) {
          return `M${(i - 1) * 21 + 8},116.5 Q${i * 21 - 2},${
            142 + (d.toString().split(",")[1] - d.toString().split(",")[0])
          } ${i * 21 + 9},116.5`;
        } else {
          return "M137,117.5 C157,118 140,280 200,122 M200,122.7 C200,122.7 205,110 225,150";
          // return `M137,117 C160,116.5 134,${142 + (d.toString().split(",")[1] - d.toString().split(",")[0])} 200,119 M201,118 C200,125 202,100 228,150`;
        }
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
    //   .data(d3.range(1, 1956))
    //   .enter()
    //   .append("g")
    //   .attr("class", "marker");
    // markers.append("circle")
    // .attr("class", "mutation-dots")
    // .attr("fill", "green")
    // .attr("stroke", "black")
    // .attr("cx", (d) => xScaleDots(d))
    // .attr("cy", (d) => yScaleDots(d))
    // .attr("r", 2.5);

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
        .attr("y", -10)
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
