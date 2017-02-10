'use strict';

/**
 * @ngdoc overview
 * @name appApp
 * @description
 * # appApp
 *
 * Main module of the application.
 */
angular
	.module('appApp', [
		'ngCookies',
		'ngResource',
		'ngRoute',
		'ngSanitize',
		'ngTouch',
		'leaflet-directive',
		'LocalStorageModule',
		'ngDialog',
		'ngHello',
		'ui.tinymce',
		'angular-intro'
	])
	.config(["helloProvider", function(helloProvider) {
		helloProvider.init({
			facebook: '269509866781876',
			google: '49433176261-hjeueecpafioh56r67fik9nqkum5np0g.apps.googleusercontent.com'
		});
	}])
	.config(["$logProvider", function($logProvider){
		$logProvider.debugEnabled(false);
	}])
	.config(["localStorageServiceProvider", function (localStorageServiceProvider) {
		localStorageServiceProvider.setPrefix('myVille');
	}])
	.config(["$httpProvider", function($httpProvider) {
		$httpProvider.interceptors.push(['localStorageService', function(localStorageService){
			return {
				request: function(config) {
					var token = localStorageService.get('token');
					config.headers = config.headers || {};
					if (token !== null) {
						config.headers['x-access-token'] = token;
					}
					return config || Promise.resolve(config);
				},
				requestError: function(rejection){
					return Promise.reject(rejection);
				},
				response: function(response){
					var currentToken = localStorageService.get('token');
					var receivedToken = response.headers('x-access-token');
					if(receivedToken !== null && currentToken !== receivedToken) {
						localStorageService.set('token', receivedToken);
					}
					return response || Promise.resolve(response);
				},
				responseError: function(rejection){
					return Promise.reject(rejection);
				}
			};
		}]);
	}])
	.config(["$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {
		$routeProvider
			.when('/', {
				controller: 'MainCtrl',
				controllerAs: 'main'
			})
			.when('/login', {
				controller: 'LoginCtrl',
				controllerAs: 'login',
				templateUrl: 'views/login.html'
			})
			.when('/user/:userId', {
				controller: 'ProfileCtrl',
				controllerAs: 'profile',
				templateUrl: 'views/profile.html'
			})
			.when('/profile/update', {
				controller: 'ProfileCtrl',
				controllerAs: 'profile',
				templateUrl: 'views/profile_update.html',
				resolve: {
					auth: ["AuthentificationService", function(AuthentificationService){
						return AuthentificationService.routeGuardian();
					}]
				}
			})
			.when('/createUA', {
				controller: 'UACtrl',
				controllerAs: 'ua',
				templateUrl: 'views/ua.html',
				resolve: {
					auth: ["AuthentificationService", function(AuthentificationService){
						return AuthentificationService.routeGuardian();
					}]
				}
			})
			.when('/profile/mine', {
				controller: 'MineCtrl',
				controllerAs: 'mine',
				templateUrl: 'views/mine.html',
				resolve: {
					auth: ["AuthentificationService", function(AuthentificationService){
						return AuthentificationService.routeGuardian();
					}]
				}
			})
			.when('/profile/favorite', {
				controller: 'FavoriteCtrl',
				controllerAs: 'favorite',
				templateUrl: 'views/favorite.html',
				resolve: {
					auth: ["AuthentificationService", function(AuthentificationService){
						return AuthentificationService.routeGuardian();
					}]
				}
			})
			.when('/ua/:uaId',{
				controller: 'MainCtrl',
				controllerAs: 'main',
				template: ' '
			})
			.when('/reset/:tokenReset',{
				controller: 'MainCtrl',
				controllerAs: 'main',
				template: ' '
			})
			.otherwise({
				redirectTo: '/'
			});
			$locationProvider.html5Mode(false).hashPrefix('');
	}]);

'use strict';

angular.module('appApp')
 .filter('formatDate', ["$filter", function ($filter) {
		return function (date) {
				if (date) {
						return moment(new Date(date)).locale('fr').fromNow();
				}
				else return "";
		};
}]);

'use strict';

/**
 * @ngdoc service
 * @name appApp.hello
 * @description
 * # hello
 * Provider in the appApp.
 */
angular.module('appApp')
.provider('hello', function () {
  this.$get = function () {
    return hello;
  };

  this.init = function (services, options) {
    hello.init(services, options);
  };
});

'use strict';

/**
 * @ngdoc function
 * @name appApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the appApp
 */
angular.module('appApp')
.controller('MainCtrl', ['$scope', '$location', 'localStorageService', '$timeout', '$window', '$rootScope', 'ngDialog', 'myVilleAPI', 'leafletData', 'AuthentificationService', '$routeParams', '$compile', function ($scope, $location, localStorageService, $timeout, $window, $rootScope, ngDialog, myVilleAPI, leafletData, AuthentificationService, $routeParams, $compile) {
	$scope.resetPwd = {};

	$scope.getPopupDescriptionUA = function(uaId) {
		myVilleAPI.UAS.getOne(uaId).then(function(data){
			ngDialog.open({data: data.data, controller: 'VoteCtrl', template: 'views/single_ua.html', appendClassName: 'modal-single-ua'});
		});
	};

	$scope.forgotClick = function(){
		if($scope.resetPwd.pwd1 !== $scope.resetPwd.pwd2) {
			$scope.message = 'Mot de passe différent.';
			return;
		}

		var data = {
			tokenReset: $scope.ngDialogData.token,
			password: $scope.resetPwd.pwd1
		};

		myVilleAPI.User.reset(data).then(function(){
			$scope.closeThisDialog();
			return;
		}).catch(function(err){
			$scope.message = err.data.message;
			return;
		});
	};

	$scope.isActive = function (viewLocation) {
		var active = (viewLocation === $location.path());
		return active;
	};

	$scope.disconnect = function(){
		AuthentificationService.logout();
		$window.location.href = '#/';
	};

	$scope.login = function(){
		ngDialog.open({controller: 'LoginCtrl', template: 'views/login.html', appendClassName: 'popup-auto-height'});
	};

	$scope.submitUA = function(){
		$scope.$broadcast('submitUA');
	}

	$scope.selectFilter = function(index){
		if(index === 0){
			$scope.filters = {all: true, popular: false, mine: false, favorite: false};
		}
		if(index === 1){
			$scope.filters = {all: false, popular: true, mine: false, favorite: false};
		}
		if(index === 2){
			$scope.filters = {all: false, popular: false, mine: true, favorite: false};
		}
		if(index === 3) {
			$scope.filters = {all: false, popular: false, mine: false, favorite: true};
		}

	};

	$scope.$watch('filters', function(newv, old){ //on filter change
		if(JSON.stringify(newv) !== JSON.stringify(old)){
			showUas();
		}
		if(newv.popular){
			$window.location.href = '#/';
		}
		if(newv.all){
			$window.location.href = '#/';
		}
		if(newv.mine){
			$window.location.href = '#/profile/mine';
		}
		if(newv.favorite){
			$window.location.href = '#/profile/favorite';
		}
	}, true);

	$scope.$on('filterForce', function(e, idx){
		$scope.selectFilter(idx);
	});

	var geoJsonLayer;
	var showUas = function(){
		leafletData.getMap().then(function(map){
			try {
				map.removeLayer(geoJsonLayer);
			}
			catch (e){
			}
			var mapBounds = [[map.getBounds().getNorthWest().lng, map.getBounds().getNorthWest().lat], [map.getBounds().getSouthEast().lng, map.getBounds().getSouthEast().lat]];
			var filterRequest = $scope.filters.mine ? myVilleAPI.UAS.getMine : $scope.filters.popular ? myVilleAPI.UAS.getPopular : $scope.filters.all ? myVilleAPI.UAS.getAll : myVilleAPI.UAS.getFavorites;
			filterRequest({map: JSON.stringify(mapBounds)}).then(function(geocodes){
				$rootScope.cachedMarkers = geocodes.data;
				geoJsonLayer = L.geoJson(geocodes.data, {
					onEachFeature: function (feature, layer) {

						var starClass = 'fa fa-star-o';
						if($rootScope.user && $rootScope.user.favoris.indexOf(feature.properties._doc._id) !== -1){
							starClass = 'fa fa-star';
						}
						var testFavoriHtml = $rootScope.user ? '<i id="'+ feature.properties._doc._id +'" class="'+ starClass +'" ng-click="editFavori(\''+ feature.properties._doc._id +'\')" aria-hidden="true"></i>' : ''
						var htmlPopup = '<div class="popup-map">' +
															'<div class="heading-popup">' +
																'<a href="javascript:void(0)" ng-click="getPopupDescriptionUA(\''+ feature.properties._doc._id +'\')">' +
																feature.properties._doc.title +
																'</a>' +
															testFavoriHtml +
															'</div>' +
															'<div class="owner-popup">' +
															'Crée par <a href="#/user/' + feature.properties._doc.owner._id + '">' + feature.properties._doc.owner.username + '</a> ' + moment(new Date(feature.properties._doc.createdAt)).locale('fr').fromNow() +
															'</div>' +
														'</div>';
						var link = $compile(htmlPopup);
						var content = link($scope);
						layer.bindPopup(content[0]);
					}
				});
				geoJsonLayer.addTo(map);
			});
		});
	};
	$scope.editFavori = function(ua_id){
		myVilleAPI.UAS.favor({ua: ua_id}).then(function(user){
			$rootScope.user.favoris = user.data.favoris;
			localStorageService.set('user', user.data);
			angular.element(document.getElementById(ua_id))[0].className === 'fa fa-star-o' ? angular.element(document.getElementById(ua_id))[0].className = 'fa fa-star' : angular.element(document.getElementById(ua_id))[0].className = 'fa fa-star-o';
			$rootScope.$broadcast('updateFavorite');
		});
	};

	$scope.$on('leafletDirectiveMap.map.dragend', showUas);

	$scope.$on('leafletDirectiveMap.map.zoomend', showUas);

	$scope.$on('centerOnMap', function(event, coordinates){
		var point = coordinates[0];
		var coordinate, zoom;
		if(point.type === 'Polygon'){
			coordinate = coordinates[0].coordinates[0][0];
			zoom = 14;
		} else if(point.type === 'Point'){
			coordinate = coordinates[0].coordinates;
			zoom = 18;
		} else if(point.type === 'LineString'){
			coordinate = coordinates[0].coordinates[0];
			zoom = 14;
		}
		$scope.center.lat = coordinate[1];
		$scope.center.lng = coordinate[0];
		$scope.center.zoom = zoom;
	});

	$scope.$on('$locationChangeStart', function (event, next, current) {
		if(next === 'http://localhost:9000/#/profile/mine' && current !== next){
			$scope.filters.mine = true;
			$scope.filters.popular = false;
			$scope.filters.favorite = false;
			$scope.filters.all = false;

		}
		if(next === 'http://localhost:9000/#/profile/favorite' && current !== next){
			$scope.filters.mine = false;
			$scope.filters.popular = false;
			$scope.filters.favorite = true;
			$scope.filters.all = false;
		}
		$scope.$emit('normalMode')

	});
	$scope.$on('filtersReset', function(evt, data){
		if(data){
			$scope.filters = {all: false, popular: false, mine: false, favorite: false};
		}
	});

	angular.extend($scope, {
			center: {
					lat: 51.505,
					lng: -0.09,
					zoom: 14,
					autoDiscover: true
			},
			bounds: {},
			geojson : {},
			filters: {
				all: true,
				popular: false,
				mine: false,
				favorite: false
			}
	});

	/*Draw MAP*/
	var drawnItems = new L.FeatureGroup();
	var options = {
		edit: {
			featureGroup: drawnItems
		},
		draw: {
			circle: false
		},
		showRadius: true
	};

	var drawControl = new L.Control.Draw(options);
	var editMapMode = false;
	$scope.$on('normalMode', function(){
		if(editMapMode){
			leafletData.getMap().then(function(map){
				map.removeLayer(drawnItems);
				map.removeControl(drawControl);
				editMapMode = false;
			});
		}
	});
	$scope.$on('editMode', function(){
		leafletData.getMap().then(function(map) {
			if(!editMapMode){
				drawnItems = new L.FeatureGroup();
				options = {
					edit: {
						featureGroup: drawnItems
					},
					draw: {
						circle: false
					},
					showRadius: true
				};
				drawControl = new L.Control.Draw(options);
				map.addControl(drawControl);
				map.on('draw:created', function (e) {
					var type = e.layerType,
					layer = e.layer;
					drawnItems.addLayer(layer);
					map.addLayer(drawnItems)
					$scope.$broadcast('drawingData', drawnItems.toGeoJSON());
				});
				editMapMode = true;
			}
		});
	});

	var expiryTokenTime = localStorageService.get('expiryToken');

	if(expiryTokenTime && Date.now() < expiryTokenTime) {
		var token = localStorageService.get('token');
		if(token) {
			$rootScope.token = token;
			var user = localStorageService.get('user');
			if(user) $rootScope.user = user;
		}
	} else {
		$scope.disconnect();
	}

	if($routeParams.uaId){
		myVilleAPI.UAS.getOne($routeParams.uaId).then(function(data){
			$scope.center.lat = data.data.location.coordinates[1];
			$scope.center.lng = data.data.location.coordinates[0];
			$scope.center.zoom = 18;
			ngDialog.open({data: data.data, template: 'views/single_ua.html', appendClassName: 'modal-single-ua'});
		});
	}
	if($routeParams.tokenReset){
		$scope.resetPwd = {};
		ngDialog.open({data: {token: $routeParams.tokenReset}, controller: 'MainCtrl', template: 'views/reset_password.html', appendClassName: 'modal-single-ua'});
	}

	/* Tutorial Mode */
	var tutorialDone = localStorageService.get('tutorialMode');
	if(!tutorialDone){
		$scope.IntroOptions = {
				steps:[
				{
					element: document.querySelector('.container'),
					intro: 'Bienvenue sur myVille ! \n myVille est un site colloboratif où vous pouvez partager vos aménagements urbains à la communauté :)'
				},
				{
					element: document.querySelector('.sidebar'),
					intro: 'Ça c\'est la barre de menu !',
					position: 'right'
				},
				{
					element: document.querySelector('#map'),
					intro: 'Là tu peux naviguer sur la carte et voir les aménagements d\'autres personnes, les aimer, les partager ...',
				}
				],
				showStepNumbers: false,
				exitOnOverlayClick: true,
				exitOnEsc: true,
				nextLabel: 'Suivant',
				prevLabel: 'Précédent',
				skipLabel: 'Quitter',
				doneLabel: 'Quitter'
		};
		$timeout(function(){
			$scope.startIntro();
			localStorageService.set('tutorialMode', 'mode1');
		}, 500);
	}
	$scope.$on('firstLoginTutorial', function(){
		var tutorialDone = localStorageService.get('tutorialMode');
		if(AuthentificationService.routeGuardian() && tutorialDone && tutorialDone === 'mode1'){

			$timeout(function(){
				angular.extend($scope, {
					IntroOptions: {
							steps:[
							{
								intro: 'Bienvenue sur myVille ! Nous allons vous présentez les fonctionnalités du site.'
							},
							{
								element: '#link-create',
								intro: 'Ici, vous pouvez créer votre aménagement.',
								position: 'right'
							},
							{
								element: '#link-mine',
								intro: 'Par là, vous pouvez voir vos créations.',
								position: 'right'
							},
							{
								element: '#link-favorite',
								intro: 'Envie de lister vos favoris , il suffit de cliquer ici.',
								position: 'right'
							},
							{
								intro: 'Il suffit de cliquer sur un marqueur ou une forme pour voir les détails de cet aménagement.',
								position: 'right'
							}
							],
							showStepNumbers: false,
							exitOnOverlayClick: true,
							exitOnEsc:true,
							nextLabel: 'Suivant',
							prevLabel: 'Précédent',
							skipLabel: 'Quitter',
							doneLabel: 'Quitter'
					}
				});
				$timeout(function(){
					$scope.startIntro();
					localStorageService.set('tutorialMode', 'finished');
				}, 200);
			}, 1000);
		}
	});

}]);

'use strict';
/**
 * @ngdoc function
 * @name appApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the appApp
 */

angular.module('appApp').controller('LoginCtrl', ["$rootScope", "$scope", "$window", "myVilleAPI", "AuthentificationService", "hello", "ngDialog", "$location", function ($rootScope, $scope, $window, myVilleAPI, AuthentificationService, hello, ngDialog, $location) {

	$scope.user = {};
	$scope.signupUser = {};
	$scope.forgotPwd = {};
	$scope.log = true;

	var loginSocialNetwork = function(network){
		var configNetwork = {
			google: {
				scope: 'basic,email',
				apiCall: myVilleAPI.User.loginGoogle
			},
			facebook: {
				scope: 'basic, email',
				apiCall: myVilleAPI.User.loginFacebook
			}
		};

		hello(network).login({scope: configNetwork[network].scope}).then(function(auth){
			if(auth.network === network){
				configNetwork[network].apiCall({accessToken: auth.authResponse.access_token}).then(function(user){
					AuthentificationService.login(user.data.token, user.data.user);
					$scope.closeThisDialog();
				});
			}
		});
	};

	$scope.loginClick = function() {
		if($scope.user.username || $scope.user.password){
				myVilleAPI.User.login($scope.user).then(function(user){
					if(!user.data.user) {
						$scope.message = 'Mauvaise combinaison';
						return;
					}

					AuthentificationService.login(user.data.token, user.data.user);
					$scope.message = '';
					$scope.closeThisDialog();
				}, function(error){
					$scope.message = error.data.message;
				});
		} else {
			$scope.message = 'Error, fiels needed.';
		}
	};

	$scope.switchMode = function (mode){
		$scope.message = '';

		if(mode === 'login') $scope.log = 1;
		if(mode === 'signup') $scope.log = 2;
		if(mode === 'forgot') $scope.log = 3;
	}

	$scope.createClick = function(){

		if(!$scope.signupUser.nickname || !$scope.signupUser.password || !$scope.signupUser.email || !$scope.signupUser.phonenumber){
			$scope.message = 'Un ou des champs sont manquant.';
			return;
		}
		var data = {
			username: $scope.signupUser.nickname,
			password: $scope.signupUser.password,
			email: $scope.signupUser.email,
			phonenumber: $scope.signupUser.phonenumber
		};

		myVilleAPI.User.create(data).then(function(user){
			AuthentificationService.login(user.data.token, user.data.user);
		});

		ngDialog.close();
		$location.path('/');
	};

	$scope.forgotClick = function(){
		if(!$scope.forgotPwd.email) {
			$scope.message = 'Un ou des champs sont manquants.';
			return;
		}
		myVilleAPI.User.forgot({email: $scope.forgotPwd.email}).then(function(data){
			$scope.switchMode('login');
			$scope.message = 'Mail de récupération de mot de passe envoyé !';
		}).catch(function(err){
			$scope.message = err.data.message;
		});
	};

	$scope.loginFB = function(){
		loginSocialNetwork('facebook');
	};
	$scope.loginGoogle = function(){
		loginSocialNetwork('google');
	};

}]);

'use strict';

/**
 * @ngdoc service
 * @name appApp.myVilleAPI
 * @description
 * # myVilleAPI
 * Factory in the appApp.
 */
angular.module('appApp')
	.factory('myVilleAPI', ['$http', '$rootScope', function ($http, $rootScope) {

			var baseUrl = 'http://localhost:3000';
			var dataFactory = {
				User: {
					login: function(data){
						return $http.post(baseUrl + '/user/login', data);
					},
					loginFacebook: function(data) {
						return $http.post(baseUrl + '/user/login/facebook', data);
					},
					loginGoogle: function(data) {
						return $http.post(baseUrl + '/user/login/google', data);
					},
					create: function(data){
						return $http.post(baseUrl + '/user/create', data);
					},
					update: function(data) {
						return $http.put(baseUrl + '/user/update', data);
					},
					updateAvatar: function(data) {
						return $http.post(baseUrl + '/user/update/avatar', data, {transformRequest: angular.identify, headers: {'Content-Type': undefined, enctype:'multipart/form-data'}});
					},
					get: function(data){
						return $http.get(baseUrl + '/user/' + data);
					},
					forgot: function(data){
						return $http.post(baseUrl + '/user/forgetPassword', data);
					},
					reset: function(data) {
						return $http.post(baseUrl + '/user/reset', data);
					}
				},

				UAS: {
					getFavorites: function(data){
						return $http.get(baseUrl + '/ua/get/favorite', {params: data});
					},
					create: function(data){
						return $http.post(baseUrl + '/ua/create', data);
					},
					getPopular: function(data){
						return $http.get(baseUrl + '/ua/get/popular', {params: data});
					},
					getAll: function(data){
						return $http.get(baseUrl + '/ua/get/geo', {params: data});
					},
					getMine: function(){
						return $http.get(baseUrl + '/ua/get/mine');
					},
					getOne: function(id){
						return $http.get(baseUrl + '/ua/' + id);
					},
					favor: function(data){
						return $http.post(baseUrl + '/ua/favor', data);
					},
					update: function(id, data){
							return $http.put(baseUrl + '/ua/' + id, data);
					},
					delete: function(id){
						return $http.delete(baseUrl +  '/ua/' + id);
					},
					vote: function(id, data){
						return $http.post(baseUrl + '/ua/vote/' + id, data);
					},
					deleteVote: function(id){
						return $http.delete(baseUrl + '/ua/vote/' + id);
					}
				},
				Vote: {
					getVote: function(uaId){
						return $http.get(baseUrl + '/vote/'+ uaId);
					}
				}
			};
			return dataFactory;
		}]);

'use strict';

/**
 * @ngdoc service
 * @name appApp.Authentification
 * @description
 * # Authentification
 * Factory in the appApp.
 */
angular.module('appApp')
.factory('AuthentificationService', ['$rootScope', 'localStorageService', function($rootScope, localStorageService) {
			return {
				routeGuardian: function(){
					if($rootScope.user) {
						return true;
					} else {
						Promise.reject('Authentification needed.')
					}
				},
				login: function(token, user){
					$rootScope.token = token;
					$rootScope.user = user;
					localStorageService.set('expiryToken', Date.now() + 24*60*60*1000);
					localStorageService.set('token', token);
					localStorageService.set('user', user);
					$rootScope.$broadcast('firstLoginTutorial');
					$rootScope.$broadcast('leafletDirectiveMap.map.dragend'); // update map
				},
				logout: function(){
					delete $rootScope.token;
					delete $rootScope.user;
					localStorageService.remove('token');
					localStorageService.remove('user');
					localStorageService.remove('expiryToken');
					$rootScope.$broadcast('filterForce', 0);
					$rootScope.$broadcast('leafletDirectiveMap.map.dragend');
  			},
        updateAvatar: function(user){
          $rootScope.user = user.data;
          localStorageService.set('user', user.data);
        }
			};
}]);

'use strict';

/**
 * @ngdoc directive
 * @name appApp.directive:ngLoading
 * @description
 * # ngLoading
 */
angular.module('appApp')
  .directive('ngLoading',['$http', function ($http) {
      return {
        restrict: 'A',
        link: function(scope, elem) {
          scope.isLoading = isLoading;
          scope.$watch(scope.isLoading, toggleElement);
          function toggleElement(loading) {
            if (loading) elem.show();
            else elem.hide();
          }

          function isLoading() {
            return $http.pendingRequests.length > 0;
          }
        }
      };
    }]);

'use strict';

/**
 * @ngdoc directive
 * @name appApp.directive:collapseSidebar
 * @description
 * # collapseSidebar
 */
angular.module('appApp')
	.directive('collapseSidebar', ["$timeout", function($timeout) {
		return {
			restrict: 'AE',
			replace: true,
			transclude: true,
			require: '?headingTitle',
			template: '<div class="wrapper-side-sidebar">' +
									'<div class="heading-side">' +
										'<a href="/#/"><i class="fa fa-chevron-left back"></i></a>' +
										'<div class="heading-title">' +
											'{{headingtitle}}' +
										'</div>' +
									'</div>' +
									'<div class="content-side" ng-transclude>' +
									'</div>' +
								'</div>',
			link: function (scope, element, attrs) {
				attrs.$observe('headingTitle', function(val){
					scope.headingtitle = val;
				});
			}
		};
	}]);

'use strict';

/**
 * @ngdoc function
 * @name appApp.controller:ProfileCtrl
 * @description
 * # ProfileCtrl
 * Controller of the appApp
 */
angular.module('appApp')
.controller('ProfileCtrl',['$scope', '$rootScope', 'myVilleAPI','AuthentificationService', '$routeParams', function ($scope, $rootScope, myVilleAPI, AuthentificationService, $routeParams) {

	$scope.editUser = Object.assign({}, $scope.user);
  $scope.editBox = function(){
    if($scope.editMode) $scope.editMode = false;
    else $scope.editMode = true;
  };

  $scope.editClick = function(){
  	if(!$scope.editUser.username){
  		$scope.message = 'Le champ pseudonyme ne peut pas être vide.';
  		return;
  	}
  	if(!$scope.editUser.Opassword && $scope.editUser.Npassword) {
  		$scope.message = 'Nous avons besoin de votre ancien mot de passe.';
  		return;
  	}

  	var data = {
  		username: $scope.editUser.username,
  		password: $scope.editUser.Npassword,
  		oldPassword: $scope.editUser.Opassword
  	};
  	myVilleAPI.User.update(data).then(function(user){
  		$rootScope.user.username = $scope.editUser.username;
  		$scope.editMode = false;
  		$scope.message = '';
  	}, function(err){
  		$scope.message = err.data.message;
  	});
  };

  $scope.editAvatarClick = function(element){

    var files = element.files;
    var reader = new FileReader();
    reader.readAsDataURL(files[0]);

    reader.onload = function (e) {
      var formData = new FormData();
      formData.append('avatar',files[0]);

      myVilleAPI.User.updateAvatar(formData).then(function(user){
        AuthentificationService.updateAvatar(user);
      }, function(err){
      	$scope.message = err.data.message;
      });
    }
  };

	$scope.editMode = false;
  if($routeParams.userId){
  	myVilleAPI.User.get($routeParams.userId).then(function(data){
  		$scope.userWanted = {
  			avatar: data.data.avatar,
  			username: data.data.username
  		};
  	});
  }
}]);

'use strict';
/**
 * @ngdoc function
 * @name appApp.controller:FavoriteCtrl
 * @description
 * # UACtrl
 * Controller of the appApp
 */
angular.module('appApp')
  .controller('FavoriteCtrl', ["$rootScope", "$scope", "myVilleAPI", function ($rootScope, $scope, myVilleAPI) {
	$scope.$emit('filterForce', 3);
	var getFavorites = function(){
		$scope.favorites = $rootScope.user.favoris;
		$scope.tabFavorite = [];
		//TODO Recode this function with favorite route
	  	if($scope.favorites !== null){
	  		for(var i=0;i < $scope.favorites.length;i++){
	  			myVilleAPI.UAS.getOne($scope.favorites[i]).then(function(ua){
						myVilleAPI.User.get(ua.data.owner).then(function(user){
							var data = {
								ua: ua,
								owner: user.data.username
							};
							$scope.tabFavorite.push(data);
						});
	  			});
	  		}
	  	}
	};

	getFavorites();

	$scope.$on('updateFavorite', function(){
		getFavorites();
	});

	$scope.centerOnMap = function(coordinates){
		$scope.$emit('centerOnMap', coordinates); // we do an event to tell to map controller to do the center on these coordinates
	};
 }]);

'use strict';

/**
 * @ngdoc function
 * @name appApp.controller:UACtrl
 * @description
 * # UACtrl
 * Controller of the appApp
 */
angular.module('appApp')
	.controller('UACtrl', ["$rootScope", "$scope", "$window", "myVilleAPI", "localStorageService", "$location", "ngDialog", function ($rootScope, $scope, $window, myVilleAPI, localStorageService, $location, ngDialog) {

	$scope.$emit('editMode')

	/*Change the style*/
	angular.element(document.getElementById('map'))[0].style.flex = 0;
	angular.element(document.getElementsByClassName('side-sidebar')[0])[0].style.flex = 1;

	$scope.ua = {};
	$scope.tinymceOptions = {
		onChange: function(e) {
			// put logic here for keypress and cut/paste changes
		},
		inline: false,
		plugins : 'advlist autolink link image lists charmap preview textcolor',
		skin: 'lightgray',
		theme : 'modern',
		height: '250px'
	};

	$scope.okClick = function() {
		$scope.closeThisDialog();
	}

	$scope.$on('ngDialog.closing', function(){
		$scope.$emit('leafletDirectiveMap.map.zoomend');
		$window.location = '#/';
	});

	$scope.$on('drawingData', function(event, drawing){
		$scope.ua.drawing = drawing;
	});

	$scope.$on('submitUA', function(e, d){
		angular.element(document.getElementById('map'))[0].style.flex = 0;
		angular.element(document.getElementsByClassName('create-ua-button')[0])[0].style.display = 'none';
		angular.element(document.getElementsByClassName('side-sidebar')[0])[0].style.display = 'flex';
		if(!$scope.ua.desc || !$scope.ua.title){
			$scope.message = 'Un ou des champs sont manquants.';
			return;
		}
		if(!$scope.ua.drawing){
			$scope.message = 'Vous devez dessiner sur la carte !'
			return;
		}

		var data = {
			title: $scope.ua.title,
			description: $scope.ua.desc,
			geojson: JSON.stringify($scope.ua.drawing)
		};

		myVilleAPI.UAS.create(data).then(function(user){
			ngDialog.open({controller: 'UACtrl', template: 'views/modalUaCreated.html', appendClassName: 'popup-auto-height'});
			$scope.ua.title = null;
			$scope.ua.desc = null;
			$scope.ua.drawing = null;
		}, function(error){
			$scope.message = error.data.message;
			console.log(error.data);
		});
	});
	$scope.$on("$destroy", function(){
			$scope.$emit('normalMode');
			angular.element(document.getElementById('map'))[0].style.flex = 1;
			angular.element(document.getElementsByClassName('create-ua-button')[0])[0].style.display = 'none';
			angular.element(document.getElementsByClassName('side-sidebar')[0])[0].style.display = 'flex';
  });
	$scope.showEditMap = function(){
		angular.element(document.getElementById('map'))[0].style.flex = 1;
		angular.element(document.getElementsByClassName('create-ua-button')[0])[0].style.display = 'block';
		angular.element(document.getElementsByClassName('side-sidebar')[0])[0].style.display = 'none';
	};
}]);

'use strict';

/**
* @ngdoc function
* @name appApp.controller:MineCtrl
* @description
* # MineCtrl
* Controller of the appApp
*/
angular.module('appApp')
.controller('MineCtrl', ["$scope", "ngDialog", "myVilleAPI", function ($scope, ngDialog, myVilleAPI) {
	$scope.$emit('filterForce', 2);
	$scope.centerOnMap = function(coordinates){
		$scope.$emit('centerOnMap', coordinates); // we do an event to tell to map controller to do the center on these coordinates
	}
	$scope.editUA = function(ua){
		ngDialog.open({data: ua, template: 'views/edit_ua.html', appendClassName: 'modal-edit-ua', controller: 'EdituaCtrl'});
	}
	$scope.deleteUA = function(ua){
		myVilleAPI.UAS.delete(ua._id).then(function(){
			$scope.$emit('leafletDirectiveMap.map.dragend')
		});
	}
}]);

'use strict';

/**
 * @ngdoc function
 * @name appApp.controller:EdituaCtrl
 * @description
 * # EdituaCtrl
 * Controller of the appApp
 */
angular.module('appApp')
	.controller('EdituaCtrl', ['$scope', 'myVilleAPI', function($scope, myVilleAPI) {
		$scope.tinymceOptions = {
			onChange: function(e) {
				// put logic here for keypress and cut/paste changes
			},
			inline: false,
			plugins : 'advlist autolink link image lists charmap preview',
			skin: 'lightgray',
			theme : 'modern'
		};
		$scope.editUa = function(){
			myVilleAPI.UAS.update($scope.ngDialogData._id, {title: $scope.ngDialogData.title, description: $scope.ngDialogData.description, publish: $scope.ngDialogData.private.toString()}).then(function(ua){
				$scope.closeThisDialog();
			});
		};

	}]);

'use strict';
angular.module('appApp')
.controller('VoteCtrl', ["$rootScope", "$scope", "myVilleAPI", "AuthentificationService", function ($rootScope, $scope, myVilleAPI, AuthentificationService) {
	twemoji.size = 72;
	$scope.twemoji = twemoji;
	$scope.vote = [
		{
			smiley: '😍',
			isVote: false,
			text: "J'aime"
		},
		{
			smiley: '😃',
			isVote: false,
			text: "Wouah"
		},
		{
			smiley: '🤔',
			isVote: false,
			text: "Bien pensé"
		},
		{
			smiley: '😴',
			isVote: false,
			text: "Sans intérêt"
		},
		{
			smiley: '😣',
			isVote: false,
			text: "J'aime pas"
		},
	];

	if(AuthentificationService.routeGuardian()){
		myVilleAPI.Vote.getVote($scope.ngDialogData._id).then(function(vote){
			if(vote){
				$scope.vote[vote.data.vote[0]].isVote = true;
			}
		})
	}
	$scope.voteCount = $scope.ngDialogData.vote.length;

	$scope.doVote = function(id){
		if(!$scope.vote[id].isVote){
			myVilleAPI.UAS.vote($scope.ngDialogData._id, {vote: id}).then(function(){
				var alreadyVoted = false;
				for(var i = 0; i < $scope.vote.length; i++){
					if($scope.vote[i].isVote) {
						alreadyVoted = true;
					}
					if(i == id){
						$scope.vote[i].isVote = true;
					}else{
						$scope.vote[i].isVote = false;
					}
				}
				if(!alreadyVoted) $scope.voteCount++;
			});
		} else {
			myVilleAPI.UAS.deleteVote($scope.ngDialogData._id).then(function(){
				for(var i = 0; i < $scope.vote.length; i++){
					if($scope.vote[i].isVote) {
						$scope.vote[i].isVote = false;
						$scope.voteCount--;
					}
				}
			});
		}
	};
}]);

angular.module('appApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/edit_ua.html',
    "<div id=\"singleUA\"> <div class=\"ua-title\"> Edition de {{ngDialogData.title}} </div> <div class=\"form-label\"> <h1>Titre de l'aménagement :</h1> <input type=\"text\" ng-required ng-model=\"ngDialogData.title\" placeholder=\"Nom de votre aménagement\"> </div> <div class=\"form-label\"> <h1>Description du projet :</h1> <textarea ng-required ui-tinymce=\"tinymceOptions\" ng-model=\"ngDialogData.description\"></textarea> </div> <div class=\"form-label\"> <h1>Visibilité :</h1> <ul style=\"list-style: none\"> <li> <input ng-model=\"ngDialogData.private\" type=\"checkbox\"> Privé </li> </ul> </div> <button class=\"btn-blue\" ng-click=\"editUa()\">Editer</button> </div>"
  );


  $templateCache.put('views/favorite.html',
    "<collapse-sidebar id=\"favoriteUA\" heading-title=\"Favoris\"> <div class=\"list-ua\"> <div class=\"ua-row\" ng-if=\"tabFavorite.length < 1\"> <div> Il n'y a rien pour l'instant 😞 </div> </div> <div class=\"ua-row\" ng-repeat=\"favorite in tabFavorite\"> <div class=\"row-title\"> <a ng-click=\"centerOnMap(favorite.ua.data.location.geometries)\">{{favorite.ua.data.title}}</a> </div> <div class=\"row-owner\"> {{favorite.owner}} </div> </div> </div> </collapse-sidebar>"
  );


  $templateCache.put('views/login.html',
    "<div class=\"login-side\" ng-if=\"log == 1\"> <div ng-if=\"message\"> {{message}} </div> <div class=\"form-group\"> <div class=\"input-group\"> <div class=\"input-group-addon\"><i class=\"fa fa-user\"></i></div> <input type=\"text\" ng-keyup=\"$event.keyCode == 13 && loginClick()\" ng-model=\"user.email\" placeholder=\"Email\"> </div> </div> <div class=\"form-group\"> <div class=\"input-group\"> <div class=\"input-group-addon\"><i class=\"fa fa-lock\"></i></div> <input type=\"password\" ng-keyup=\"$event.keyCode == 13 && loginClick()\" ng-model=\"user.password\" placeholder=\"Password\"> <div class=\"top-right\"><a ng-click=\"switchMode('forgot')\">Mot de passe oublié ?</a></div> </div> </div> <button class=\"btn-blue\" ng-click=\"loginClick()\">Login</button> <div class=\"action-group\"> <div class=\"remember-action\"> <input type=\"checkbox\" checked class=\"checkbox-input\"> Se souvenir de moi </div> <div class=\"create-account\"> Vous n'avez pas de compte ? <a ng-click=\"switchMode('signup')\">S'inscrire</a> </div> </div> <div class=\"social-group\"> <div class=\"social-txt\"> Ou connectez vous avec </div> <div class=\"social-list\"> <div ng-click=\"loginFB()\" class=\"social-circle\"> <i class=\"fa fa-facebook\"></i> </div> <div ng-click=\"loginGoogle()\" class=\"social-circle\"> <i class=\"fa fa-google\"></i> </div> </div> </div> </div> <div class=\"login-side\" ng-if=\"log == 2\"> <div class=\"top-left-dialog\"><a ng-click=\"switchMode('login')\">&lsaquo;</a></div> <h1>Inscription</h1> <div ng-if=\"message\"> {{message}} </div> <div class=\"form-group\"> <div class=\"input-group\"> <div class=\"input-group-addon\"><i class=\"fa fa-user\"></i></div> <input type=\"text\" ng-model=\"signupUser.nickname\" placeholder=\"Pseudonyme\"> </div> </div> <div class=\"form-group\"> <div class=\"input-group\"> <div class=\"input-group-addon\"><i class=\"fa fa-lock\"></i></div> <input type=\"password\" ng-model=\"signupUser.password\" placeholder=\"Mot de passe\"> </div> </div> <div class=\"form-group\"> <div class=\"input-group\"> <div class=\"input-group-addon\"><i class=\"fa fa-user\"></i></div> <input type=\"email\" ng-model=\"signupUser.email\" placeholder=\"Email\"> </div> </div> <div class=\"form-group\"> <div class=\"input-group\"> <div class=\"input-group-addon\"><i class=\"fa fa-user\"></i></div> <input type=\"phonenumber\" ng-model=\"signupUser.phonenumber\" placeholder=\"Numéro de téléphone\"> </div> </div> <button class=\"btn-blue\" ng-click=\"createClick()\">Créer compte</button> </div> <div class=\"login-side\" ng-if=\"log == 3\"> <div class=\"top-left-dialog\"><a ng-click=\"switchMode('login')\">&lsaquo;</a></div> <h1>Mot de passe oublié</h1> <div ng-if=\"message\"> {{message}} </div> <div class=\"form-group\"> <div class=\"input-group\"> <div class=\"input-group-addon\"><i class=\"fa fa-mail\"></i></div> <input type=\"text\" ng-model=\"forgotPwd.email\" placeholder=\"Email\"> </div> </div> <button class=\"btn-blue\" ng-click=\"forgotClick()\">GO !</button> </div>"
  );


  $templateCache.put('views/mine.html',
    "<collapse-sidebar id=\"myUA\" heading-title=\"{{'Mes propositions'}}\"> <div class=\"list-ua\"> <div class=\"ua-row\" ng-if=\"cachedMarkers.features.length < 1\"> <div> Il n'y a rien pour l'instant 😞 </div> </div> <div class=\"ua-row\" ng-if=\"cachedMarkers && feature.properties._doc.owner.username == user.username\" ng-repeat=\"feature in cachedMarkers.features\"> <div class=\"row-title\"> <a ng-click=\"centerOnMap(feature.geometry.geometries)\">{{feature.properties._doc.title}}</a> </div> <div class=\"row-date\"> {{feature.properties._doc.createdAt | formatDate}} </div> <div class=\"row-edit\" ng-click=\"editUA(feature.properties._doc)\"> <i title=\"Editer\" class=\"fa fa-edit\"></i> </div> <div class=\"row-edit\" ng-click=\"deleteUA(feature.properties._doc)\"> <i title=\"Supprimer\" class=\"fa fa-close\"></i> </div> </div> </div> </collapse-sidebar>"
  );


  $templateCache.put('views/modalUaCreated.html',
    "<div class=\"modalConfirm\"> <h4>L'aménagement a été crée avec succès !</h4> <button class=\"btn-blue\" ng-click=\"okClick()\">OK</button> </div>"
  );


  $templateCache.put('views/profile.html',
    "<collapse-sidebar id=\"profile\" heading-title=\"{{userWanted.username}}\"> <div class=\"profile-picture\"> <div class=\"profile-avatar\"> <img ng-src=\"{{userWanted.avatar ? 'http://localhost:3000/static/' + userWanted.avatar : (userWanted.facebook_id) ? 'http://graph.facebook.com/'+ userWanted.facebook_id +'/picture' : 'images/profile-default.png'}}\"> </div> <div class=\"profile-nickname\">{{userWanted.username}}</div> </div> </collapse-sidebar>"
  );


  $templateCache.put('views/profile_update.html',
    "<collapse-sidebar id=\"profile\" heading-title=\"Mon profil\"> <div class=\"profile-picture\"> <div class=\"profile-avatar\"> <img ng-src=\"{{user.avatar ? 'http://localhost:3000/static/' + user.avatar : (user.facebook_id) ? 'http://graph.facebook.com/'+ user.facebook_id +'/picture' : 'images/profile-default.png'}}\"> <input type=\"file\" id=\"new_avatar_file\" onchange=\"angular.element(this).scope().editAvatarClick(this)\" name=\"avatar\"> </div> <div class=\"profile-nickname\">{{user.username}}</div> <div ng-if=\"!editMode\" class=\"profile-description\" ng-if=\"user.description\">{{user.description}}</div> <div ng-if=\"editMode && user.description\" class=\"profile-description\"><textarea>{{user.description}}</textarea></div> <div class=\"profile-detailled\"> <div ng-if=\"message\">{{message}}</div> <div class=\"edit-icon\" ng-click=\"editBox()\"><i ng-class=\"editMode ? 'fa fa-user' : 'fa fa-pencil'\"></i></div> <h1>Pseudonyme</h1> <span ng-if=\"!editMode\" class=\"edit-field\">{{user.username}}</span> <span ng-if=\"editMode\" class=\"edit-field\"><input type=\"text\" ng-model=\"editUser.username\"></span> <h1>Email</h1> <span class=\"edit-field\">{{user.email}}</span> <h1 ng-if=\"user.phonenumber\">Numéro</h1> <span ng-if=\"user.phonenumber\" class=\"edit-field\">{{user.phonenumber}}</span> <h1 ng-if=\"editMode\">Ancien mot de passe</h1> <span ng-if=\"editMode\" class=\"edit-field\"><input type=\"password\" ng-model=\"editUser.Opassword\"></span> <h1 ng-if=\"editMode\">Nouveau mot de passe</h1> <span ng-if=\"editMode\" class=\"edit-field\"><input type=\"password\" ng-model=\"editUser.Npassword\"></span> <button ng-if=\"editMode\" class=\"btn-blue\" ng-click=\"editClick()\">Editer</button> </div> </div> </collapse-sidebar>"
  );


  $templateCache.put('views/reset_password.html',
    "<div class=\"login-side\"> <h1>Réinitialisation de mot de passe</h1> <div ng-if=\"message\"> {{message}} </div> <div class=\"form-group\"> <div class=\"input-group\"> <div class=\"input-group-addon\"><i class=\"fa fa-lock\"></i></div> <input type=\"password\" ng-model=\"resetPwd.pwd1\" placeholder=\"Nouveau mot de passe\"> </div> </div> <div class=\"form-group\"> <div class=\"input-group\"> <div class=\"input-group-addon\"><i class=\"fa fa-lock\"></i></div> <input type=\"password\" ng-model=\"resetPwd.pwd2\" placeholder=\"Retaper votre nouveau mot de passe\"> </div> </div> <button class=\"btn-blue\" ng-click=\"forgotClick()\">Réinitialiser</button> </div>"
  );


  $templateCache.put('views/single_ua.html',
    "<div id=\"singleUA\"> <div class=\"socialUA\"> <iframe src=\"https://www.facebook.com/plugins/like.php?href=https%3A%2F%2Fdevelopers.facebook.com%2Fdocs%2Fplugins%2F&width=94&layout=button_count&action=like&size=small&show_faces=true&share=false&height=30&appId=1731346920416495\" width=\"100\" height=\"30\" style=\"border:none;overflow:hidden\" scrolling=\"no\" frameborder=\"0\" allowtransparency=\"true\"></iframe> <iframe src=\"https://platform.twitter.com/widgets/tweet_button.html?size=l&url=https%3A%2F%2Fdev.twitter.com%2Fweb%2Ftweet-button&via=twitterdev&related=twitterapi%2Ctwitter&text=custom%20share%20text&hashtags=example%2Cdemo\" width=\"140\" height=\"30\" scrolling=\"no\" frameborder=\"0\" title=\"Twitter Tweet Button\" style=\"border: 0; overflow: hidden\"> </iframe> <div class=\"vote-counter display-desktop\" ng-if=\"token\"> {{voteCount}} {{voteCount > 1 ? 'réactions' : 'réaction'}}, et vous ? </div> <div ng-if=\"token\" class=\"voteList display-desktop\"> <div class=\"vote-column\" ng-repeat=\"x in vote\"> <div class=\"vote-column-heading\" ng-class=\"x.isVote ? 'voted' : 'no-voted'\" ng-click=\"doVote($index)\" ng-bind-html=\"twemoji.parse(x.smiley)\"> </div> <div class=\"vote-column-overlay\"> {{x.text}} </div> </div> </div> </div> <div class=\"vote-counter display-tablet\" ng-if=\"token\"> {{voteCount}} {{voteCount > 1 ? 'réactions' : 'réaction'}}, et vous ? </div> <div ng-if=\"token\" class=\"voteList display-tablet\"> <div class=\"vote-column\" ng-repeat=\"x in vote\"> <div class=\"vote-column-heading\" ng-class=\"x.isVote ? 'voted' : 'no-voted'\" ng-click=\"doVote($index)\" ng-bind-html=\"twemoji.parse(x.smiley)\"> </div> <div class=\"vote-column-overlay\"> {{x.text}} </div> </div> </div> <div class=\"ua-title\"> {{ngDialogData.title}} </div> <div ng-bind-html=\"ngDialogData.description\" class=\"ua-description\"> </div> </div>"
  );


  $templateCache.put('views/ua.html',
    "<collapse-sidebar id=\"createUA\" heading-title=\"Créer un aménagement\"> <div class=\"form-dable\"> <div ng-if=\"message\"> {{message}} </div> <div class=\"form-label\"> <h1>Titre</h1> <span class=\"edit-field\"><input type=\"text\" ng-model=\"ua.title\"></span> </div> <div class=\"form-label\"> <h1>Description</h1> <textarea ui-tinymce=\"tinymceOptions\" ng-model=\"ua.desc\" placeholder=\"Entrez votre texte ici\">\n" +
    "\t\t</div>\n" +
    "\t\t<button class=\"btn-blue create-btn\" ng-click=\"showEditMap()\">Choisir l'emplacement de l'aménagement</button>\n" +
    "\t</div>\n" +
    "</collapse-sidebar>"
  );

}]);
