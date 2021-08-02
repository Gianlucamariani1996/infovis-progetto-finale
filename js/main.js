/**
 * Creato da Gianluca Mariani e Andrea Mariani il 13/07/2021 
 */

var dy = 200;
var dx = 240;
var width = 1200;
var height = 400;

var div = d3.select("div")
            .append("div")
            .attr("id", "chart");

var svg = d3.select("div")
            .select("div")
            .append("svg")
            .style("font", "16px sans-serif")
            .attr("width", width)
            .attr("height", height)
            .attr("id", "svg")
            .call(d3.zoom() 
                    .scaleExtent([-1, 10])  
                    .on("zoom", function() { svg.attr('transform', d3.event.transform); }))
            .append("g");
        
var tree = d3.tree().nodeSize([dx, dy]);

// inizialmente vuoti
var gNode = svg.append("g")
               .attr("cursor", "pointer")
               .attr("pointer-events", "all");

// inizialmente vuoti
var gLink = svg.append("g")
               .attr("fill", "none")
               .attr("stroke", "#555")
               .attr("stroke-opacity", 0.4)
               .attr("stroke-width", 1.5);

function updateDraw(root) {
    var nodes = root.descendants();
    var links = root.links();
    // computazione del nuovo layout
    tree(root);

    root.descendants().forEach(function (node) { 
        node.x = node.x + height / 2;
        node.y = node.y + width / 6;
      });

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
                 if (d.children) 
                    return "#555";
                 else return "#999";
             });

    // non si può appendere direttamente sopra, perché tutte queste cose vanno appese all'oggetto restituito sopra 
    nodeEnter.append("text")
             .attr("dy", "-0.5em")
             .attr("x", "65")
             .attr("text-anchor", "end")
             .text(function(d) { return d.data.name.slice(0, 3) + "..." + d.data.name.slice(63, 66); })
             .clone(true).lower()
             .attr("stroke-linejoin", "round");

    // clausola exit per i nodi
    node.exit().remove();

    // clausola update per i link
    var link = gLink.selectAll("path")
                    .data(links, function(d) { return d.target.id });

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
    if (d.children) {
        d._children = d.children;
        d.children = null;
        updateDraw(root);
    } 
    // questo è il caso in cui si clicca per aprire i nodi
    else if (d._children) {
        d.children = d._children;
        d._children = null;
        updateDraw(root);
    }

}

function handleMouseOver(d, i) {
    d3.select(this)
      .select("text")
      .attr("fill", "red");

    // si controlla se si sta su un blocco della catena principale oppure si è su un blocco abortito
    if (d.data.uncles != null) {

        d3.select(this)
          .append("rect")
          .attr("y", 15)
          .attr("x", -15)
          .attr("width", 640)
          .attr("height", 190)
          .attr("stroke", "#000000")
          .attr("fill", "none")
          .attr('id', "t" + d.x + "-" + d.y + "-" + i);

        d3.select(this)
          .append('text')
          .attr("dy", "2em")
          .attr("x", -10)
          .text("hash: " + d.data.name)
          .attr("text-anchor", "start")
          .attr('id', "t" + d.x + "-" + d.y + "-" + i);

        d3.select(this)
          .append('text')
          .attr("dy", "4em")
          .attr("x", -10)
          .text("altezza/numero di blocco: " + d.data.height)
          .attr("text-anchor", "start")
          .attr('id', "t" + d.x + "-" + d.y + "-" + i); 

        d3.select(this)
          .append('text')
          .attr("dy", "6em")
          .attr("x", -10)
          .text("numero di transazioni: " + d.data.trans_num)
          .attr("text-anchor", "start")
          .attr('id', "t" + d.x + "-" + d.y + "-" + i);

        d3.select(this)
          .append('text')
          .attr("dy", "8em")
          .attr("x", -10)
          .text("blocchi pagati: " + d.data.uncles.map(function(e) { return e.slice(0, 3) + "..." + e.slice(63, 66) }))
          .attr("text-anchor", "start")
          .attr('id', "t" + d.x + "-" + d.y + "-" + i);

        d3.select(this)
          .append('text')
          .attr("dy", "10em")
          .attr("x", -10)
          .text("limite di gas: " + d.data.gas_limit)
          .attr("text-anchor", "start")
          .attr('id', "t" + d.x + "-" + d.y + "-" + i);

        d3.select(this)
          .append('text')
          .attr("dy", "12em")
          .attr("x", -10)
          .text("gas usato: " + d.data.gas_used)
          .attr("text-anchor", "start")
          .attr('id', "t" + d.x + "-" + d.y + "-" + i);
    }
    else 
        d3.select(this)
          .append('text')
          .attr("dy", "2em")
          .attr("x", -10)
          .text("blocco abortito")
          .attr("text-anchor", "start")
          .attr('id', "t" + d.x + "-" + d.y + "-" + i);

}

function handleMouseOut(d, i) {
    d3.select(this)
      .select("text")
      .attr("fill", "black");

    // Select text by id and then remove
    d3.selectAll("#t" + d.x + "-" + d.y + "-" + i).remove();  // Remove text location
    
  }

function draw() {
    d3.select("div")
      .select("div")
      .select("svg")
      .select("g")
      .selectAll('g')
      .selectAll("*")
      .remove();

    var blockNum = document.getElementById("blockNum").value;
    var treeHeight = document.getElementById("treeHeight").value;

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
    
    axios.get("http://localhost:5000/generate-tree?block=" + blockNum + "&height=" + treeHeight)
         .then(function(data) {
             spinner.stop();

             var root = d3.hierarchy(data.data[2]);

            //  console.log(data.data[0])
            //  console.log(data.data[1])

             // aggiornamento del disegno
             updateDraw(root);
         }).catch(function(error) {
                 console.log(error);
            });

}