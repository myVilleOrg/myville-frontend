'use strict';

/**
 * @ngdoc function
 * @name appApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the appApp
 */
angular.module('appApp')
.controller('LoginCtrl', function ($rootScope, $scope, $window, myVilleAPI, localStorageService, hello) {
  $scope.user = {};

  $scope.loginClick = function() {

    if($scope.user.username || $scope.user.password){
        myVilleAPI.User.login($scope.user).then(function(user){
          if(!user.data.user) return $scope.message = 'Mauvaise combinaison';
          $rootScope.token = user.data.token;
          $rootScope.user = user.data.user;
          localStorageService.set('token', user.data.token);
          localStorageService.set('user', user.data.user);
          $scope.message = '';
          $scope.closeThisDialog();
        }, function(error){
          $scope.message = error.data.message;
          console.log(error.data);
        });
    } else {
      $scope.message = 'Error, fiels needed.';
    }
  };
  $scope.loginFB = function(){
    hello('facebook').login();
  };
  $scope.loginTwitter = function(){
    hello('twitter').login();
  };
  hello.on("auth.login", function (auth) {
    console.log(auth);
    if(auth.network === 'facebook') {
      myVilleAPI.User.loginFacebook({accessToken: auth.authResponse.access_token}).then(function(user){
        $rootScope.token = user.data.token;
        $rootScope.user = user.data.user;
        localStorageService.set('token', user.data.token);
        localStorageService.set('user', user.data.user);
        $scope.closeThisDialog();
      });
    }
  });
});
