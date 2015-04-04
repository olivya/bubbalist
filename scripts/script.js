var bubbalist = angular.module('bubbalist', ['ngRoute','ngAnimate']);

//console.log(bubbalist);
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