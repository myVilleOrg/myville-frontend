'use strict';

/**
 * @ngdoc function
 * @name appApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the appApp
 */
angular.module('appApp')
.controller('MainCtrl', ['$scope', '$location', 'localStorageService', '$window', '$rootScope', 'ngDialog', 'myVilleAPI', 'leafletData', function ($scope, $location, localStorageService, $window, $rootScope, ngDialog, myVilleAPI, leafletData) {
			$scope.isActive = function (viewLocation) {
				var active = (viewLocation === $location.path());
				return active;
			};

			angular.extend($scope, {
					center: {
							lat: 51.505,
							lng: -0.09,
							zoom: 14,
							autoDiscover: true
					},
					bounds: {},
					geojson : {}
			});

			var showUas = function(){
				leafletData.getMap().then(function(map){
					$rootScope.map = map;
					myVilleAPI.UAS.get({map: JSON.stringify([[map.getBounds().getNorthWest().lng, map.getBounds().getNorthWest().lat], [map.getBounds().getNorthEast().lng, map.getBounds().getNorthEast().lat], [map.getBounds().getSouthEast().lng, map.getBounds().getSouthEast().lat], [map.getBounds().getSouthWest().lng, map.getBounds().getSouthWest().lat]])}).then(function(geocodes){
						angular.extend($scope, {
							geojson: {
								data: geocodes.data,
								style: {
										weight: 1,
										opacity: 1,
										fillColor: 'white',
										color: 'white',
										dashArray: '3',
										fillOpacity: 0.7
                 },
								resetStyleOnMouseout: true
							},
						});
					});
				});
			};

			$scope.disconnect = function(){
				delete $rootScope.token;
				delete $rootScope.user;
				localStorageService.remove('token');
				localStorageService.remove('user');
				$window.location.href = '#/';
			};

			$scope.login = function(){
				ngDialog.open({controller: 'LoginCtrl', template: 'views/login.html'});
			};


			$scope.$on('leafletDirectiveMap.map.load', function(event){
					showUas();
			});

			$scope.$on('leafletDirectiveMap.map.dragend', function(event){
					showUas();
			});
			$scope.$on('leafletDirectiveMap.map.zoomend', function(event){
					showUas();
			});

			var token = localStorageService.get('token');
			if(token) {
				$rootScope.token = token;
				var user = localStorageService.get('user');
				if(user) $rootScope.user = user;
			}
}]);
