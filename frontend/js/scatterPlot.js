// Wrapper for dc.js ScatterPlot
export class ScatterPlot {
    constructor(xAttribute, yAttribute, title, config) {
        this.dim = config.facts.dimension(d => [+d[xAttribute], +d[yAttribute]]);
        this.group = this.dim.group().reduceSum(dc.pluck("count"));
        
        const calculateDomain = (attribute) => {
            const values = config.facts.all().map(d => +d[attribute]);
            const extent = d3.extent(values);
            const padding = (extent[1] - extent[0]) * 0.05;
            return [extent[0] - padding, extent[1] + padding];
        };

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
        
        this.chart = dc.scatterPlot("#" + xAttribute + "-plot")
            .dimension(this.dim)
            .group(this.group)
            .width(config.width)
            .height(config.height)
            .margins({ top: 20, right: 20, bottom: 40, left: 40 })
            .x(d3.scaleLinear().domain(calculateDomain(xAttribute)))
            .y(d3.scaleLinear().domain(calculateDomain(yAttribute)))
            .brushOn(true)
            .symbolSize(6)
            .clipPadding(10)
            .colors(["#83b4db"])
            .on('filtered', () => {
                config.updateFunction();
            });
    }
}