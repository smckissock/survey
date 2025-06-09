// Wrapper for dc.js ScatterPlot
export class ScatterPlot {
    constructor(xAttribute, yAttribute, title, config) {
        this.dim = config.facts.dimension(d => [+d[xAttribute], +d[yAttribute]]);
        this.group = this.dim.group().reduceSum(dc.pluck("count"));
        
        // Calculate domains with padding
        const xValues = config.facts.all().map(d => +d[xAttribute]);
        const yValues = config.facts.all().map(d => +d[yAttribute]);
        
        const xExtent = d3.extent(xValues);
        const yExtent = d3.extent(yValues);
        
        const xPadding = (xExtent[1] - xExtent[0]) * 0.1;
        const yPadding = (yExtent[1] - yExtent[0]) * 0.1;
        
        const xDomain = [xExtent[0] - xPadding, xExtent[1] + xPadding];
        const yDomain = [yExtent[0] - yPadding, yExtent[1] + yPadding];
        
        const id = `#${xAttribute}-plot`
        const container = d3.select(id);
        container.select('.chart-title').remove();
        container.insert('div', ':first-child')
            .attr('class', 'chart-title')
            .text(title);
        
        this.chart = dc.scatterPlot(id)
            .dimension(this.dim)
            .group(this.group)
            .width(config.width)
            .height(config.height)
            .margins({ top: 20, right: 20, bottom: 40, left: 40 })
            .x(d3.scaleLinear().domain(xDomain))
            .y(d3.scaleLinear().domain(yDomain))
            .brushOn(false)
            .symbolSize(8)
            .clipPadding(10)
            .colors(["#83b4db"])
            .xAxisLabel(xAttribute)
            .yAxisLabel(yAttribute)
            .renderHorizontalGridLines(true)
            .renderVerticalGridLines(true)
            .on('filtered', () => {
                config.updateFunction();
            });
                    
        // Replace numeric tick labels
        const labelMap = this.getLabelOverrides(xAttribute);
        if (labelMap) {
            const tickVals = Object.keys(labelMap).map(k => +k);
            this.chart.xAxis().tickValues(tickVals);

            this.chart.on('renderlet', chart => {
                chart.selectAll('.x.axis .tick text')
                    .text(d => labelMap[d.toFixed(1)] || d);
            });
        }
    }

    // Ugh
    getLabelOverrides(attribute) {
        if (attribute === "income_value") {
            return {
                "1.0": "Low",
                "2.0": "Lower-Middle",
                "3.0": "Upper-Middle",
                "4.0": "High"
            };
        }
        if (attribute === "education_level_value") {
            return {
                "1.0": "High School",
                "2.0": "Some College",
                "3.0": "Assoc.",
                "4.0": "BA",
                "5.0": "MA",
                "6.0": "PhD"
            };
        }
        return null;
    }
}
