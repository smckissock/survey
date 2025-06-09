// Wrapper for dc.js ScatterPlot
export class ScatterPlot {
    constructor(xAttribute, yAttribute, title, config) {
        this.xAttribute = xAttribute;
        this.yAttribute = yAttribute;
        this.title = title;
        this.config = config;
        this.id = `#${xAttribute}-plot`;

        this.xValues = config.facts.all().map(d => +d[xAttribute]);
        this.yValues = config.facts.all().map(d => +d[yAttribute]);

        this.xDomain = this.computeDomain(this.xValues);
        this.yDomain = this.computeDomain(this.yValues);

        this.dim = config.facts.dimension(d => [+d[xAttribute], +d[yAttribute]]);
        this.group = this.dim.group().reduceSum(dc.pluck("count"));

        this.renderChart();
        this.overrideXAxisLabels();
        this.drawRegressionLine();
    }

    computeDomain(values) {
        const extent = d3.extent(values);
        const padding = (extent[1] - extent[0]) * 0.1;
        return [extent[0] - padding, extent[1] + padding];
    }

    renderChart() {
        const container = d3.select(this.id);
        container.select('.chart-title').remove();
        container.insert('div', ':first-child')
            .attr('class', 'chart-title')
            .text(this.title);

        this.chart = dc.scatterPlot(this.id)
            .dimension(this.dim)
            .group(this.group)
            .width(this.config.width)
            .height(this.config.height)
            .margins({ top: 20, right: 20, bottom: 40, left: 40 })
            .x(d3.scaleLinear().domain(this.xDomain))
            .y(d3.scaleLinear().domain(this.yDomain))
            .brushOn(false)
            .symbolSize(8)
            .clipPadding(10)
            .colors(["#83b4db"])
            .xAxisLabel(this.xAttribute)
            .yAxisLabel(this.yAttribute)
            .renderHorizontalGridLines(true)
            .renderVerticalGridLines(true)
            .on('filtered', () => {
                this.config.updateFunction();
            });
    }

    overrideXAxisLabels() {
        const getLabelOverrides = (attribute) => {
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
        };

        const labelMap = getLabelOverrides(this.xAttribute);
        if (!labelMap) return;

        const tickVals = Object.keys(labelMap).map(k => +k);
        this.chart.xAxis().tickValues(tickVals);

        this.chart.on('renderlet.xLabels', chart => {
            chart.selectAll('.x.axis .tick text')
                .text(d => labelMap[d.toFixed(1)] || d);
        });
    }

    drawRegressionLine() {
        const { xValues, yValues } = this;
        if (!xValues.length || !yValues.length) return;

        const { slope, intercept } = (() => {
            const xMean = d3.mean(xValues);
            const yMean = d3.mean(yValues);
            const covariance = d3.sum(xValues.map((x, i) => (x - xMean) * (yValues[i] - yMean)));
            const variance = d3.sum(xValues.map(x => Math.pow(x - xMean, 2)));
            const slope = covariance / variance;
            const intercept = yMean - slope * xMean;
            return { slope, intercept };
        })();

        this.chart.on('renderlet.trendline', chart => {
            const svg = d3.select(`${this.id} svg`);
            svg.selectAll('.trendline').remove();

            const innerG = svg.select('g.chart-body');
            const xScale = chart.x();
            const yScale = chart.y();

            const xMin = xScale.domain()[0];
            const xMax = xScale.domain()[1];
            const yMin = slope * xMin + intercept;
            const yMax = slope * xMax + intercept;

            innerG.append("line")
                .attr("class", "trendline")
                .attr("x1", xScale(xMin))
                .attr("y1", yScale(yMin))
                .attr("x2", xScale(xMax))
                .attr("y2", yScale(yMax))
                .attr("stroke", "crimson")
                .attr("stroke-width", 4)
                .attr("stroke-dasharray", "4 2");
        });
    }
}
