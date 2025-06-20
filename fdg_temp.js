// Initialize or grab the SVG
(() => {
    const width = 370;
    const height = 250;

    const svg = d3.select("#fdg")
        .attr("width", width)
        .attr("height", height);

    svg.attr("transform", "translate(0,45)");

const legend_data = [
    { region: 'Africa', color: 'blue' },
    { region: 'Europe', color: 'red' },
    { region: 'Americas', color: 'orange' },
    { region: 'East Med', color: 'brown' },
    { region: 'West Pacific', color: 'purple' },
    { region: 'SE Asia', color: 'teal' }
];

// Load data from JSON file
d3.json("filtered_file.json?v=" + new Date().getTime()).then(function(data) {
    // Filter and map the data to create nodes
    var nodes = data.map(d => ({
        country: d.iso3,
        region: d.whoregion,
        hiv: d.hivtestcoverage
    }));
    // Define a similarity threshold for HIV values
    var similarityThreshold = 0.01;

    // Create links based on the similarity in HIV values
    var links = [];
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const node1 = nodes[i];
            const node2 = nodes[j];

            if (Math.abs(node1.hiv - node2.hiv) <= similarityThreshold) {
                links.push({ source: node1.country, target: node2.country });
            }
        }
    }    

    // Combine nodes and links into a graph
    var graph = { nodes, links };

    var graphGroup = svg.append("g")
        .attr("class", "graphGroup");

    // Initialize simulation
    var simulation = d3
        .forceSimulation(graph.nodes)
        .force("link", d3
            .forceLink()
            .id(d => d.country)
            .links(graph.links)
        )
        .force("charge", d3.forceManyBody().strength(-0.3))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", ticked);

    // Draw links
    var link = graphGroup.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter()
        .append("line")
        .attr("stroke-width", 1)
        .attr("stroke", "#999");

    // Draw nodes
    var node = graphGroup.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter()
        .append("circle")
        .attr('class', 'Nodecircle')
        .attr("r", 5)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .attr("fill", d => {
            if (d.region === "AFR") return "blue";
            if (d.region === "EUR") return "red";
            if (d.region === "AMR") return "orange";
            if (d.region === "EMR") return "brown";
            if (d.region === "WPR") return "purple";
            if (d.region === "SEA") return "teal";
        })
        .on("mouseover", function (event, d) {
            d3.select(this).attr('r', 10); 
            
            // Create a group for the tooltip
            var tooltipGroup = svg.append("g")
                .attr("class", "tooltip-group");
        
            // Create the background for the tooltip using a rectangle
            tooltipGroup.append("rect")
                .attr("x", d.x + 10)
                .attr("y", d.y - 25)
                .attr("width", function() {
                    return d.country.length * 8 + 72;  
                })
                .attr("height", 20)
                .attr("fill", "rgba(0, 0, 0, 0.7)")  
                .attr("rx", 5)  
                .attr("ry", 5);
        
            // Add the text for the tooltip
            tooltipGroup.append("text")
                .attr("x", d.x + 15)
                .attr("y", d.y - 12)
                .attr("text-anchor", "start")
                .attr("font-size", "12px")
                .attr("fill", "white") 
                .attr("font-weight", "bold") 
                .text(`${d.country} | HIV: ${Math.floor(d.hiv * 100) / 100}`);
        })      
        .on("mouseout", function () {
            d3.select(this).attr('r', 5); 
            d3.select(".tooltip-group").remove();
        })
        .on('click', function(event, d) {zoomNode(d, this)})
        .call(
            d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
        );

function zoomNode(d, element) {
    const scale = 2; // Adjust zoom scale as needed
    const translateX = width - d.x * scale;
    const translateY = height - d.y * scale;

    // Apply transformation to the entire graph
    svg.transition()
        .duration(1000)
        .attr("transform", `translate(${translateX}, ${translateY}) scale(${scale})`);

    // Highlight the clicked node and its connected links
    d3.selectAll(".Nodecircle")
        .attr("opacity", 0.1) // Dim all nodes
        .attr("r", 5);        // Reset node size

    d3.selectAll("line")
        .attr("opacity", 0.1); // Dim all links
 
    // Highlight the clicked node
    d3.select(element)
        .attr("opacity", 1);

    // Highlight the links that are connected to the clicked node
    d3.selectAll("line")
        .filter(function (link) {
            return link.source === d || link.target === d; // Highlight connected links
        })
        .attr("opacity", 1) // Make connected links fully visible
        .attr("stroke-width", 2); // Optionally, increase stroke width to make links stand out more

    // Highlight the nodes that are connected to the clicked node
    d3.selectAll(".Nodecircle")
        .filter(function (node) {
            // Return nodes that are connected to the clicked node
            return node === d || 
                   graph.links.some(link => (link.source === node && link.target === d) || (link.target === node && link.source === d)); 
        })
        .attr("opacity", 1)  // Make connected nodes fully visible  
}

// Reset zoom and node/link styles when clicking on the background (SVG)
svg.on("click", function (event) {
    if (event.target.tagName === "svg") { // Check if the click is on the background
        svg.transition()
            .duration(1000)
            .attr("transform", "translate(0,45) scale(1)"); // Reset zoom

        // Reset all nodes to default opacity and size
        d3.selectAll(".Nodecircle")
            .attr("opacity", 1) // Restore original opacity
            .attr("r", 5);      // Reset radius to default size

        // Reset all links to default opacity
        d3.selectAll("line")
            .attr("opacity", 1); // Restore link opacity

    }
});

    // Functions to update positions
    function ticked() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
    
        node
            .attr("cx", d => d.x = Math.max(8, Math.min(width - 8, d.x)))
            .attr("cy", d => d.y = Math.max(8, Math.min(height - 8, d.y)));
    }    

    // Drag events
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
});
function filterNodes(d, element) {
    // Get the selected color from the clicked legend circle
    const color = d.color;

    // Highlight nodes of the selected color and dim others
    d3.selectAll(".Nodecircle")
        .attr('opacity', function () {
            return d3.select(this).attr('fill') === color ? 1 : 0.1;
        });

    d3.selectAll("line")
        .attr("opacity", 0.1);
}

const legend = d3.select('#legend-div')
    .attr('width', 100)
    .attr('height', 250);

legend.selectAll('.legend_circle')
    .data(legend_data)
    .enter()
    .append('rect')
    .attr('class', 'legend_circle')
    .attr('height', 10)
    .attr('width', 10)
    .attr('x', 11)
    .attr('y', (d, i) => i * 40 + 30)
    .attr('fill', d=>d.color)
    .on('mouseover', function(event,d) {
        const currentColor = d3.select(this).attr('fill'); // Get current fill color
        const darkerColor = d3.color(currentColor).darker(0.7); // Darken the color
        d3.select(this)
            .attr('fill', darkerColor)
            .attr('x', 8)
            .attr('height', 14)
            .attr('width', 14)
    })
    .on('click', function(event, d) {filterNodes(d, this)})
    .on('mouseout', function(event,d) {
        d3.select(this)
            .attr('fill',d=>d.color)
            .attr('height', 10)
        .attr('width', 10)
        .attr('x', 11);        
    });

    legend.selectAll('text')
    .data(legend_data)
    .enter()
    .append('text')
    .text(d => d.region)
    .attr('x', 28)
    .attr('y', (d, i) => i * 40 + 39)
    .attr('font-size', '12px')
    .attr('font-family', 'Lucida Sans, Lucida Sans Regular, Lucida Grande, Lucida Sans Unicode, Geneva, Verdana, sans-serif');

})();