/**
 * Creato da Gianluca Mariani e Andrea Mariani il 13/07/2021 
 */

var dy = 150;
var dx = 100;

var gaugeTransactions = createDrawGauge("Numero di transazioni");
var gaugeUncles = createDrawGauge("Numero di blocchi abortiti");

var gPie = d3.select("div")
             .append("div")
             .style("display", "inline-block")
             .append("svg")
             .attr("width", 200)
             .attr("height", 150)
             .attr("id", "pie")
             .append("g")
             .attr("transform", "translate(" + 100 + "," + 90 + ")");

gPie.append("text")
    .attr("transform", "translate(" + 0 + "," + (-65) + ")")
    .attr("text-anchor", "middle")
    .text("Minatori");

gPie.append("circle")
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', 50)
    .style('fill', "#ddd");

var svg = d3.select("div")
            .append("div")
            .attr("id", "chart")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "80vh")
            .call(d3.zoom() 
                    .scaleExtent([0.1, 1])  
                    .on("zoom", function() { svg.attr("transform", d3.event.transform); }))
            .append("g");
        
var tree = d3.tree().nodeSize([dx, dy]);

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

// inizialmente vuoto
var gNode = svg.append("g")
               .attr("cursor", "pointer");

// configurazioni dello spinner
var spinnerOpts = {
  lines: 9, //  numero di linee da disegnare
  length: 9, // lunghezza di ogni linea
  width: 5, // spessore di ogni linea
  radius: 14, // raggio del cerchio dello spinner
  color: "#000000", // colore
  speed: 1.9, // giri al secondo
  trail: 40, // Percentuale di postluminescenza
  className: "spinner", // classe CSS assegnata allo spinner
};

var target = document.getElementById("chart");
var spinner = new Spinner(spinnerOpts);

function updateDraw(root, linkReward) {
    var nodes = root.descendants();
    var links = root.links();
    // computazione del nuovo layout
    tree(root);

    root.descendants().forEach(function(node) { 
        node.x = node.x + 300;
        node.y = node.y + 100;
      });

    // clausola update per i nodi
    // in questo modo il join dei dati non viene fatto sulla base dell'ordine
    var node = gNode.selectAll("g")
                    .data(nodes, function(d) { return d.data.hash });

    // clausola enter per i nodi
    var nodeEnter = node.enter()
                        .insert("g", ":first-child")
                        .attr("transform", function(d) { return "translate(" + d.y + "," + (d.x - 5) + ")" })
                        .attr("fill-opacity", 1)
                        .attr("stroke-opacity", 1)
                        .attr("id", function(d) { return "n" + d.data.hash})
                        .on("click", function(d) {
                            click(d, root, linkReward);
                        })
                        .on("mouseover", handleMouseOver)
                        .on("mouseout", handleMouseOut);

    nodeEnter.append("rect")
             .attr("width", 30)
             .attr("height", 10)
             .attr("fill", function(d) {
                 if (d.children || d._children || d.data.uncles != null) 
                    return "green";
                 else return "red";
             });

    nodeEnter.append("text")
             .attr("y", -5)
             .attr("x", 60)
             .attr("text-anchor", "end")
             .text(function(d) { return d.data.hash.slice(0, 3) + "..." + d.data.hash.slice(63, 66); });

    // clausola exit per i nodi
    node.exit().remove();

    // clausola update per i link
    var link = gLink.selectAll("path")
                    .data(links);

    // clausola enter per i link
    link.enter()
        .append("path")
        .attr("d", d3.linkHorizontal().x(function(d) { return d.y })
                                      .y(function(d) { return d.x }));

    // clausola exit per i link
    link.exit().remove();

}

function click(d, root, linkReward) {
    // questo è il caso in cui si clicca per chiudere i nodi
    if (d.children) {
        d._children = d.children;
        d.children = null;
        d3.selectAll("#reward").remove();
        updateDraw(root, linkReward);
        updateDrawReward(linkReward);
    } 
    // questo è il caso in cui si clicca per aprire i nodi
    else if (d._children) {
        d.children = d._children;
        d._children = null;
        d3.selectAll("#reward").remove();
        updateDraw(root, linkReward);
        updateDrawReward(linkReward);
    }

}

function handleMouseOver(d) {
    // si mette raise perché si deve mettere l'elemento del gruppo g per ultimo, in questo modo quando si disegna, essendo l'ultimo ad essere disegnato, sovrascrive le cose che stanno sotto (ordine degli elementi si vedono immaginando l'asse Z uscente dallo schermo del PC)
    d3.select(this)
      .raise()
      .select("text")
      .attr("fill", "red");

    // si controlla se si sta su un blocco della catena principale oppure si è su un blocco abortito
    if (d.data.uncles != null) {
        
        d3.select(this)
          .append("rect")
          .attr("y", 15)
          .attr("x", -15)
          .attr("width", 640)
          .attr("height", 240)
          .attr("stroke", "black")
          .attr("fill", "yellow")
          .attr("id", "hovering");

        d3.select(this)
          .append("text")
          .attr("y", 35)
          .attr("x", -10)
          .text("hash: " + d.data.hash)
          .attr("text-anchor", "start")
          .attr("id", "hovering");

        d3.select(this)
          .append("text")
          .attr("y", 65)
          .attr("x", -10)
          .text("altezza/numero di blocco: " + d.data.height)
          .attr("text-anchor", "start")
          .attr("id", "hovering"); 

        d3.select(this)
          .append("text")
          .attr("y", 95)
          .attr("x", -10)
          .text("numero di transazioni: " + d.data.trans_num)
          .attr("text-anchor", "start")
          .attr("id", "hovering");

        d3.select(this)
          .append("text")
          .attr("y", 125)
          .attr("x", -10)
          .text("blocchi pagati: " + d.data.uncles.map(function(e) { return e.slice(0, 3) + "..." + e.slice(63, 66) }))
          .attr("text-anchor", "start")
          .attr("id", "hovering");

        d3.select(this)
          .append("text")
          .attr("y", 155)
          .attr("x", -10)
          .text("limite di gas: " + d.data.gas_limit)
          .attr("text-anchor", "start")
          .attr("id", "hovering");

        d3.select(this)
          .append("text")
          .attr("y", 185)
          .attr("x", -10)
          .text("gas usato: " + d.data.gas_used)
          .attr("text-anchor", "start")
          .attr("id", "hovering");

        d3.select(this)
          .append("text")
          .attr("y", 215)
          .attr("x", -10)
          .text("minato da: " + d.data.miner)
          .attr("text-anchor", "start")
          .attr("id", "hovering");

        d3.select(this)
          .append("text")
          .attr("y", 245)
          .attr("x", -10)
          .text("nonce: " + d.data.nonce)
          .attr("text-anchor", "start")
          .attr("id", "hovering");
    }
    else {
        d3.select(this)
          .append("rect")
          .attr("y", 15)
          .attr("x", -15)
          .attr("width", 100)
          .attr("height", 30)
          .attr("stroke", "black")
          .attr("fill", "yellow")
          .attr("id", "hovering");

        d3.select(this)
          .append("text")
          .attr("y", 35)
          .attr("x", -10)
          .text("blocco uncle")
          .attr("text-anchor", "start")
          .attr("id", "hovering");
    }

}

function handleMouseOut() {
    d3.select(this)
      .select("text")
      .attr("fill", "black");

    d3.selectAll("#hovering").remove();
    
  }

function updateDrawReward(lst) {
    lst.forEach(function (e) {
      // bisogna controllare se ci sono entrambi i nodi per prendere le coordinate, potrebbe essere che un nodo risulta che ha pagato un nodo che però non è presente nella visualizzazione perché si trova in una porzione della blockchain che non viene visualizzata
      if (!d3.select("#n" + e[0]).empty() && !d3.select("#n" + e[1]).empty()) {
        x1 = d3.select("#n" + e[0])._groups[0][0].__data__.y + 15;
        y1 = d3.select("#n" + e[0])._groups[0][0].__data__.x; 
        x2 = d3.select("#n" + e[1])._groups[0][0].__data__.y + 30;
        y2 = d3.select("#n" + e[1])._groups[0][0].__data__.x; 
        gReward.append("path")
                .attr("d", "M " + x1 + ","+ y1 + "Q" + x1 + "," + y2 + " " + x2 + ","+ y2)
                .attr("stroke-dasharray", "10,10")
                .attr("stroke", "red")
                .attr("id", "reward");
        gReward.append("path")
               .attr("d", "M " + x2 + ","+ y2 + "L" + (x2 + 15) + "," + (y2 - 8) + " L" + (x2 + 15) + ","+ (y2 + 8) + "Z")
               .attr("fill", "red")
               .attr("stroke", "none")
               .attr("id", "reward");
      }
    });
}

function createDrawGauge(title) {

  // Place svg element
  var svg = d3.select("div")
              .append("div")
              .style("display", "inline-block")
              .append("svg")
              .attr("width", 200)
              .attr("height", 150)
              .attr("id", title.replace(/\s/g, '_'))
              .append("g")
              .attr("transform", "translate(" + 100 + "," + 125 + ")");

  svg.append("text")
     .attr("transform", "translate(" + 0 + "," + (-100) + ")")
     .attr("text-anchor", "middle")
     .text(title);

  // Append background arc to svg
  svg.append("path")
     .datum({ endAngle: 90 * Math.PI / 180 })
     .attr("d", d3.arc()
                  .innerRadius(90)
                  .outerRadius(50)
                  .startAngle(-90 * Math.PI / 180))
     .attr("fill", "#ddd");

  // Append foreground arc to svg
  svg.append("path")
     .attr("id", "foreground")
     .datum({ endAngle: -90 * Math.PI / 180 })
     .attr("d", d3.arc()
                  .innerRadius(90)
                  .outerRadius(50)
                  .startAngle(-90 * Math.PI / 180));

  // Display Max value
  svg.append("text")
     .attr("transform", "translate(" + 70 + ",15)") // Set between inner and outer Radius
     .attr("text-anchor", "middle")
     .attr("id", "max")
     .text("?");

  // Display Min value
  svg.append("text")
     .attr("transform", "translate(" + (- 70) + ",15)") // Set between inner and outer Radius
     .attr("text-anchor", "middle")
     .attr("id", "min")
     .text(0);

  // Display Current value  
  svg.append("text")
     .attr("transform", "translate(0," + (- 2,5) + ")") // Push up from center 1/4 of innerRadius
     .attr("text-anchor", "middle")
     .attr("id", "current");

}

function updateDrawGauge(title, maxValueLabel, maxValue, value) {

  var max = d3.select("#" + title.replace(/\s/g, '_'))
              .select("#max");

  var current = d3.select("#" + title.replace(/\s/g, '_'))
                  .select("#current");

  var foreground = d3.select("#" + title.replace(/\s/g, '_'))
                     .select("#foreground");

  if (maxValueLabel == "?") {
    max.text(maxValueLabel);
    current.text("")
    foreground.datum({ endAngle: -90 * Math.PI / 180 })
              .attr("d", d3.arc()
                           .innerRadius(90)
                           .outerRadius(50)
                           .startAngle(-90 * Math.PI / 180));
  }
  else {
    max.text(maxValueLabel);
    // Display Current value
    current.text(value);

    var numPi;

    if (value > maxValue) 
      numPi = Math.floor(value * 180 / maxValue - 90) * Math.PI / 180;
    else 
      numPi = Math.floor(value * 180 / maxValue - 90) * Math.PI / 180;

    foreground.style("fill", "orange")
              .datum({ endAngle: numPi })
              .attr("d", d3.arc()
                           .innerRadius(90)
                           .outerRadius(50)
                           .startAngle(-90 * Math.PI / 180));
  }

}

function updateDrawPie(data) {

  var radius = 50

  var color = d3.scaleOrdinal()
                .domain(data)
                .range(["red", "blue", "green", "orange", "grey"]);

  // Compute the position of each group on the pie:
  var pie = d3.pie()
              .value(function(d) { return d.value; });

  var data_ready = pie(d3.entries(data));

  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
  var pie = gPie.selectAll('path')
                .data(data_ready);
  pie.enter()
     .append('path')
     .attr('d', d3.arc()
                  .innerRadius(0)
                  .outerRadius(radius))
     .attr('fill', function(d){ return(color(d.data.key)) });

  pie.exit().remove();

}

function draw() {
    // rimozione di tutti gli elementi grafici nell'svg
    d3.select("#chart")
      .selectAll("svg")
      .selectAll("g")
      .selectAll("g")
      .selectAll("*")
      .remove();

    updateDrawGauge("Numero di transazioni", "?", 0, 0);
    updateDrawGauge("Numero di blocchi abortiti", "?", 0, 0);
    updateDrawPie({})

    var blockNum = document.getElementById("blockNum").value;
    var treeHeight = document.getElementById("treeHeight").value;

    spinner.spin(target);
    
    axios.get("http://localhost:5000/generate-tree?block=" + blockNum + "&height=" + treeHeight)
         .then(function(data) {
             spinner.stop();

             var root = d3.hierarchy(data.data[3]);

             // aggiornamento del disegno
             updateDraw(root, data.data[2]);
             updateDrawReward(data.data[2]);

             averageBlkTrans = 200

             updateDrawGauge("Numero di transazioni", treeHeight * averageBlkTrans / 1000 + "K", treeHeight * averageBlkTrans, data.data[0]);
             updateDrawGauge("Numero di blocchi abortiti", treeHeight * 2, treeHeight * 2, data.data[1]);

             updateDrawPie(data.data[4]);
            
         }).catch(function(error) {
                 console.log(error);
            });

}
