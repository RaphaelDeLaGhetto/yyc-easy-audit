/**
 * 2018-10-3 
 * 
 * I didn't want to have to use proprietary tiles. This article came to the
 * rescue:
 * 
 * http://asmaloney.com/2014/01/code/creating-an-interactive-map-with-leaflet-and-openstreetmap/
 */

var map = L.map('audit-map', {
  center: [51.14880, -114.25275],
  minZoom: 2,
  zoom: 20 
});

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: ['a', 'b', 'c']
}).addTo(map);


var myIcon = L.icon({
  iconUrl: '/maps/images/pin24.png',
  iconRetinaUrl: '/maps/images/pin48.png',
  iconSize: [29, 24],
  iconAnchor: [9, 21],
  popupAnchor: [0, -14]
})

/**
 * Plugin to label points
 *
 * 2018-10-5
 * Apapted from http://www.chartjs.org/samples/latest/advanced/data-labelling.html
 */
Chart.plugins.register({
  afterDatasetsDraw: function(chart) {
    var ctx = chart.ctx;

    chart.data.datasets.forEach(function(dataset, i) {
      var meta = chart.getDatasetMeta(i);
      if (!meta.hidden) {
        meta.data.forEach(function(element, index) {
          // Draw the text in black, with the specified font
          ctx.fillStyle = 'rgb(0, 0, 0)';

          var fontSize = 12;
          var fontStyle = 'normal';
          var fontFamily = 'Helvetica Neue';
          ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);

          // Get house number 
          var dataString = dataset.data[index].label;

          // Make sure alignment settings are correct
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          var padding = 5;
          var position = element.tooltipPosition();
          if (dataString) {
            ctx.fillText(dataString, position.x, position.y - (fontSize / 2) - padding);
          }
        });
      }
    });
  }
});

/**
 * Event handler for marker clicks
 */
markers.forEach((block, i) => {
  var regressionData = block.map(function(report) {
    return [report.size, report.assessment];
  });
  var regressionLine = regression('linear', regressionData).points.map(function(point) {
    return { x: point[0], y: point[1] };
  });
  var regressionLine = regressionLine.sort(function(a, b) {
    return a.x - b.x;
  });
  
  block.forEach(function(marker, j) {
    function renderChart(blockIndex, propertyIndex, marker, regressionLine) {
      var blockIndex = blockIndex;
      var propertyIndex = propertyIndex;
      var regressionLine = regressionLine;
      var marker = marker;
      var markerIndex = '' + blockIndex + propertyIndex;
      return function (e) {
        var popup = L.popup({ minWidth: document.documentElement.clientWidth - 50, keepInView: true })
            .setLatLng(e.latlng)
            .setContent('<canvas id="chart-' + markerIndex + '"></canvas>')
            .openOn(map);
  
        var ctx = document.getElementById('chart-' + markerIndex).getContext('2d');

        /**
         * Get plot points from the marker objects for the block 
         */
        var points = markers[blockIndex].sort(function(a, b) {
          return a.size - b.size;
        });
        console.log(points);

        var sortedMarkerIndex;
        points = points.map(function(point, i) {
          if (point.address === marker.address) {
            sortedMarkerIndex = i;
          }
          return { x: point.size, y: point.assessment, label: point.address.match(/^\d+/)[0] };
        });

        console.log(points[sortedMarkerIndex]);

        var myChart = new Chart(ctx, {
          type: 'line',
          data: {
            // All data
            datasets: [
              {
                showLine: false,
                label:  marker.address,
                data: [points[sortedMarkerIndex]],
                backgroundColor: 'red',
                borderColor: 'red',
              },
              {
                showLine: false,
                label: 'Neighbours',
                data: points.slice(0, sortedMarkerIndex).concat(points.slice(sortedMarkerIndex + 1)),
                backgroundColor: 'blue',
                borderColor: 'blue',
              },
              {
                label: 'Adjusted for square footage',
                data: regressionLine,
                borderColor: 'lightblue',
              },
            ]
          },
          options: {
            title: {
              display: true,
              text: 'Average assessed values vs. total square footage'
            },
            scales: {
              xAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'Total developed square footage and lot size (sq feet)'
                },
                type: 'linear',
                position: 'bottom',
                ticks: {
                  callback: function(value, index, values) {
                    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ft';
                  }
                }
              }],
              yAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'Assessed value',
                },
                ticks: {
                  // Include a dollar sign in the ticks
                  callback: function(value, index, values) {
                    return '$' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");;
                  }
                }
              }]
            }
          }
        });
      };
    }
    L.marker([ marker.lat, marker.lng ], { icon: myIcon })
     .addTo(map).on('click', renderChart(i, j, marker, regressionLine));
  });
});
