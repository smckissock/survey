
// 
export class RowChart {
    constructor(facts, attribute, width, updateFunction) {
        this.dim = facts.dimension(dc.pluck(attribute));
        this.group = this.dim.group().reduceSum(dc.pluck("count"));
        
        dc.rowChart("#" + attribute)
            .dimension(this.dim)
            .group(this.group)
            .width(width)
            .height(this.group.size() * 26)
            .margins({ top: 0, right: 10, bottom: 20, left: 10 })
            .elasticX(true)
            .ordinalColors(["#c6dbef"])  
            .label(d => `${d.key}  (${d.value.toLocaleString()})`)
            .labelOffsetX(5)
            .on('filtered', () => {
                updateFunction()
            })
            .xAxis().ticks(4).tickFormat(d3.format(".2s"));
    }
}
