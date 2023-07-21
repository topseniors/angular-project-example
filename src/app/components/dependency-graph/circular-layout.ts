import * as d3 from 'd3';

const D2R = Math.PI / 180;

export default class CircularLayout {

    constructor(carrier, data, appender) {

        let {nodes, links} = data;

        let arc = 360 / nodes.length;
        let simulation = d3.forceSimulation()
            .force("collide", d3.forceCollide(function (d:any) {
                return Math.max(d.width, d.length)
            }).iterations(16))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(carrier.width / 2, carrier.height / 2))
            .force("y", d3.forceY(10))
            .force("x", d3.forceX(10))

        var linksGroup = carrier.root.append('g');
        var group = carrier.root.append('g');
        let maxSize = 0;

        let nodesIndex = nodes.reduce((memo, item) => {
            let obj = appender(group, Object.assign(item, {class: 'node'}));
            let [mw, mh] = [parseInt(obj.attr('mw')), obj.attr('mh')];

            maxSize = Math.max(maxSize, mw, mh);
            if (item.id) {
                memo[item.id] = item;
            }
            return memo;

        }, {});


        if (links) {
            links.forEach(link => {
                link.source = nodesIndex[link.from];
                link.target = nodesIndex[link.to];

                linksGroup.append("path")
                    .attr("class", "link flowline")
                    .attr("stroke", link.color || "rgba(0,0,0,.5)")
                    .attr("stroke-width", link.width || 1);
            });


        }


        var node = carrier.root.selectAll('.node')
            .data(nodes);

        var link = linksGroup.selectAll(".link")
            .data(links)


        function radial(data, index) {
            var radius = maxSize + 40;
            var currentAngle = arc * index;
            var currentAngleRadians = currentAngle * D2R;

            var radialPoint = {
                x: carrier.width / 2 + radius * Math.cos(currentAngleRadians),
                y: carrier.height / 2 + radius * Math.sin(currentAngleRadians)
            };

            data.x += (radialPoint.x - data.x) * .2;
            data.y += (radialPoint.y - data.y) * .2;
        }


        let center = carrier.engine.getTransformOf({
            x: Math.round(carrier.width / 2),
            y: Math.round(carrier.height / 2)
        });

        var ticked = function () {
            node.each(function (d, i) {
                radial(d, i);
            });

            link.attr("d", (d) => {
                if (d.source && d.target) {
                    let source = carrier.engine.getTransformOf(d.source, true);
                    let target = carrier.engine.getTransformOf(d.target, true);

                    return "M" + source[0] + "," + source[1]
                        + "S" + center[0] + "," + center[1]
                        + " " + target[0] + "," + target[1];
                }
            });
            node.attr('transform', (d) => {
                let position = carrier.engine.getTransformOf(d);
                return `translate(${position[0]}, ${position[1]})`;
            });
        };


        simulation
            .nodes(nodes)
            .on("tick", ticked);

    }

}
