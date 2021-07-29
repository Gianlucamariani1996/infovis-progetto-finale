/**
 * Creato da Gianluca Mariani e Andrea Mariani il 13/07/2021 
 */

var dy = 110;
var dx = 160;
var width = 5000;
var height = 6000;

var div = d3.select("div")
            .append("div")
            .classed('containerAlbero', true)
            .attr("id", "chart");

// var zoom = d3.zoom().on("zoom", zoomed);

var svg = d3.select("div")
            .select("div")
            .append("svg")
            .classed('viewContainer', true)
            .style("font", "16px sans-serif")
            .attr("width", width)
            .attr("height", height)
            .attr("id", "svg");
            // .call(zoom)
            // .on("dblclick.zoom", null)

// d3.select("#zoom_in").on("click", function() {
//     zoom.scaleBy(svg.transition().duration(750), 1.2);
//     });
//     d3.select("#zoom_out").on("click", function() {
//     zoom.scaleBy(svg.transition().duration(750), 0.8);
//     });
    
//     function zoomed() {
//         svg.attr("transform", d3.event.transform);
//     }

// ragionare un attimo su come mettere queste variabili anche in base al progetto precedente
var tree = d3.tree().nodeSize([dx, dy]);

var gNode = svg.append("g")
               .attr("cursor", "pointer")
               .attr("pointer-events", "all");

var gLink = svg.append("g")
               .attr("fill", "none")
               .attr("stroke", "#555")
               .attr("stroke-opacity", 0.4)
               .attr("stroke-width", 1.5);

function updateDraw(root) {
    var nodes = root.descendants();
    var links = root.links();
    tree(root);

    root.descendants().forEach(function (node) { 
        node.x = node.x + height / 2;
        node.y = node.y + 100});

    // clausola update per i nodi
    var node = gNode.selectAll("g")
                    .data(nodes, function(d) { return d.id });

    // clausola enter per i nodi
    var nodeEnter = node.enter()
                        .append("g")
                        .attr("transform", function(d) { return "translate(" + d.y + "," + (d.x - 5) + ")" })
                        .attr("fill-opacity", 1)
                        .attr("stroke-opacity", 1)
                        .on("click", function(d) {
                            click(d, root);
                        })
                        .on("mouseover", handleMouseOver)
                        .on("mouseout", handleMouseOut);

    // non si può appendere direttamente sopra, perché tutte queste cose vanno appese all'oggetto restituito sopra
    nodeEnter.append("rect")
             .attr("width", 30)
             .attr("height", 10)
             .attr("fill", function(d) {
                 if (d._children) 
                    return "#555";
                 else return "#999";
             });

    // non si può appendere direttamente sopra, perché tutte queste cose vanno appese all'oggetto restituito sopra
    nodeEnter.append("text")
             .attr("dy", "-0.5em")
             .attr("x", "65")
             .attr("text-anchor", "end")
             .text(function(d) { return d.data.name; })
             .clone(true).lower()
             .attr("stroke-linejoin", "round");

    // clausola exit per i nodi
    node.exit().remove();

    // clausola update per i link
    var link = gLink.selectAll("path")
                    .data(links, function(d) { return d.target.id});

    // clausola enter per i link
    link.enter()
        .append("path")
        .attr("d", d3.linkHorizontal().x(function(d) { return d.y })
                                      .y(function(d) { return d.x }))
        .attr("stroke-opacity", 0.5);

    // clausola exit per i link
    link.exit().remove();

}

function click(d, root) {
    // prova a richiamare updateDraw con d invece che con root e vedi che succede, magari serve per capire il codice

    // questo è il caso in cui si clicca per chiudere i nodi
    if (d.children != null) {
        d.children = null;
        updateDraw(root);
    } 
    // questo è il caso in cui si clicca per aprire i nodi
    else if (d._children) {
        d.children = d._children;
        updateDraw(root);
    }
}

function handleMouseOver(d, i) {
    d3.select(this)
      .style('fill', 'red');

    var g = svg.append('g')
               .attr('id', "t" + d.x + "-" + d.y + "-" + i)

    // si controlla se si sta su un blocco della catena principale oppure si è su un blocco abortito
    if (d.data.uncles != null) {
        g.append('text')
         .attr('x', d.y - 15)
         .attr('y', d.x + 20)
         .text("numero di transazioni: " + d.data.trans_num)
         .attr("text-anchor", "start")

         g.append('text')
         .attr('x', d.y - 15)
         .attr('y', d.x + 40)
         .text("blocchi pagati: " + d.data.uncles)
         .attr("text-anchor", "start")

         g.append('text')
         .attr('x', d.y - 15)
         .attr('y', d.x + 60)
         .text("limite di gas: " + d.data.gas_limit)
         .attr("text-anchor", "start")

         g.append('text')
         .attr('x', d.y - 15)
         .attr('y', d.x + 80)
         .text("gas usato: " + d.data.gas_used)
         .attr("text-anchor", "start")
    }
    else 
        g.append('text')
         .attr('x', d.y - 15)
         .attr('y', d.x + 20)
         .text("blocco abortito")
         .attr("text-anchor", "start")
}

function handleMouseOut(d, i) {
    d3.select(this)
      .style('fill', 'black');

    // Select text by id and then remove
    d3.select("#t" + d.x + "-" + d.y + "-" + i).remove();  // Remove text location
    
  }

function draw() {
    d3.select("div")
      .select("div")
      .select("svg")
      .selectAll("g")
      .selectAll('*')
      .remove();
    // viene utilizzata la libreria JQuery per interrogare gli elementi del file html e dirgli che lo scroll del div deve essere messo centralmente
    $(document).ready(function() {
        $(document).ready(function() {
            var outerContent = $('.containerAlbero');
            var innerContent = $('.viewContainer');
            // outerContent.scrollLeft((innerContent.width() - outerContent.width()) / 2);
            outerContent.scrollTop((innerContent.height() - outerContent.height()) / 2);
        });
    });
    var blockNum = document.getElementById("blockNum").value;

    // loader settings
    var opts = {
        lines: 9, // The number of lines to draw
        length: 9, // The length of each line
        width: 5, // The line thickness
        radius: 14, // The radius of the inner circle
        color: '#000000', // #rgb or #rrggbb or array of colors
        speed: 1.9, // Rounds per second
        trail: 40, // Afterglow percentage
        className: 'spinner', // The CSS class to assign to the spinner
    };
  
    var target = document.getElementById('chart');
    var spinner = new Spinner(opts).spin(target);
    
    axios.get("http://localhost:5000/generate-tree?height=" + blockNum)
         .then(function(data) {
             
             spinner.stop();

             // queste due istruzioni vanno fatto qua perché si devono "far scomparire i figli"
             var root = d3.hierarchy(data.data);

             root.descendants()
                 .forEach(function(d, i) {
                     d.id = i;
                     d._children = d.children;
                     d.children = null;
                 });
             // aggiornamento del disegno
             updateDraw(root);
         }).catch(function(error) {
                 console.log(error);
            });
}