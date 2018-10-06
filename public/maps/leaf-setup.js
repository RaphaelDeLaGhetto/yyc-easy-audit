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
          ctx.fillText(dataString, position.x, position.y - (fontSize / 2) - padding);
        });
      }
    });
  }
});

/**
 * Event handler for marker clicks
 */
markers.forEach((block, i) => {
  block.forEach((marker, j) => {
    function renderChart(blockIndex, propertyIndex, marker) {
      var blockIndex = blockIndex;
      var propertyIndex = propertyIndex;
      var marker = marker;
      var markerIndex = '' + blockIndex + propertyIndex;
      return function (e) {
        var popup = L.popup({ minWidth: document.documentElement.clientWidth - 50, keepInView: true })
            .setLatLng(e.latlng)
            .setContent('<canvas id="chart-' + markerIndex + '"></canvas>')
            .openOn(map);
  
        var ctx = document.getElementById('chart-' + markerIndex).getContext('2d');

        var points = markers[blockIndex].map(function(details) {
          return { x: details.size, y: details.assessment, label: details.address.match(/^\d+/)[0] };
        });
        
        var myChart = new Chart(ctx, {
          type: 'scatter',
          data: {
            datasets: [{
              label: marker.address,
              data: points,
            }]
          },
          options: {
            scales: {
              xAxes: [{
                type: 'linear',
                position: 'bottom'
              }]
            }
          }
        });
      };
    }
    L.marker([ marker.lat, marker.lng ], { icon: myIcon })
     .addTo(map).on('click', renderChart(i, j, marker));
  });
});
