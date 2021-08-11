/**
 * Creato da Gianluca Mariani e Andrea Mariani il 13/07/2021 
 */

// larghezza ed altezza degli svg relativi ai misuratori (gauge), al grafico a torta e alla legenda
var widthGaugePieLegendChart = 360;
var heightGaugePieLegendChart = 200;

// larghezza ed altezza dell'svg relativo all'albero
var widthTreeChart = 1440;
var heightTreeChart = 500;

// parametri di configurazione e funzioni ausiliare per il disegno del gauge
var gaugeConf = {
  minValue: 0,
  maxValue: "?",
  currentLabelInset: 20,
  oR: 50,
  iR: 90
}

function deg2rad(deg) {
  return deg * Math.PI / 180
}

function getColor(value, maxValue) {
  var ticks = [{
    tick: 0,
    color: "green"
  }, {
    tick: maxValue * 1 / 4,
    color: "yellow"
  }, {
    tick: maxValue * 3 / 4,
    color: "orange"
  }, {
    tick: maxValue,
    color: "rgb(220, 57, 19)"
  }]
  // si trova il colore corrispondente al valore
  var colorValue;
  ticks.forEach(function(tick) {
          if (value > tick.tick) {
            colorValue = tick.color
          }
        });
  return colorValue;
}

function arcTween(transition, newAngle) {
  var arc = d3.arc()
              .innerRadius(gaugeConf.iR)
              .outerRadius(gaugeConf.oR)
              .startAngle(deg2rad(-90));
              
  transition.attrTween("d", function(d) {
                var interpolate = d3.interpolate(d.endAngle, newAngle);
                return function(t) {
                  d.endAngle = interpolate(t);
                  return arc(d);
                };
            });
}

var gaugeTransactions = createDrawGauge("Numero di transazioni");
var gaugeUncles = createDrawGauge("Numero di blocchi uncle");
/**---------------------------------------------------------------------------------------------------- */

// parametri di configurazione per il disegno del grafico a torta
var colorMiner = {
  "Ethermine": "rgb(51, 102, 204)",
  "SparkPool": "rgb(220, 57, 19)",
  "f2pool": "rgb(16,150,24)",
  "Hiveon Pool": "rgb(153, 1, 153)",
  "Altri": "grey"
}

var miners = {
  "0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8": "Ethermine",
  "0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c": "SparkPool",
  "0x829BD824B016326A401d083B33D092293333A830": "f2pool",
  "0x1aD91ee08f21bE3dE0BA2ba6918E714dA6B45836": "Hiveon Pool",
}

var pieConf = {
  oR: 50,
  iR: 20
}

var gPie = d3.select("div")
             .append("div")
             .attr("class", "gaugePieLegendCharts")
             .append("svg")
             .attr("width", widthGaugePieLegendChart)
             .attr("height", heightGaugePieLegendChart)
             .append("g")
             .attr("transform", "translate(" + widthGaugePieLegendChart / 3 + "," + heightGaugePieLegendChart * 3 / 5 + ")");

gPie.append("text")
    .attr("transform", "translate(" + 0 + "," + - (heightGaugePieLegendChart * 7 / 20) + ")")
    .attr("text-anchor", "middle")
    .text("Minatori");

gPie.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", pieConf.oR)
    .style("fill", "#ddd");
/**---------------------------------------------------------------------------------------------------- */

// disegno della legenda
var gLegend = d3.select("div")
                .append("div")
                .attr("class", "gaugePieLegendCharts")
                .append("svg")
                .attr("width", widthGaugePieLegendChart) //questi sono attributi svg non possono essere messi come stile
                .attr("height", heightGaugePieLegendChart)
                .append("g")
                .attr("transform", "translate(" + widthGaugePieLegendChart * 1 / 12 + "," + heightGaugePieLegendChart * 1 / 4 + ")");

gLegend.append("text")
       .text("Legenda:");

gLegend.append("rect")
       .attr("x", 10)
       .attr("y", 20)
       .attr("width", 30)
       .attr("height", 10)
       .attr("fill", "green");         
        
gLegend.append("text")
       .attr("x", 60)
       .attr("y", 30)
       .text("blocco catena principale");

gLegend.append("rect")
       .attr("x", 10)
       .attr("y", 50)
       .attr("width", 30)
       .attr("height", 10)
       .attr("fill", "rgb(220, 57, 19)")   

gLegend.append("text")
       .attr("x", 60)
       .attr("y", 60)
       .text("blocco uncle");

gLegend.append("path")
       .attr("d", "M " + 10 + "," + 85 + "H" + 40)
       .attr("stroke-dasharray", "5,5")
       .attr("stroke", "rgb(220, 57, 19)")

gLegend.append("path")
       .attr("d", "M " + 40 + "," + 85 + "L" + (40 - 10) + "," + (85 - 7) + " L" + (40 - 10) + "," + (85 + 7) + "Z")
       .attr("fill", "rgb(220, 57, 19)")
       .attr("stroke", "none")

gLegend.append("text")
       .attr("x", 60)
       .attr("y", 90)
       .text("uncle ricompensato");
/**---------------------------------------------------------------------------------------------------- */

// parametri di configurazione per il disegno dell'albero
var treeConf = {
  dy: 150,
  dx: 100
}

var treeSVG = d3.select("div")
                .append("div")
                .attr("id", "treeChart")
                .append("svg")
                .attr("width", widthTreeChart)
                .attr("height", heightTreeChart)
                .attr("id", "treeSVG")
                .call(d3.zoom() 
                        .scaleExtent([0.1, 1])  
                        .on("zoom", function() { treeSVG.attr("transform", d3.event.transform); })
                      )
                .on("dblclick.zoom", null)
                .append("g");

var tree = d3.tree().nodeSize([treeConf.dx, treeConf.dy]);

var gLink = treeSVG.append("g")
                   .attr("fill", "none")
                   .attr("stroke", "#555")
                   .attr("stroke-opacity", 0.4)
                   .attr("stroke-width", 1.5);

var gReward = treeSVG.append("g")
                     .attr("fill", "none")
                     .attr("stroke", "#555")
                     .attr("stroke-opacity", 0.4)
                     .attr("stroke-width", 1.5);

var gNode = treeSVG.append("g")
                   .attr("cursor", "pointer");
/**---------------------------------------------------------------------------------------------------- */

// parametri di configurazione per il disegno dello spinner
var spinnerConf = {
  lines: 9, //  numero di linee da disegnare
  length: 9, // lunghezza di ogni linea
  width: 5, // spessore di ogni linea
  radius: 14, // raggio del cerchio dello spinner
  color: "#000000", // colore
  speed: 1.9, // giri al secondo
  trail: 40 // percentuale di postluminescenza
};

var target = document.getElementById("treeChart");
var spinner = new Spinner(spinnerConf);
/**---------------------------------------------------------------------------------------------------- */

function updateDrawTree(root, linkReward) {
  var nodes = root.descendants();
  var links = root.links();
  // computazione del nuovo layout
  tree(root);

  root.descendants().forEach(function(node) { 
      node.x = node.x + heightTreeChart / 2;
      node.y = node.y + widthTreeChart * 5 / 72;
    });

  // clausola update per i nodi
  // oltre a passare i nodi si passa anche l'hash, in questo modo il join dei dati non viene fatto sulla base 
  // dell'ordine il quale verrà cambiato successivamente per sovrascrivere i disegni sottostanti
  var node = gNode.selectAll("g")
                  .data(nodes, function(d) { return d.data.hash });

  // clausola enter per i nodi
  // si deve mettere l'insert perché quando si sta su un nodo e si clicca i figli vanno messi in testa, se venissero
  // messi in coda il disegno sarebbe sovrapposto
  var nodeEnter = node.enter()
                      .insert("g", ":first-child")
                      .attr("transform", function(d) { return "translate(" + d.y + "," + (d.x - 5) + ")" })
                      .attr("fill-opacity", 1)
                      .attr("stroke-opacity", 1)
                      .attr("id", function(d) { return "n" + d.data.hash})
                      .on("click", function(d) {
                          click(d, root, linkReward);
                      })
                      .on("mouseover", handleMouseOverTree)
                      .on("mouseout", handleMouseOutTree);

  nodeEnter.append("rect")
            .attr("width", 30)
            .attr("height", 10)
            .attr("fill", function(d) {
                if (d.children || d._children || d.data.uncles != null) 
                  return "green";
                else return "rgb(220, 57, 19)";
            });
  
  // la callback della "x" serve per spostare la label del nodo in base al numero di cifre, 
  // in modo da centrarla
  nodeEnter.append("text")
            .attr("y", -5)
            .attr("x", function(d) { 
              if (d.data.uncles != null) {
                digits = d.data.height.toString().length
                if (digits == 1)  return 9
                else return 9 - (6 * (digits - 1)) 
              }
              else return -17;
            })
            .text(function(d) { if (d.data.uncles != null) return d.data.height; else return d.data.hash.slice(0, 3) + "..." + d.data.hash.slice(63, 66); });

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
      updateDrawTree(root, linkReward);
      updateDrawReward(linkReward);
  } 
  // questo è il caso in cui si clicca per aprire i nodi
  else if (d._children) {
      d.children = d._children;
      d._children = null;
      d3.selectAll("#reward").remove();
      updateDrawTree(root, linkReward);
      updateDrawReward(linkReward);
  }

}

function handleMouseOverTree(d) {
  // si mette raise perché si deve mettere l'elemento del gruppo g per ultimo, in questo modo quando si disegna, essendo l'ultimo ad essere disegnato, sovrascrive le cose che stanno sotto (ordine degli elementi si vedono immaginando l'asse Z uscente dallo schermo del PC)
  d3.select(this)
    .raise()
    .select("text")
    .attr("fill", "rgb(220, 57, 19)");

  // si controlla se si sta su un blocco della catena principale oppure si è su un blocco abortito
  if (d.data.uncles != null) {
      d3.select(this)
        .append("rect")
        .attr("y", 15)
        .attr("x", -15)
        .attr("width", 800)
        .attr("height", 220)
        .attr("stroke", "black")
        .attr("fill", "rgb(255, 255, 130)")
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
        .text("numero di transazioni: " + d.data.trans_num)
        .attr("text-anchor", "start")
        .attr("id", "hovering");

      d3.select(this)
        .append("text")
        .attr("y", 95)
        .attr("x", -10)
        .text("uncle ricompensati: [" + d.data.uncles.map(function(e) { return e.slice(0, 3) + "..." + e.slice(63, 66) }) + "]")
        .attr("text-anchor", "start")
        .attr("id", "hovering");

      d3.select(this)
        .append("text")
        .attr("y", 125)
        .attr("x", -10)
        .text("limite di gas: " + d.data.gas_limit)
        .attr("text-anchor", "start")
        .attr("id", "hovering");

      d3.select(this)
        .append("text")
        .attr("y", 155)
        .attr("x", -10)
        .text("gas usato: " + d.data.gas_used)
        .attr("text-anchor", "start")
        .attr("id", "hovering");

      d3.select(this)
        .append("text")
        .attr("y", 185)
        .attr("x", -10)
        .text(function() { if (miners[d.data.miner] == null) return "minato da: " + d.data.miner; else return "minato da: " + d.data.miner + " (" + miners[d.data.miner] + ")"; }) 
        .attr("text-anchor", "start")
        .attr("id", "hovering");

      d3.select(this)
        .append("text")
        .attr("y", 215)
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
        .attr("width", 120)
        .attr("height", 30)
        .attr("stroke", "black")
        .attr("fill", "rgb(255, 255, 130)")
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

function handleMouseOutTree() {
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
                .attr("d", "M " + x1 + "," + y1 + "Q" + x1 + "," + y2 + " " + x2 + "," + y2)
                .attr("stroke-dasharray", "10,10")
                .attr("stroke", "rgb(220, 57, 19)")
                .attr("id", "reward");
        gReward.append("path")
                .attr("d", "M " + x2 + "," + y2 + "L" + (x2 + 15) + "," + (y2 - 8) + " L" + (x2 + 15) + "," + (y2 + 8) + "Z")
                .attr("fill", "rgb(220, 57, 19)")
                .attr("stroke", "none")
                .attr("id", "reward");
    }
  });
}

function createDrawGauge(title) {

  var gGauge = d3.select("div")
                .append("div")
                .attr("class", "gaugePieLegendCharts")
                .append("svg")
                .attr("width", widthGaugePieLegendChart)
                .attr("height", heightGaugePieLegendChart)
                .attr("id", title.replace(/\s/g, "_")) // il titolo con gli "_" che sostituiscono gli " " diventa l'id
                .append("g")
                .attr("transform", "translate(" + widthGaugePieLegendChart / 2 + "," + heightGaugePieLegendChart * 4 / 5 + ")");

  gGauge.append("text")
        .attr("transform", "translate(" + 0 + "," + - (heightGaugePieLegendChart * 11 / 20) + ")")
        .attr("text-anchor", "middle")
        .text(title);
     
  var arc = d3.arc()
              .innerRadius(gaugeConf.iR)
              .outerRadius(gaugeConf.oR)
              .startAngle(deg2rad(-90));

  // background dell'arco
  gGauge.append("path")
        .datum({ endAngle: deg2rad(90) })
        .attr("d", arc)
        .attr("fill", "#ddd");

  // foreground dell'arco
  gGauge.append("path")
        .attr("id", "foreground")
        .datum({ endAngle: deg2rad(-90) })
        .attr("d", arc);

  // etichetta valore massimo
  gGauge.append("text")
        .attr("transform", "translate(" + (gaugeConf.iR + ((gaugeConf.oR - gaugeConf.iR) / 2)) + ",20)")
        .attr("text-anchor", "middle")
        .attr("id", "max")
        .text(gaugeConf.maxValue);

  // etichetta valore minimo
  gGauge.append("text")
        .attr("transform", "translate(" + -(gaugeConf.iR + ((gaugeConf.oR - gaugeConf.iR) / 2)) + ",20)")
        .attr("text-anchor", "middle")
        .attr("id", "min")
        .text(gaugeConf.minValue);

  // etichetta valore corrente
  gGauge.append("text")
     .attr("transform", "translate(0," + -(-gaugeConf.currentLabelInset + gaugeConf.iR / 4) + ")")
     .attr("text-anchor", "middle")
     .attr("id", "current");

}

function updateDrawGauge(title, maxValueLabel, maxValue, value) {
  var curColor = "green";
  var newColor = getColor(value, maxValue);

  var max = d3.select("#" + title.replace(/\s/g, "_"))
              .select("#max");

  var current = d3.select("#" + title.replace(/\s/g, "_"))
                  .select("#current");

  var foreground = d3.select("#" + title.replace(/\s/g, "_"))
                     .select("#foreground");

  var arc = d3.arc()
              .innerRadius(gaugeConf.iR)
              .outerRadius(gaugeConf.oR)
              .startAngle(deg2rad(-90));

  if (maxValueLabel == "?") {
    max.text(maxValueLabel);
    current.text("")
    foreground.datum({ endAngle: deg2rad(-90) })
              .attr("d", arc);
  }
  else {
    max.text(maxValueLabel);
    current.text(value);

    var numPi;

    if (value > maxValue) 
      numPi = deg2rad(Math.floor(maxValue * 180 / maxValue - 90));
    else 
      numPi = deg2rad(Math.floor(value * 180 / maxValue - 90));

      foreground.transition()
                .duration(2000)
                .styleTween("fill", function() {
                  return d3.interpolate(curColor, newColor);
                })
                .call(arcTween, numPi);
  }

}

function updateDrawPie(data) {
  var miners = [];
  var colors = [];

  var pie = d3.pie()
              .value(function(d) { return d.value; });

  var data_ready = pie(d3.entries(data));

  // clausola update torta
  var pie = gPie.selectAll("g")
                .data(data_ready);

  // clausola enter torta
  pie.enter()
     .append("g")
     .attr("cursor", "pointer")
     .on("mouseover", handleMouseOverPie)
     .on("mouseout", handleMouseOutPie)
     .append("path")
     .attr("d", d3.arc()
                  .innerRadius(pieConf.iR)
                  .outerRadius(pieConf.oR))
     .attr("fill", function(d) { 
            colors.push(colorMiner[d.data.key]); 
            miners.push(d.data.key); 
            return colorMiner[d.data.key]; 
      });

  // clausola exit torta
  pie.exit().remove();

  var legendRectSize = 18;
  var legendSpacing = 4;

  // clausola update, enter legenda
  var legend = gPie.selectAll(".legend")
                   .data(miners)
                   .enter()
                   .append("g")
                   .attr("class", "legend")
                   .attr("transform", function(d, i) {
                      var height = legendRectSize + legendSpacing;
                      var offset =  height * colors.length / 2;
                      var horizontal = 5 * legendRectSize;
                      var vertical = i * height - offset;
                      return "translate(" + horizontal + "," + vertical + ")";
                    });

  legend.append("rect")
        .attr("width", 10)
        .attr("height", 10)                                   
        .style("fill", function(d) { return colorMiner[d]; } )
        .style("stroke", function(d) { return colorMiner[d]; })          
        .attr("rx", 5)
        .attr("ry", 5)                    
            
  legend.append("text")
        .attr("x", 13 + legendSpacing)
        .attr("y", 13 - legendSpacing)
        .text(function(d) { return d; });

  // clausola exit legenda
  legend.exit().remove();

}

function handleMouseOverPie(d) {

  var label = d3.arc()
                .outerRadius(100)
                .innerRadius(20)
                .centroid(d);

  d3.select(this)
    .raise()
    .append("rect")
    .attr("x", label[0] - 60)
    .attr("y", label[1] - 15)
    .attr("width", 140)
    .attr("height", 25)
    .attr("stroke", "black")
    .attr("fill", "rgb(255, 255, 130)")
    .attr("id", "hovering");

  d3.select(this)
    .append("text")
    .attr("x", label[0] + 10)
    .attr("y", label[1] + 5)
    .text(d.data.key + ": " + d.data.value)
    .attr("text-anchor", "middle")
    .attr("id", "hovering");
    
}

function handleMouseOutPie() {
  d3.selectAll("#hovering").remove();
}

function draw() {
    // rimozione di tutti gli elementi grafici nell'svg dell'albero
    d3.select("#treeChart")
      .select("svg")
      .select("g")
      .selectAll("g")
      .selectAll("*")
      .remove();

    // reset dei gauge
    updateDrawGauge("Numero di transazioni", "?", 0, 0);
    updateDrawGauge("Numero di blocchi uncle", "?", 0, 0);

    // reset torta sfruttando la clausa exit
    updateDrawPie({});

    // si prendono il numero di blocco e l'altezza inseriti dall'utente
    var blockNum = document.getElementById("blockNum").value;
    var treeHeight = document.getElementById("treeHeight").value;

    // si fa girare lo spinner
    spinner.spin(target);
    
    axios.get("http://localhost:5000/generate-tree?block=" + blockNum + "&height=" + treeHeight)
         .then(function(data) {
            // si ferma lo spinner
            spinner.stop();

            // si resetta lo zoom dell'svg dell'albero
            d3.select("#treeSVG")
              .call(d3.zoom() 
                      .scaleExtent([0.1, 1])  
                      .on("zoom", function() { treeSVG.attr("transform", d3.event.transform); }).transform, d3.zoomIdentity.translate(0, 0).scale(1))
            
            // aggiornamento dei vari disegni
            var root = d3.hierarchy(data.data[3]);
            updateDrawTree(root, data.data[2]);
            updateDrawReward(data.data[2]);

            averageBlkTrans = 200
            updateDrawGauge("Numero di transazioni", treeHeight * averageBlkTrans / 1000 + "K", treeHeight * averageBlkTrans, data.data[0]);
            updateDrawGauge("Numero di blocchi uncle", treeHeight * 2, treeHeight * 2, data.data[1]);

            updateDrawPie(data.data[4]);
            
         }).catch(function(error) {
                 console.log(error);
            });

}