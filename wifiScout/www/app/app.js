var app = angular.module('app', ['ui.router', 'setup', 'ngTouch', 'nzTour']);

app.config(function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('settings');
  $stateProvider
    .state('settings', {
      url: "/settings",
      templateUrl: 'views/settings.html',
    })
    .state('channelTable', {
      url: "/channelTable",
      templateUrl: 'views/channelTable.html',
    })
    .state('APTable', {
      url: "/APTable",
      templateUrl: 'views/APTable.html',
    })
    .state('timeGraph', {
      url: "/timeGraph",
      templateUrl: 'views/timeGraph.html',
    })
    .state('signalStrength', {
      url: "/signalStrength",
      templateUrl: 'views/signalStrength.html',
    })
    .state('channelGraph', {
      url: "/channelGraph",
      templateUrl: 'views/channelGraph.html',
    })
});
