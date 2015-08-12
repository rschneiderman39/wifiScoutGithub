app.controller('APTableCtrl', ['$scope', '$timeout', 'accessPoints',
'globalSettings', 'APTableState', 'setupService', function($scope, $timeout,
accessPoints, globalSettings, APTableState, setupService) {

  setupService.ready.then(function() {

    var updateInterval;

    var showAll = true; /* True: display all access points regardless of selection.
                           False: display only selected access points. */

    var selectedMACs = []; /* Current access point selection. @type {{Array.<string>}} */

    $scope.strings = strings;
    $scope.accessPoints = [];       // Array of AP data objects to be displayed
    $scope.sortPredicate = undefined; // String or function used by angular to order the elements.
    $scope.sortReverse = undefined;   // true: Sort direction reversed.  false: Normal behavior.

    /* Triggered whenever a sort arrow is clicked. The sort predicate is changed to the new predicate.
       If the new predicate is the same as the current one, the sort direction is reversed. If 'SSID'
       is selected as the predicate, a custom ordering function is substituted instead.

       @param {string|function} predicate: The new sort .
    */
    $scope.order = function(predicate) {
      if (predicate === 'SSID') {
        $scope.sortReverse = ($scope.sortPredicate === $scope.sortSSID) ? !$scope.sortReverse : false;
        $scope.sortPredicate = $scope.sortSSID;
      } else {
        $scope.sortReverse = ($scope.sortPredicate === predicate) ? !$scope.sortReverse : false;
        $scope.sortPredicate = predicate;
      }
    };

    /* Used in place of a string predicate to sort access points by SSID. @type {function} */
    $scope.sortSSID = utils.customSSIDSort;

    /* Update the locally stored selection whenever the user changes the selection with the
       filter modal.

       @param {{showAll: boolean, selectedMACs: Array.<string>}} newSelection - The new selection.
    */
    var updateSelection = function() {
      var selection = globalSettings.getAccessPointSelection('APTable');

      selectedMACs = selection.macAddrs;
      showAll = selection.showAll;

      update();
    };

    /* Store current sort ordering. */
    var saveState = function() {
      APTableState.sortPredicate($scope.sortPredicate);
      APTableState.sortReverse($scope.sortReverse);
    };

    /* Load the previously used selection and sort ordering. */
    var restoreState = function() {
      var selection = globalSettings.getAccessPointSelection('APTable');
      selectedMACs = selection.macAddrs;
      showAll = selection.showAll;

      var predicate = APTableState.sortPredicate();
      if (predicate === 'SSID') {
        $scope.sortPredicate = $scope.sortSSID;
      } else {
        $scope.sortPredicate = predicate;
      }
      $scope.sortReverse = APTableState.sortReverse();
    };

    var update = function() {
      if (! globalSettings.updatesPaused()) {
        accessPoints.getAll().done(function(results) {
          $timeout(function() {
            if (showAll) {
              $scope.accessPoints = results;
            } else {
              $scope.accessPoints =
              utils.accessPointSubset(results, selectedMACs);
            }
          });
        });
      }
    };

    /* Manually scale the view to the device where needed. */
    var prepView = function() {
      var contentHeight = $(window).height() - $('#top-bar').height() - $('.table thead').height();
      $('#table-content').height(contentHeight);
    };

    var init = function() {
      if (accessPoints.count() < constants.moderateThresh) {
        updateInterval = constants.updateIntervalNormal;

      } else if (accessPoints.count() < constants.highThresh) {
        updateInterval = constants.updateIntervalSlow;
      } else {
        updateInterval = constants.updateIntervalVerySlow;
      }

      prepView();

      restoreState();

      var firstUpdate = function() {
        update();
        document.removeEventListener(events.swipeDone, firstUpdate);
      }

      if (globalSettings.updatesPaused()) {
        document.addEventListener(events.swipeDone, firstUpdate);
      } else {
        update();
      }

      var updateLoop = setInterval(update, updateInterval);
      document.addEventListener(events.newAccessPointSelection['APTable'], updateSelection);

      $scope.$on('$destroy', function() {
        clearInterval(updateLoop);
        document.removeEventListener(events.newAccessPointSelection['APTable'], updateSelection);

        saveState();
      });
    };

    init();
  });

}]);
