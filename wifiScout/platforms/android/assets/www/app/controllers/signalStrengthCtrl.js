app.controller('signalStrengthCtrl', ['$scope', '$timeout', 'APService',
  'APSelectorService', 'signalStrengthSettingsService', 'levelTransformService',
  'cordovaService', function($scope, $timeout, APService, APSelectorService,
  signalStrengthSettingsService, levelTransformService, cordovaService) {
    cordovaService.ready.then(
      function resolved() {
        $scope.allAPData = [];
        $scope.selector = 'SSID';
        $scope.selectedSSID = undefined;
        $scope.level = undefined;
        $scope.minLevel = undefined;
        $scope.maxLevel = undefined;
        $scope.isSelected = function(ap) {
          if (typeof ap.BSSID !== 'undefined') {
            return ap.BSSID === selectedBSSID;
          }
        };
        $scope.setSelected = function(ap) {
          if (typeof ap.BSSID !== 'undefined') {
            selectedBSSID = ap.BSSID;
            $scope.selectedSSID = ap.SSID;
          }
        };

        var selectedBSSID = "",
            gauge = undefined,
            UPDATE_INTERVAL = 500;

        var forceUpdate = function () {
          $scope.allAPData = APService.getNamedAPData();
          var selectedAP = APSelectorService.select($scope.allAPData, selectedBSSID);
          if (selectedAP !== null) {
            $scope.level = selectedAP.level;
            $scope.minLevel = APService.getMinLevel(selectedAP.BSSID);
            $scope.maxLevel = APService.getMaxLevel(selectedAP.BSSID);
            gauge.set(levelTransformService.gaugeTransform($scope.level));
          }
        };

        var update = function () {
          forceUpdate();
          $timeout(update, UPDATE_INTERVAL)
        };

        var _pushSettings = function() {
          signalStrengthSettingsService.setSelectedBSSID(_selectedBSSID);
          signalStrengthSettingsService.setSelectedSSID($scope.selectedSSID);
        };

        var _pullSettings = function() {
          _selectedBSSID = signalStrengthSettingsService.getSelectedBSSID();
          $scope.selectedSSID = signalStrengthSettingsService.getSelectedSSID();
        };

        (function initGauge() {
          var opts = {
    			  lines: 12,
    			  angle: 0.1,
    			  lineWidth: 0.3,
    			  pointer: {
    			    length: 0.75,
    			    strokeWidth: 0.035,
    			    color: '#000000'
    			  },
    			  limitMax: 'false',
    			  percentColors: [[0.0, "#FF0000" ], [0.1, "#FF0000"],
                            [0.20, "#FF3300" ],  [0.30, "#ff6600"],
                            [0.40, "#FF9900"], [0.50, "#FFcc00"],
                            [0.60, "#ffff00"], [0.70, "#ccff00"],
                            [0.80, "#99ff00"], [0.90, "#66FF00"],
                            [1.0, "#00FF00"]],
    			  strokeColor: '#E0E0E0',
    			  generateGradient: true
    			};
          var target = document.getElementById('foo');
    			gauge = new Gauge(target).setOptions(opts);
    			gauge.maxValue = 700;
    			gauge.animationSpeed = 120;
          gauge.set(1);
        })();

        pullSettings();

        $scope.$on('$destroy', pushSettings);

        update();

      },
      function rejected() {
        console.log("signalStrengthCtrl is unavailable because Cordova is not loaded.");
      }
    )
  }]);
