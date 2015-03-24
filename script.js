var bubbalist = angular.module('bubbalist', ['ngRoute','ngAnimate']);

// TOUCH EVENTS:
var doubleTapEdit = {};
var tapBringForward = {};

bubbalist.config(function ($routeProvider,$locationProvider) {
    $routeProvider

    .when('/', {
        templateUrl : 'pages/home.html',
        controller  : 'mainController'
    })

    .otherwise({ redirectTo: '/' });
});

bubbalist.factory("Tasks", function() {
  var taskList = [];
  return {
    all: function() {
      return taskList;
    },
  };
});

bubbalist.factory("Colours", function() {
  var colourList = ['#67E5E5','#4CD8FF','#BA82FF'];
  return {
    all: function() {
      return colourList;
    },
  };
});
