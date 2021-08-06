/**
 * Creato da Gianluca Mariani e Andrea Mariani il 13/07/2021 
 */

var dy = 150;
var dx = 100;
var width = 1250;
var height = 600;

var div = d3.select("div")
            .append("div")
            .attr("id", "chart");

var svg = div.append("svg")
             .style("font", "16px sans-serif")
             .attr("width", "100%")
             .attr("height", height)
             .call(d3.zoom() 
                     .scaleExtent([0.1, 1])  
                     .on("zoom", function () { svg.attr('transform', d3.event.transform); }))
             .append("g");
        
var tree = d3.tree().nodeSize([dx, dy]);

// inizialmente vuoto
var gNode = svg.append("g")
               .attr("cursor", "pointer");

// inizialmente vuoto
var gLink = svg.append("g")
               .attr("fill", "none")
               .attr("stroke", "#555")
               .attr("stroke-opacity", 0.4)
               .attr("stroke-width", 1.5);

// inizialmente vuoto
var gReward = svg.append("g")
                 .attr("fill", "none")
                 .attr("stroke", "#555")
                 .attr("stroke-opacity", 0.4)
                 .attr("stroke-width", 1.5);

function updateDraw(root, linkReward) {
    var nodes = root.descendants();
    var links = root.links();
    // computazione del nuovo layout
    tree(root);

    root.descendants().forEach(function (node) { 
        node.x = node.x + 300;
        node.y = node.y + 100;
      });

    // clausola update per i nodi
    var node = gNode.selectAll("g")
                    .data(nodes);

    // clausola enter per i nodi
    var nodeEnter = node.enter()
                        .append("g")
                        .attr("transform", function(d) { return "translate(" + d.y + "," + (d.x - 5) + ")" })
                        .attr("fill-opacity", 1)
                        .attr("stroke-opacity", 1)
                        .attr("id", function (d) { return "n" + d.data.name})
                        .on("click", function (d) {
                            click(d, root, linkReward);
                        })
                        .on("mouseover", handleMouseOver)
                        .on("mouseout", handleMouseOut);

    nodeEnter.append("rect")
             .attr("width", 30)
             .attr("height", 10)
             .attr("fill", function (d) {
                 if (d.children || d._children || d.data.uncles != null) 
                    return "green";
                 else return "red";
             });

    nodeEnter.append("text")
             .attr("y", -5)
             .attr("x", 60)
             .attr("text-anchor", "end")
             .text(function (d) { return d.data.name.slice(0, 3) + "..." + d.data.name.slice(63, 66); });

    // clausola exit per i nodi
    node.exit().remove();

    // clausola update per i link
    var link = gLink.selectAll("path")
                    .data(links);

    // clausola enter per i link
    link.enter()
        .append("path")
        .attr("d", d3.linkHorizontal().x(function (d) { return d.y })
                                      .y(function (d) { return d.x }));

    // clausola exit per i link
    link.exit().remove();

}

function click(d, root, linkReward) {
    // questo è il caso in cui si clicca per chiudere i nodi
    if (d.children) {
        d._children = d.children;
        d.children = null;
        d3.selectAll("line").remove();
        updateDraw(root, linkReward);
        updateDrawReward(linkReward);
    } 
    // questo è il caso in cui si clicca per aprire i nodi
    else if (d._children) {
        d.children = d._children;
        d._children = null;
        d3.selectAll("line").remove();
        updateDraw(root, linkReward);
        updateDrawReward(linkReward);
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
          .attr("y", 35)
          .attr("x", -10)
          .text("hash: " + d.data.name)
          .attr("text-anchor", "start")
          .attr('id', "t" + d.x + "-" + d.y + "-" + i);

        d3.select(this)
          .append('text')
          .attr("y", 65)
          .attr("x", -10)
          .text("altezza/numero di blocco: " + d.data.height)
          .attr("text-anchor", "start")
          .attr('id', "t" + d.x + "-" + d.y + "-" + i); 

        d3.select(this)
          .append('text')
          .attr("y", 95)
          .attr("x", -10)
          .text("numero di transazioni: " + d.data.trans_num)
          .attr("text-anchor", "start")
          .attr('id', "t" + d.x + "-" + d.y + "-" + i);

        d3.select(this)
          .append('text')
          .attr("y", 125)
          .attr("x", -10)
          .text("blocchi pagati: " + d.data.uncles.map(function (e) { return e.slice(0, 3) + "..." + e.slice(63, 66) }))
          .attr("text-anchor", "start")
          .attr('id', "t" + d.x + "-" + d.y + "-" + i);

        d3.select(this)
          .append('text')
          .attr("y", 155)
          .attr("x", -10)
          .text("limite di gas: " + d.data.gas_limit)
          .attr("text-anchor", "start")
          .attr('id', "t" + d.x + "-" + d.y + "-" + i);

        d3.select(this)
          .append('text')
          .attr("y", 185)
          .attr("x", -10)
          .text("gas usato: " + d.data.gas_used)
          .attr("text-anchor", "start")
          .attr('id', "t" + d.x + "-" + d.y + "-" + i);
    }
    else 
        d3.select(this)
          .append('text')
          .attr("y", 35)
          .attr("x", -10)
          .text("blocco abortito")
          .attr("text-anchor", "start")
          .attr('id', "t" + d.x + "-" + d.y + "-" + i);

}

function handleMouseOut(d, i) {
    d3.select(this)
      .select("text")
      .attr("fill", "black");

    d3.selectAll("#t" + d.x + "-" + d.y + "-" + i).remove();
    
  }

function updateDrawReward(lst) {
  lst.forEach(function (e) {
    // bisogna controllare se ci sono entrambi i nodi per prendere le coordinate, potrebbe essere che un nodo risulta che ha pagato un nodo che però non è presente nella visualizzazione perché si trova in una porzione della blockchain che non viene visualizzata
    if (!d3.select("#n" + e[0]).empty() && !d3.select("#n" + e[1]).empty())
      gReward.append("line")
             .attr("x1", d3.select("#n" + e[0])._groups[0][0].__data__.y)
             .attr("x2", d3.select("#n" + e[1])._groups[0][0].__data__.y)
             .attr("y1", d3.select("#n" + e[0])._groups[0][0].__data__.x)
             .attr("y2", d3.select("#n" + e[1])._groups[0][0].__data__.x);
   });
}

function draw() {
    // rimozione di tutti gli elementi grafici nell'svg
    d3.select("div")
      .select("div")
      .select("svg")
      .select("g")
      .selectAll('g')
      .selectAll("*")
      .remove();

    var blockNum = document.getElementById("blockNum").value;
    var treeHeight = document.getElementById("treeHeight").value;

    // configurazioni dello spinner
    var opts = {
        lines: 9, //  numero di linee da disegnare
        length: 9, // lunghezza di ogni linea
        width: 5, // spessore di ogni linea
        radius: 14, // raggio del cerchio dello spinner
        color: '#000000', // colore
        speed: 1.9, // giri al secondo
        trail: 40, // Percentuale di postluminescenza
        className: 'spinner', // classe CSS assegnata allo spinner
    };
  
    var target = document.getElementById('chart');
    var spinner = new Spinner(opts).spin(target);
    
    axios.get("http://localhost:5000/generate-tree?block=" + blockNum + "&height=" + treeHeight)
         .then(function(data) {
             spinner.stop();

             var root = d3.hierarchy(data.data[3]);

            //  console.log(data.data[0])
            //  console.log(data.data[1])

             // aggiornamento del disegno
             updateDraw(root, data.data[2]);
             updateDrawReward(data.data[2]);
             
         }).catch(function(error) {
                 console.log(error);
            });

}