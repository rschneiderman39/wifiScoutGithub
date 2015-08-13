app.controller('timeGraphCtrl', ['$scope', '$timeout', 'timeGraphManager',
'setupService', function($scope, $timeout, timeGraphManager, setupService) {

  setupService.ready.then(function() {

    var selectedMAC = "";

    $scope.strings = strings;
    $scope.legendData = undefined;
    $scope.isDuplicateSSID = {};

    $scope.selectedSSID = undefined;
    $scope.selectedBSSID = undefined;

    $scope.toggleSelected = function(MAC) {
      if (typeof MAC === 'string') {
        if (MAC === selectedMAC) {
          selectedMAC = "";

          for (var i = 0; i < $scope.legendData.length; ++i) {
            if ($scope.legendData[i].MAC === MAC) {
              console.log("HERE");
              $scope.selectedSSID = $scope.legendData[i].SSID;
            } 
          }
          $scope.selectedBSSID = MAC;

        } else {
          selectedMAC = MAC;

          for (var i = 0; i < $scope.legendData.length; ++i) {
            if ($scope.legendData[i].MAC === MAC) {
              console.log("HERE");
              $scope.selectedSSID = $scope.legendData[i].SSID;
            } 
          }
          $scope.selectedBSSID = MAC;
          $scope.selectedBSSID = MAC;
        }
        timeGraphManager.toggleAccessPointHighlight(MAC);
      }
    };

    $scope.isSelected = function(MAC) {
      return MAC === timeGraphManager.getHighlightedMAC();
    };

    $scope.sortSSID = utils.customSSIDSort;

    var updateDuplicateSSIDs = function() {
      var found = {},
          newDuplicates = {};
      for (var i = 0; i < $scope.legendData.length; ++i) {
        if (found[$scope.legendData[i].SSID]) {
          newDuplicates[$scope.legendData[i].SSID] = true;
        } else {
          found[$scope.legendData[i].SSID] = true;
        }
      }
      $scope.isDuplicateSSID = newDuplicates;
    };

    var updateLegend = function() {
      $timeout(function() {
        $scope.legendData = timeGraphManager.getLegendData();

        updateDuplicateSSIDs();
      });
    };

    var prepView = function() {
      document.getElementById('plot').height = $(window).height() * 0.75;
      document.getElementById('plot').width = $(window).width() * 0.69;
    };

    var init = function() {
      prepView();

      var plot = timeGraphManager.getPlot();
      plot.streamTo($('#plot')[0], timeGraphManager.getDelay());

      $scope.$on('$destroy', function() {
        plot.stop();
      });

      $scope.legendData = timeGraphManager.getLegendData();
      updateDuplicateSSIDs();

      document.addEventListener(events.newLegendData, updateLegend);
    };

    init();
  });

}]);