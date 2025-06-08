// Simple ScatterPlot component for numeric data
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
        
        // Add title
        const container = d3.select("#" + xAttribute + "-plot");
        container.select('.chart-title').remove();
        container.insert('div', ':first-child')
            .attr('class', 'chart-title')
            .style('text-align', 'center')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .style('margin-bottom', '10px')
            .style('color', '#374151')
            .text(title);
        
        // Create chart
        this.chart = dc.scatterPlot("#" + xAttribute + "-plot")
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
            
        // Add custom x-axis labels for categorical data
        // const categoryLabels = this.getCategoryLabels(xAttribute);
        // if (categoryLabels) {
        //     this.chart.on('renderlet', (chart) => {
        //         // Remove default tick labels
        //         chart.select('.x.axis').selectAll('.tick text').remove();
                
        //         // Add custom labels
        //         const xScale = chart.x();
        //         Object.entries(categoryLabels).forEach(([value, label]) => {
        //             chart.select('.x.axis')
        //                 .append('text')
        //                 .attr('x', xScale(+value))
        //                 .attr('y', 15)
        //                 .attr('text-anchor', 'middle')
        //                 .style('font-size', '12px')
        //                 .text(label);
        //         });
        //     });
        // }
    }
    
    getCategoryLabels(attribute) {
        const labelMappings = {
            income_value: {
                1: "Low",
                2: "Lower-Middle", 
                3: "Upper-Middle",
                4: "High"
            },
            education_level_value: {
                1: "High School",
                2: "Some College",
                3: "Associate Degree",
                4: "Bachelor's Degree",
                5: "Master's Degree",
                6: "Doctorate"
            }
        };
        
        return labelMappings[attribute] || null;
    }
}