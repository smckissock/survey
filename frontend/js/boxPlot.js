// Wrapper for dc.js boxPlot
export class BoxPlot {
    constructor(attribute, config) {
        this.dim = config.facts.dimension(dc.pluck(attribute));
        this.group = this.dim.group().reduce(
            // Add function - return array directly
            (p, v) => {
                const value = +v[attribute];
                if (!isNaN(value)) 
                    p.push(value);
                return p;
            },
            // Remove function - work with array
            (p, v) => {
                const value = +v[attribute];
                if (!isNaN(value)) {
                    const index = p.indexOf(value);
                    if (index > -1) 
                        p.splice(index, 1);
                    
                }
                return p;
            },
            // Initialize function - return empty array
            () => []
        ); // Remove the extra closing parenthesis here

        dc.boxPlot("#" + attribute + "-box-plot")
            .dimension(this.dim)
            .group(this.group)
            .width(config.width)
            .height(300)
            .margins({ top: 20, right: 20, bottom: 40, left: 40 })
            //.elasticY(true)
            .colors(["#83b4db"])
            .boxPadding(0.8)
            .outerPadding(0.5)
            .on('filtered', () => {
                config.updateFunction();
            })
            .yAxis().tickFormat(d3.format(".2f"));
    }
}