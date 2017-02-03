'use strict';
/**
 * @ngdoc function
 * @name appApp.controller:SearchCtrl
 * @description
 * # UACtrl
 * Controller of the appApp
 */
angular.module('appApp')
  .controller('SearchCtrl', function ($rootScope, $scope, myVilleAPI) {

    $scope.$on('SearchClic', function(event, data) {
        $scope.tabSearch = [];
        for(var i=0;i<data.length;i++){
            var dataUA = {
                title: data[i].title,
                owner: data[i].owner.username,
                coordinates: data[i].location.geometries  
            }
            $scope.tabSearch.push(dataUA);
        }
    });   

    $scope.centerOnMap = function(coordinates){
        $scope.$emit('centerOnMap', coordinates); 
    }

});