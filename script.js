const dataUrl = 'Internet_data2.csv';

const margin = { top: 40, right: 30, bottom: 50, left: 60 },
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// Create SVG container
const svg = d3.select("#chart")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", `translate(${margin.left},${margin.top})`);

const xScale = d3.scaleLinear().range([0, width]);
const yScale = d3.scaleLinear().range([height, 0]);

const line = d3.line()
               .x(d => xScale(d.Year))
               .y(d => yScale(d.Value));

d3.csv(dataUrl, d3.autoType).then(data => {
    const continentMap = {
        "Asia": [
            "Afghanistan", "Armenia", "Azerbaijan", "Bahrain", "Bangladesh", 
            "Bhutan", "Brunei Darussalam", "Central Asia", "Eastern Asia", 
            "South-central Asia", "South-eastern Asia", "Southern Asia", 
            "Western Asia", "China", "China, Hong Kong SAR", "China, Macao SAR",
            "India", "Indonesia", "Iran (Islamic Republic of)", "Iraq", "Israel",
            "Japan", "Jordan", "Kazakhstan", "Kuwait", "Kyrgyzstan", 
            "Lao People's Dem. Rep.", "Lebanon", "Malaysia", "Maldives", 
            "Mongolia", "Myanmar", "Nepal", "Oman", "Pakistan", "Philippines", 
            "Qatar", "Republic of Korea", "Saudi Arabia", "Singapore", 
            "Sri Lanka", "State of Palestine", "Syrian Arab Republic", 
            "Tajikistan", "Thailand", "Timor-Leste", "Turkey", "Turkmenistan", 
            "United Arab Emirates", "Uzbekistan", "Viet Nam", "Yemen"
        ],
        "North America": [
            "Northern America", "Canada", "United States of America", "Mexico", 
            "Bahamas", "Bermuda", "British Virgin Islands", "Cayman Islands", 
            "Greenland", "Jamaica", "Puerto Rico", "Trinidad and Tobago", 
            "United States Virgin Islands"
        ],
        "South America": [
            "Latin America & the Caribbean", "Argentina", "Bolivia (Plurin. State of)", 
            "Brazil", "Chile", "Colombia", "Ecuador", "Guyana", "Paraguay", 
            "Peru", "Suriname", "Uruguay", "Venezuela (Boliv. Rep. of)"
        ],
        "Europe": [
            "Albania", "Andorra", "Austria", "Belarus", "Belgium", 
            "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus", 
            "Czechia", "Denmark", "Estonia", "Finland", "France", "Germany", 
            "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Latvia", 
            "Lithuania", "Luxembourg", "Malta", "Monaco", "Montenegro", 
            "Netherlands", "North Macedonia", "Norway", "Poland", "Portugal", 
            "Republic of Moldova", "Romania", "Russian Federation", "San Marino", 
            "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", 
            "Ukraine", "United Kingdom", "Gibraltar", "Guernsey", "Jersey", 
            "Isle of Man", "Faroe Islands", "Eastern Europe", "Northern Europe", 
            "Southern Europe", "Western Europe"
        ],
        "Australia": [
            "Australia", "New Zealand", "Oceania", "Australia and New Zealand", 
            "Micronesia", "Fiji", "Papua New Guinea", "Cook Islands", 
            "French Polynesia", "New Caledonia", "Niue", "Samoa", "Solomon Islands", 
            "Tonga", "Vanuatu", "Wallis and Futuna Islands"
        ],
        "Africa": [
            "Northern Africa", "Sub-Saharan Africa", "Eastern Africa", "Middle Africa", 
            "Southern Africa", "Western Africa", "Algeria", "Angola", "Benin", 
            "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon", 
            "Central African Republic", "Chad", "Comoros", "Congo", "Côte d’Ivoire",
            "Dem. Rep. of the Congo", "Djibouti", "Egypt", "Equatorial Guinea", 
            "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", 
            "Guinea", "Guinea-Bissau", "Kenya", "Lesotho", "Liberia", "Libya", 
            "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", 
            "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", 
            "Saint Helena", "Sao Tome and Principe", "Senegal", "Seychelles", 
            "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", 
            "Togo", "Uganda", "United Rep. of Tanzania", "Zambia", "Zimbabwe"
        ],
        "Other": [
            "Total, all countries or areas", "Other non-specified areas", 
            "Various small islands, territories, or unspecified areas", "Caribbean", 
            "LDC§"
        ]
    };

    data.forEach(d => {
        d.Continent = Object.keys(continentMap).find(continent => continentMap[continent].includes(d.Area)) || "Other";
    });

    const continentSelect = d3.select("#continent-select");
    const countrySelect = d3.select("#country-select");
    const uniqueCountries = Array.from(new Set(data.map(d => d.Area))).sort();

    uniqueCountries.forEach(country => {
        countrySelect.append("option").text(country).attr("value", country);
    });

    xScale.domain(d3.extent(data, d => d.Year));
    yScale.domain([0, d3.max(data, d => d.Value)]);

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
        
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale));

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text("Years");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .text("Percentage of individuals using the internet");

    // Function to update the chart based on selected countries and year range
    function updateChart(selectedCountries, yearStart = 1995, yearEnd = 2025) {
        const filteredData = data.filter(d => selectedCountries.includes(d.Area) && d.Year >= yearStart && d.Year <= yearEnd);
        const nestedData = d3.groups(filteredData, d => d.Area);
        const lines = svg.selectAll(".line").data(nestedData, d => d[0]);

        lines.enter().append("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", (d, i) => d3.schemeCategory10[i % 10])
            .attr("stroke-width", 2)
            .merge(lines)
            .attr("d", d => line(d[1]));

        lines.exit().remove();
    }

    // Initial chart update with no countries selected
    updateChart([]);

    // Event listener for the continent dropdown
    continentSelect.on("change", function() {
        const selectedContinent = this.value;
        let filteredCountries = uniqueCountries;

        if (selectedContinent !== "all") {
            filteredCountries = data.filter(d => d.Continent === selectedContinent).map(d => d.Area);
        }

        countrySelect.selectAll("option").remove();
        Array.from(new Set(filteredCountries)).sort().forEach(country => {
            countrySelect.append("option").text(country).attr("value", country);
        });

        const selectedCountries = Array.from(countrySelect.property("selectedOptions")).map(option => option.value);
        updateChart(selectedCountries);
    });

    // Event listener for the country dropdown
    countrySelect.on("change", function() {
        const selectedCountries = Array.from(this.selectedOptions).map(option => option.value);
        updateChart(selectedCountries);

        const selectedCountriesList = d3.select("#selected-countries-list");
        selectedCountriesList.selectAll("li").remove();
        selectedCountries.forEach(country => {
            selectedCountriesList.append("li").text(country);
        });
    });

    const yearStartInput = d3.select("#year-start");
    const yearEndInput = d3.select("#year-end");

    // Event listeners for year range sliders
    yearStartInput.on("input", updateYearRange);
    yearEndInput.on("input", updateYearRange);

    // Update chart based on selected year range and selected countries
    function updateYearRange() {
        const yearStart = +yearStartInput.property("value");
        const yearEnd = +yearEndInput.property("value");

        // Ensure the start year is not after the end year
        if (yearStart > yearEnd) {
            yearStartInput.property("value", yearEnd);
        }

        // Update the chart with the new year range
        const selectedCountries = Array.from(countrySelect.property("selectedOptions")).map(option => option.value);
        updateChart(selectedCountries, yearStart, yearEnd);
    }
});
