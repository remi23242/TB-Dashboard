// Map
(() => {

    // Set dimensions
    const width = 500;
    const height = 300;
    
    // Create the projection and path generator
    const projection = d3.geoNaturalEarth1()
        .scale(110)
        .translate([width / 2 - 30, height / 2]);
    
    const path = d3.geoPath(projection);
    
    // Select the SVG container
    const svg = d3.select("#world-map")
        .attr('width', width)
        .attr('height', height);
    
    // Create a group to hold the map for zooming
    const g = svg.append("g");

    // Load and render the map
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(world => {
        // Add countries to the map
        const countries = g.selectAll("path")
            .data(world.features)
            .join("path")
            .attr("class", "country")
            .attr("d", path)
            .attr('fill', 'steelblue') // Default fill color
            .attr('stroke', '#333')
            .attr('stroke-width', '0.1')
            .on('mouseover', function (event, d) {
                d3.select(this).attr('fill', 'steelblue');
            })
            .on('mouseout', function (event, d) {
                const value = valueMap.get(d.properties.name);
                d3.select(this).attr('fill', value ? colorScale(value) : 'steelblue');
            })
            .on("click", function (event, d) {
                zoomIN(d, this);
            });
    
        // Zoom function
        function zoomIN(d, element) {
            const [[x0, y0], [x1, y1]] = path.bounds(d);
            const dx = x1 - x0;
            const dy = y1 - y0;
            const x = (x0 + x1) / 2;
            const y = (y0 + y1) / 2;
            const scale = Math.min(8, 0.9 / Math.max(dx / width, dy / height));
            const translate = [width / 2 - scale * x, height / 2 - scale * y];
    
            g.transition()
                .duration(1000)
                .attr("transform", `translate(${translate}) scale(${scale})`);
    
            // Blur other countries
            countries.classed("blurred", true);
            d3.select(element).classed("blurred", false);
        }
    
        function zoomRegion(data, target_region) {
            // Map the data to GeoJSON features
            const amrCountries = world.features.filter(feature =>
                data.some(d => d.whoregion === target_region && d.country === feature.properties.name)
            );
        
            // Calculate bounds for the AMR region
            const bounds = amrCountries.map(d => path.bounds(d));
            const [[x0, y0], [x1, y1]] = bounds.reduce(
                ([min, max], [[bx0, by0], [bx1, by1]]) => [
                    [Math.min(min[0], bx0), Math.min(min[1], by0)],
                    [Math.max(max[0], bx1), Math.max(max[1], by1)],
                ],
                [[Infinity, Infinity], [-Infinity, -Infinity]]
            );
        
            // Calculate scaling and translation
            const dx = x1 - x0;
            const dy = y1 - y0;
            const x = (x0 + x1) / 2;
            const y = (y0 + y1) / 2;
            const scale = Math.min(8, 0.9 / Math.max(dx / width, dy / height));
            const translate = [width / 2 - scale * x, height / 2 - scale * y];
        
            // Apply zoom
            g.transition()
                .duration(300)
                .attr("transform", `translate(${translate}) scale(${scale})`);
        
            // Optionally highlight the selected countries
            countries.classed("blurred", true);
            countries.filter(d => amrCountries.includes(d)).classed("blurred", false);
        }
        
    
        // Reset zoom when clicking on the background
        svg.on("click", function (event) {
            if (event.target.tagName === "svg") {
                g.transition()
                    .duration(1000)
                    .attr("transform", "translate(0,0) scale(1)");
                countries.classed("blurred", false);
            }
        });
        var selectedValue, selectedValue2;
        // Load the data and set up the initial map
        d3.json("country_data.json").then(data => {
            // Function to update the map based on the selected year
            function updateMap(year) {
                // Filter data for the selected year
                const filteredData = data.filter(d => d.year === year);
                //console.log(data);
                document.getElementById("filter-btn").addEventListener("click", function() {
                    selectedValue = document.getElementById("options").value;
                });
                document.getElementById("filter-btn2").addEventListener("click", function() {
                    selectedValue2 = document.getElementById("options2").value;
                    zoomRegion(data, selectedValue2);
                });
                const val = selectedValue;
                // Map data to countries 
                const valueMap = new Map(filteredData.map(d => [d.country, d[val]]));
    
                // Update the color scale dynamically based on the filtered data
                const colorScale = d3.scaleLinear()
                    .domain([0, d3.max(filteredData, d => d[val])])
                    .range(['#9ddbf3', '#01132c']); // Light blue to dark blue
    
                // Update country fill color
                countries.attr('fill', d => {
                    const value = valueMap.get(d.properties.name);
                    return value ? colorScale(value) : '#8cabe8'; // Default color for missing data
                });
    
                // Update tooltip behavior for hover
                countries.on('mouseover', function (event, d) {
                    var value = valueMap.get(d.properties.name);
                    if (selectedValue === 'conf' || selectedValue === 'ep' || selectedValue === 'ch') {
                        value *= 100;
                        value = Math.floor(value*10)/10;
                    } else {
                        value = Math.floor(value);
                    }
                    d3.select(this).attr('fill', '#bad5e7'); // Highlight the country
                    svg.append('text')
                        .attr('class', 'tooltip')
                        .attr('x', event.pageX - 1100)
                        .attr('y', event.pageY - 60)
                        .text(`${d.properties.name}: ${value || 'No data'}`);
                })
                    .on('mouseout', function (event, d) {
                        const value = valueMap.get(d.properties.name);
                        d3.select(this)
                            .attr('fill', value ? colorScale(value) : '#8cabe8');
                        svg.select('.tooltip').remove(); // Remove tooltip
                    });
            }
    
            // Update display text on slider change
            d3.select("#year-slider").on("input", function () {
                const selectedYear = +this.value;
                d3.select("#year-display")
                    .text(selectedYear) // Update the text
                updateMap(selectedYear); // Update the map with the selected year
            });    
            // Initial render for the default year (2021)
            updateMap(2021);
        });
    });
})();
