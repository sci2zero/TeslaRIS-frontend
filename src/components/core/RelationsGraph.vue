<template>
    <div ref="svgContainer"></div>
</template>
  
  <script>
  import { ref, onMounted, defineComponent } from 'vue';
  import * as d3 from 'd3';
  
  export default defineComponent({
    name: "RelationsGraph",
    setup() {
      const svgContainer = ref(null);
  
      onMounted(() => {
        createForceLayout(svgContainer.value);
      });
  
      function createForceLayout(container) {
        const width = 700;
        const height = 500;
  
        const nodes = [
          { id: 0, name: 'Node 1' },
          { id: 1, name: 'Node 2' },
          { id: 2, name: 'Node 3' },
          { id: 3, name: 'Node 4' },
        ];
  
        const links = [
          { source: 0, target: 1 },
          { source: 1, target: 2 },
          { source: 2, target: 0 },
          { source: 3, target: 0 },
        ];
  
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);
  
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(200))
            .force('charge', d3.forceManyBody().strength(-50))
            .force('center', d3.forceCenter(width / 2, height / 2));
  
        const link = svg.selectAll('line')
            .data(links)
            .enter().append('line')
            .attr('stroke', '#999')
            .attr('stroke-width', '1');
  
        const node = svg.selectAll('circle')
            .data(nodes)
            .enter().append('circle')
            .attr('r', 50)
            .attr('fill', '#69b3a2')
            .call(d3.drag()
                .on('start', dragStarted)
                .on('drag', dragged)
                .on('end', dragEnded));
        
        const elemEnter = node.append("g")
            .attr("transform", function(d){return "translate(" + d.x + ",80)"});

        elemEnter.append('text')
            .attr('x', 0)
            .attr('y', 4)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('fill', 'black')
            .text(d => d.name);
  
        function dragStarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
  
        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }
  
        function dragEnded(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
  
        simulation.on('tick', () => {
            link.attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            link.attr('x1', d => d.source.x + 5)
                .attr('y1', d => d.source.y + 5)
                .attr('x2', d => d.target.x - 5)
                .attr('y2', d => d.target.y - 5); 
    
            node.attr('cx', d => d.x)
                .attr('cy', d => d.y);
        });
      }
  
      return {
        svgContainer,
      };
    },
  });
  </script>
  
  <style scoped>
  /* Add CSS if needed */
  </style>
  