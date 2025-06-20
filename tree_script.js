const width = 970;
const height = 520;
const regionBaseColors = d3.schemeTableau10; // Predefined categorical color scheme for regions

// Load the data
d3.json("notified.json").then(data => {
    const svg = d3.select("#chartTree").append("svg")
        .attr("viewBox", [0, 0, width, height])
        .style("font", "10px sans-serif");

    const yearSlider = document.getElementById("yearSlider1");
    const yearLabel = document.getElementById("yearLabel1");
    const legend = d3.select("#legendTree");

    let selectedRegion = null; // Track the selected region for filtering

    // Update the treemap for a given year
    function update(year) {
        const root = d3.hierarchy(data[year])
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);

        // Filter leaves based on selectedRegion
        let leaves = root.leaves();
        if (selectedRegion) {
            leaves = leaves.filter(d => d.parent.data.name === selectedRegion);

            // Recalculate layout for filtered leaves to occupy full space
            const filteredRoot = d3.hierarchy({ children: leaves.map(d => d.data) })
                .sum(d => d.value)
                .sort((a, b) => b.value - a.value);

            d3.treemap()
                .size([width, height])
                .padding(1)
                .round(true)(filteredRoot);

            // Update leaves with the new layout
            leaves = filteredRoot.leaves();
        } else {
            d3.treemap()
                .size([width, height])
                .padding(1)
                .round(true)(root);

            leaves = root.leaves();
        }

        // Group leaves by parent region
        const regions = Array.from(new Set(root.leaves().map(d => d.parent.data.name)));
        const regionColorScales = {};

        regions.forEach((region, i) => {
            const regionLeaves = root.leaves().filter(d => d.parent.data.name === region);
            const min = d3.min(regionLeaves, d => d.value);
            const max = d3.max(regionLeaves, d => d.value);

            // Assign a base color to the region and create a linear scale for its gradient
            regionColorScales[region] = d3.scaleLinear()
                .domain([min, max])
                .range([d3.color(regionBaseColors[i]).brighter(1.5), d3.color(regionBaseColors[i]).darker(1.5)]);
        });

        const leaf = svg.selectAll("g")
            .data(leaves)
            .join("g")
            .attr("transform", d => `translate(${d.x0},${d.y0})`);

        leaf.selectAll("*").remove(); // Clear previous elements

        leaf.append("rect")
            .attr("fill", d => regionColorScales[d.parent?.data.name || selectedRegion](d.value))
            .attr("fill-opacity", 0.8)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .on("mouseover", function () {
                d3.select(this).attr("fill-opacity", 1).attr("stroke", "black").attr("stroke-width", 2);
            })
            .on("mouseout", function () {
                d3.select(this).attr("fill-opacity", 0.8).attr("stroke", "none");
            });

        leaf.append("title")
            .text(d => `${d.ancestors().reverse().map(d => d.data.name).join(" > ")}\nHIV cases notified: ${d.value}`);

        leaf.append("text")
            .attr("x", 5)
            .attr("y", 15)
            .style("font-size", "10px")
            .text(d => d.data.name);

        leaf.append("text")
            .attr("x", 5)
            .attr("y", 25)
            .attr("class", "value-text")
            .attr("font-size", 4)
            .text(d => d.value);

        // Update the legend
        legend.selectAll(".legendTree-item").remove(); // Clear existing legend

        legend.selectAll(".legendTree-item")
            .data(regions)
            .join("div")
            .attr("class", "legendTree-item")
            .html((region, i) => `
                <div class="legendTree-color" style="background:${regionBaseColors[i]}"></div>
                <span>${region}</span>
            `)
            .on("click", (event, region) => {
                // Toggle the selected region
                selectedRegion = selectedRegion === region ? null : region;
                update(year); // Re-render the treemap with filtering
            });
    }

    // Listen to slider changes
    yearSlider.addEventListener("input", function () {
        const year = this.value;
        yearLabel.textContent = year; // Update the year display
        update(year);
    });

    // Initialize with the first year
    update("2000");
});
