// Define the path to the CSV file
const dataUrl = 'Internet_data2.csv';

// Set up dimensions and margins
const margin = { top: 40, right: 30, bottom: 50, left: 60 },
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// Create SVG container
const svg = d3.select("#chart")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", `translate(${margin.left},${margin.top})`);

// Create scales
const xScale = d3.scaleLinear().range([0, width]);
const yScale = d3.scaleLinear().range([height, 0]);

// Define line generator
const line = d3.line()
               .x(d => xScale(d.Year))
               .y(d => yScale(d.Value));

// Load the data and initialize the dropdowns
d3.csv(dataUrl, d3.autoType).then(data => {
    // Add continent information manually if it's not already in the dataset
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
        "Antarctica": [
            // Antarctica is typically not associated with any population or internet data
        ],
        "Other": [
            "Total, all countries or areas", "Other non-specified areas", 
            "Various small islands, territories, or unspecified areas", "Caribbean", 
            "LDC§"  // This represents Least Developed Countries or unspecified areas
        ]
    };
    

    data.forEach(d => {
        // Map each country/area to a continent using continentMap
        d.Continent = Object.keys(continentMap).find(continent => 
            continentMap[continent].includes(d.Area)
        ) || "Other";  // Assign "Other" if no continent found
    });

    // Populate the continent dropdown
    const continentSelect = d3.select("#continent-select");
    const countrySelect = d3.select("#country-select");

    // Populate the country dropdown initially with all unique countries
    const uniqueCountries = Array.from(new Set(data.map(d => d.Area))).sort();
    uniqueCountries.forEach(country => {
        countrySelect.append("option").text(country).attr("value", country);
    });

    // Set up the initial domain for scales based on the full dataset
    xScale.domain(d3.extent(data, d => d.Year));
    yScale.domain([0, d3.max(data, d => d.Value)]);

    // Add axes
    svg.append("g").attr("class", "x-axis").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
    svg.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale));

    // Function to update the chart based on selected countries
    function updateChart(selectedCountries) {
        // Filter data for the selected countries/regions
        const filteredData = data.filter(d => selectedCountries.includes(d.Area));

        // Nest data by area (country/region)
        const nestedData = d3.groups(filteredData, d => d.Area);

        // Bind data to lines and update
        const lines = svg.selectAll(".line").data(nestedData, d => d[0]);

        // Enter new lines
        lines.enter().append("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", (d, i) => d3.schemeCategory10[i % 10]) // Use different colors for different lines
            .attr("stroke-width", 2)
            .merge(lines)
            .attr("d", d => line(d[1])); // Update path for each country

        // Remove old lines
        lines.exit().remove();
    }

    // Initial chart update with no countries selected
    updateChart([]);

    // Event listener for the continent dropdown
    continentSelect.on("change", function() {
        const selectedContinent = this.value;
        let filteredCountries = uniqueCountries;

        // Filter countries by the selected continent
        if (selectedContinent !== "all") {
            filteredCountries = data.filter(d => d.Continent === selectedContinent).map(d => d.Area);
        }

        // Update the country dropdown options with unique countries for the selected continent
        countrySelect.selectAll("option").remove();
        Array.from(new Set(filteredCountries)).sort().forEach(country => {
            countrySelect.append("option").text(country).attr("value", country);
        });

        // Trigger chart update based on the initial selection of filtered countries
        const selectedCountries = Array.from(countrySelect.property("selectedOptions")).map(option => option.value);
        updateChart(selectedCountries);
    });

    // Event listener for the country dropdown
    countrySelect.on("change", function() {
        const selectedCountries = Array.from(this.selectedOptions).map(option => option.value);
        updateChart(selectedCountries);
    });
});
