# TB-Dashboard

This dashboard visualizes insights into Tuberculosis (TB) cases across the globe, utilizing data from the World Health Organization (WHO) TB Reports. The interactive visualizations aim to provide a comprehensive understanding of the trends, distribution, and testing coverage related to TB. 

# Visualizations and Insights
**1) Timeline Graph** _Top Left_

This chart tracks the number of new TB cases and the corresponding successfully treated cases over the years for a selected country. The radius of the New Cases depends on the death toll. The upward or downward trends highlight the effectiveness of healthcare interventions over time. A gap between new cases and treated cases indicates underperformance in treatment or delays in healthcare delivery.

**2) World Map** _Top Right_

Use the filtering option to select the parameter and adjust the year slider to preview changes over time across the globe. Darker regions show a higher value concentration. 

**3) Sunburst Graph** _Bottom Left_

This chart segments TB cases by income groups (e.g., lower-middle-income) and countries affected.

TB is more prevalent in lower-income regions, emphasizing the socioeconomic factors influencing health outcomes.
Inner circles represent income groups, while outer circles display individual countries.

**4) Tree Map** _Bottom Center_

This visualization categorizes TB cases notified by region and country (based on case count). Only the top five are displayed.
Larger blocks represent countries with higher TB cases.
This helps identify high-burden countries and provides a comparative regional perspective.

**5) Force Directed Graph** _Bottom Right_

This graph visualizes the percentage of HIV test coverage in TB patients across various countries. A similarity threshold of 0.01 has been placed. 
Connections and clusters represent countries with similar HIV test coverage.
Regional color coding (e.g., Africa, Americas, Europe) highlights disparities in healthcare infrastructure and accessibility.

# Interactivity

Dropdown menus allow the selection of specific countries or regions.

Sliders enable the exploration of temporal trends over specific years.

Graph legends allow to focus on one region at a time.

Countries (and nodes on FDG) can be zoomed.

Filters allow a focused analysis of specific WHO regions (e.g., SE Asia, Europe, Americas).

# Data Source
All data used in this dashboard was acquired from the World Health Organization (WHO) TB Reports. The dataset encompasses global TB statistics, including new cases, treatment success rates, regional distributions, and HIV test coverage percentages.

The starter codes for the graph were taken from https://observablehq.com/@d3/gallery

For a live demo, visit https://ismail-hafeez.github.io/TB-Dashboard/

