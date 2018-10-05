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
 * Event handler for marker clicks
 */
for (var i = 0; i < markers.length; ++i) {

  function renderChart(index) {
    var markerIndex = index;
    return function (e) {
      var popup = L.popup()
          .setLatLng(e.latlng)
          .setContent('<canvas id="chart-' + markerIndex + '" width="400" height="400"></canvas>')
          .openOn(map);

      var ctx = document.getElementById('chart-' + markerIndex).getContext('2d');
      var myChart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
              datasets: [{
                  label: '# of Votes',
                  data: [12, 19, 3, 5, 2, 3],
                  backgroundColor: [
                      'rgba(255, 99, 132, 0.2)',
                      'rgba(54, 162, 235, 0.2)',
                      'rgba(255, 206, 86, 0.2)',
                      'rgba(75, 192, 192, 0.2)',
                      'rgba(153, 102, 255, 0.2)',
                      'rgba(255, 159, 64, 0.2)'
                  ],
                  borderColor: [
                      'rgba(255,99,132,1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(255, 206, 86, 1)',
                      'rgba(75, 192, 192, 1)',
                      'rgba(153, 102, 255, 1)',
                      'rgba(255, 159, 64, 1)'
                  ],
                  borderWidth: 1
              }]
          },
          options: {
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero: true
                      }
                  }]
              }
          }
      });
    };
  }

  L.marker([ markers[i].lat, markers[i].lng ], { icon: myIcon })
   .addTo(map).on('click', renderChart(i));
}
