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