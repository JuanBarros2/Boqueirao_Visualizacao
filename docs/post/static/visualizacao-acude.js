let streamGraph = (dados) => {
    let layerName = ["carros", "total_pedestres", "motos","total_ciclistas",  "onibus"];
    let legenda = ["Carro", "Pedestres","Moto", "Ciclista", "Ônibus"].reverse();
    var colors = ['#8dd3c7','#ffffb3','#bebada','#fb8072', '#80b1d3'];

    dados = dados.filter((dado) => dado.local == "jackson" );

    var stack = d3.stack().keys(layerName).offset(d3.stackOffsetWiggle),
    layers0 = stack(dados),
    layers = layers0;

    var svg = d3.select("#visu1"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

    var x = d3.scaleLinear()
    .domain([0, dados.length - 1])
    .range([0, width]);

    var y = d3.scaleLinear()
    .domain([d3.min(layers, stackMin), d3.max(layers, stackMax)])
    .range([height, 0]);

    var area = d3.area()
        .x((d, i) => x(i))
        .y0((d) => y(d[0]))
        .y1((d) => y(d[1]));

    svg.selectAll("path")
    .data(layers0)
    .enter().append("path")
    .attr("d", area)
    .attr("fill", (d, i) => colors[i]);

    colors = colors.reverse();
    var legend = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "start")
        .selectAll("g")
        .data(legenda)
        .enter().append("g")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    legend.append("rect")
        .attr("x", width - 80 )
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", (d, i) => colors[i]);

    legend.append("text")
        .attr("x", width - 56 )
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(d => d);

    function stackMax(layer) {
    return d3.max(layer, function(d) { return d[1]; });
    }

    function stackMin(layer) {
    return d3.min(layer, function(d) { return d[0]; });
    }
}

let heatmap = (dados) => {  
    const alturaSVG = 400, larguraSVG = 900; 
    const margin = {top: 10, right: 20, bottom:40, left: 45}, 
    larguraVis = larguraSVG - margin.left - margin.right, 
    alturaVis = alturaSVG - margin.top - margin.bottom;
    
    dados = dados.filter((dado) => dado.local == "jackson" );

    let dados_filtrados = [ 
        {
            "veiculo" : "Carro",
            "quant" : d3.sum(dados, (dado) => dado.carros),
            "espaco" : 4.3,
            "cor" : "#80C783"
        },    
        { 
            "veiculo" : "Ônibus",
            "quant" : d3.sum(dados, (dado) => dado.onibus),
            "espaco" : 12,
            "cor" : "#3B6EAC"
        },
        {
            "veiculo" : "Moto",
            "quant" : d3.sum(dados, (dado) => dado.motos),
            "espaco" : 2,
            "cor" : "#BCADD1"
        },
        {
            "veiculo" : "Ciclistas",
            "quant" : d3.sum(dados, (dado) => dado.total_ciclistas),
            "espaco" : 1.8,
            "cor" : "#EE107D"
        }
    ];

    let grafico = d3.select('#visu2')
    .append('svg')
    .attr('width', larguraVis + margin.left + margin.right)
    .attr('height', alturaVis + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    let x = d3.scaleLinear()
        .domain([d3.min(dados_filtrados, (d) => d.quant) - 500, d3.max(dados_filtrados, (d) => d.quant) + 500])
        .range([0, larguraVis]); 
    let y = d3.scaleLinear()
        .domain([(d3.min(dados_filtrados, (d) => d.quant * d.espaco) / 1000) - 1, (d3.max(dados_filtrados, (d, i) => d.quant * d.espaco) / 1000) + 1])
        .range([0, alturaVis])
        .rangeRound([alturaVis, 0]); 
        
    let circles = grafico.selectAll('g')
        .data(dados_filtrados)
        .enter()
        .append('circle')
            .attr('cy', d => y((d.quant * d.espaco)/1000))
            .attr('cx', d => x(d.quant))
            .attr('r', 40)
            .attr('fill', (d) => d.cor);
    grafico.append("g")
        .attr("transform", "translate(0," + alturaVis + ")")
        .call(d3.axisBottom(x)); 

    grafico.append('g')
        .call(d3.axisLeft(y));
    grafico.append("text")
        .attr("transform", "translate(-30," + (alturaVis + margin.top)/2 + ") rotate(-90)")
        .text("Espaço gasto (Km)");
    grafico.append("text")
        .attr("transform", "translate(" + ((larguraVis)/2) + "," + (alturaVis + 30) + " )")
        .text("Total de Veículo"); 

};

d3.csv('https://raw.githubusercontent.com/luizaugustomm/pessoas-no-acude/master/dados/processados/dados.csv', function(dados) {
    streamGraph(dados);
    heatmap(dados);
});

