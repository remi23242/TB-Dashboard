fetch('final_data.json')
    .then(response => response.json())
    .then(data => createVisualization(data));

function createVisualization(data) { 
    
    data = data.filter(d => d.year <= 2011);

    const countries = [...new Set(data.map(d => d.country))].sort();
    const countrySelect = d3.select("#countrySelect");

    countrySelect.selectAll("option")
        .data(countries)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    const initialCountry = countries[13];
    countrySelect.property("value", initialCountry);

    const width = 970, height = 300, margin = { top: 50, right: 50, bottom: 30, left: 50 };
    const svg = d3.select("#timeline")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const xScale = d3.scaleTime().range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);
    const radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.newSpDied || 0)])
        .range([2, 20]);

    const xAxisGroup = svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`);
    const yAxisGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`);

    const tooltip = d3.select("#tooltip1");

    let playing = false;
    let circlesNewCases, circlesRetreatment;
    let currentIndex = 0; 

    function updateVisualization(country) {
        svg.selectAll("circle").remove();

        const filteredData = data
            .filter(d => d.country === country && (d.newSpCoh !== null || d.retCur !== null))
            .map(d => ({
                year: d.year,
                newSpCoh: d.newSpCoh || 0,
                retCur: d.retCur || 0,
                newSpDied: d.newSpDied || 0
            }));

        if (!filteredData.length) {
            alert("No data available for the selected country.");
            return;
        }

        xScale.domain(d3.extent(filteredData, d => new Date(d.year, 0, 1)));
        yScale.domain([0, d3.max(filteredData, d => Math.max(d.newSpCoh, d.retCur))]);

        xAxisGroup.call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.timeFormat("%Y")));
        yAxisGroup.call(d3.axisLeft(yScale));

        circlesNewCases = svg.selectAll(".circle-newCases")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("class", "circle-newCases")
            .attr("cx", d => xScale(new Date(d.year, 0, 1)))
            .attr("cy", d => yScale(d.newSpCoh))
            .attr("r", 0) 
            .attr("fill", " #4f46e5") 
            .attr("stroke", "white") 
            .attr("stroke-width", 1.5)
            //.attr("opacity", 0.8)
            .on("mouseover", (event, d) => {
                tooltip
                    .style("visibility", "visible")
                    .style("opacity", 1)
                    .style("top", `${event.pageY - 30}px`)
                    .style("left", `${event.pageX + 10}px`)
                    .html(`
                        <strong>Year:</strong> ${d.year}<br>
                        <strong>New Cases:</strong> ${d.newSpCoh}<br>
                        <strong>Deaths:</strong> ${d.newSpDied}
                    `);
            })
            .on("mouseout", () => {
                tooltip.style("visibility", "hidden").style("opacity", 0);
            });

        circlesRetreatment = svg.selectAll(".circle-retreatment")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("class", "circle-retreatment")
            .attr("cx", d => xScale(new Date(d.year, 0, 1)))
            .attr("cy", d => yScale(d.retCur))
            .attr("r", 0) 
            .attr("fill", "#06b6d4") 
            .attr("stroke", "white") 
            .attr("stroke-width", 1.5)
            //.attr("opacity", 0.8)
            .on("mouseover", (event, d) => {
                tooltip
                    .style("visibility", "visible")
                    .style("opacity", 1)
                    .style("top", `${event.pageY - 30}px`)
                    .style("left", `${event.pageX + 10}px`)
                    .html(`
                        <strong>Year:</strong> ${d.year}<br>
                        <strong>Retreatment Cases:</strong> ${d.retCur}
                    `);
            })
            .on("mouseout", () => {
                tooltip.style("visibility", "hidden").style("opacity", 0);
            });

        if (playing) startAnimation(filteredData);
    }

    function startAnimation(filteredData) {
        stopAnimation(); 
        circlesNewCases.transition()
            .duration(1000)
            .delay((d, i) => i * 1000) 
            .attr("r", d => radiusScale(d.newSpDied)*2.5);
        circlesRetreatment.transition()
            .duration(1000)
            .delay((d, i) => i * 1000) 
            .attr("r", 5);
    }

    function stopAnimation() {
        circlesNewCases?.interrupt(); 
        circlesRetreatment?.interrupt();
    }

    
    d3.select("#playPause").on("click", function () {
        playing = !playing;
        this.textContent = playing ? "Pause" : "Play";
        if (playing) {
            startAnimation(circlesNewCases.data()); 
        } else {
            stopAnimation();
        }
    });

    countrySelect.on("change", function () {
        updateVisualization(this.value);
    });

   
    updateVisualization(initialCountry);

   
    playing = true;
    d3.select("#playPause").text("Pause"); 
    startAnimation(circlesNewCases.data()); 

    const legend_data = [
    { text: 'New Cases', color: '#4f46e5' },
    { text: 'Successfully treated', color: '#06b6d4' }
];

const legend = d3.select('.tmLegend')
    .attr('height', 50)
    .attr('width', 400);

legend.selectAll('rect')
    .data(legend_data)
    .enter()
    .append('rect')
    .attr('x', (d, i) => i * 100 + 80)
    .attr('y', 0)
    .attr('height', 10)
    .attr('width', 10)
    .attr('fill', d => d.color)
    .on('click', function (event, d) {
        if (d.color === '#06b6d4') {
            d3.selectAll(".circle-newCases").attr('opacity', 0.1);
        }
        if (d.color === '#4f46e5') {
            d3.selectAll(".circle-retreatment").attr('opacity', 0.1);
        }
    });

    svg.on("click", function (event) {
        const isSvgClick = event.target === this; // Check if the target is the SVG itself
        if (isSvgClick) {
            // Reset opacity of all circles
            d3.selectAll(".circle-newCases")
                .attr("opacity", 1);
    
            d3.selectAll(".circle-retreatment")
                .attr("opacity", 1);
        }
    });    

legend.selectAll('text')
    .data(legend_data)
    .enter()
    .append('text')
    .text(d => d.text)
    .attr('x', (d, i) => i * 100 + 95)
    .attr('y', 10);

}

