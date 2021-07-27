/**
 * Creato da Gianluca Mariani e Andrea Mariani il 13/07/2021 
 */

var dy = 110;
var dx = 160;
var width = 5000;
var height = 6000;

var div = d3.select("div")
            .append("div")
            .classed('containerAlbero', true);

var svg = d3.select("div")
            .select("div")
            .append("svg")
            .classed('viewContainer', true)
            .style("font", "16px sans-serif")
            .attr("width", width)
            .attr("height", height)
            .attr("id", "svg");

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

    root.descendants().forEach(node => {
        node.x = node.x + height/2;
        node.y = node.y + width/2;
    });

    // clausola update per i nodi
    var node = gNode.selectAll("g")
                    .data(nodes, d => d.id);

    // clausola enter per i nodi
    var nodeEnter = node.enter()
                        .append("g")
                        .attr("transform", d => `translate(${d.y},${d.x})`)
                        .attr("fill-opacity", function(d) {
                            if (d.data.name == "nullo")
                                return 0;
                            else
                                return 1;
                        })
                        .attr("stroke-opacity", 1)
                        .on("click", function(d) {
                            click(d, root);
                        });

    // non si può appendere direttamente sopra, perché tutte queste cose vanno appese all'oggetto restituito sopra
    nodeEnter.append("rect")
             .attr("width", 20)
             .attr("height", 20)
             .attr("fill", function(d) {
                 var flag = "false";
                 if (d._children) {
                     d._children.forEach(figlio => {
                         if (figlio.data.name != "nullo")
                             flag = "true";
                     })
                 }
                 if (flag == "false")
                     return "#999";
                 else
                     return "#555";
             });

    // non si può appendere direttamente sopra, perché tutte queste cose vanno appese all'oggetto restituito sopra
    nodeEnter.append("text")
             .attr("dy", "-0.5em")
             .attr("x", d => d._children ? 35 : -6)
             .attr("text-anchor", d => d._children ? "end" : "end")
             .text(function(d) {
                 if (d.data.name == "nullo")
                     return "";
                 else
                     return d.data.name;
             })
             .clone(true).lower()
             .attr("stroke-linejoin", "round");

    // clausola exit per i nodi
    node.exit().remove();

    // clausola update per i link
    var link = gLink.selectAll("path")
                    .data(links, d => d.target.id);

    // clausola enter per i link
    link.enter()
        .append("path")
        .attr("d", d3.linkHorizontal().x(d => d.y)
                                        .y(d => d.x))
        .attr("stroke-opacity", d => d.target.data.name == "nullo" ? 0 : 0.5);

    // clausola exit per i link
    link.exit().remove();

}

function click(d, root) {
    // prova a richiamare updateDraw con d invece che con root e vedi che succede, magari serve per capire il codice
    var flag = "false";
    if (d.children != null) {
        d.children = null;
        updateDraw(root);
    } else {
        var flag = "false";
        if (d._children) {
            d._children.forEach(figlio => {
                if (figlio.data.name != "nullo")
                    flag = "true";
            })
            if (flag == "true") {
                d.children = d._children;
                updateDraw(root);
            }
        }

    }
}

function myFunction() {
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
            outerContent.scrollLeft((innerContent.width() - outerContent.width()) / 2);
            outerContent.scrollTop((innerContent.height() - outerContent.height()) / 2);
        });
    });
    var n = document.getElementById("num").value;

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
    
    axios.get("http://localhost:5000/generate-tree?height=" + n)
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
                 console.log("errore altezza");
             });
}