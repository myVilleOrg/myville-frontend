'use strict';

/**
 * @name CGroupCtrl
 * @description
 * # myVille
 * Controller which permits to create a group
 */
angular.module('appApp')
	.controller('CGroupCtrl', function ($rootScope, $scope, $window, myVilleAPI, localStorageService, $location, ngDialog, $sessionStorage) {

		//Prendre la liste des groupes
		var getGroups = function(){
				myVilleAPI.Group.getGroup().then(function(group){
					$scope.myGroups = group.data.groupes;
					$scope.membreAdmin = new Array();
					$scope.membreEcrivain = new Array();
					$scope.membreLecteur = new Array();
					for(var i=0;i<$scope.myGroups.length;i++){
							if($scope.myGroups[i].admins.indexOf($rootScope.user._id)!=-1){
								$scope.membreAdmin.push($scope.myGroups[i].name);
							}
							else if($scope.myGroups[i].ecrivains.indexOf($rootScope.user._id)!=-1){
								$scope.membreEcrivain.push($scope.myGroups[i].name);
							}
							else if($scope.myGroups[i].lecteurs.indexOf($rootScope.user._id)!=-1){
								$scope.membreLecteur.push($scope.myGroups[i].name);
							}
					}
				}, function(error){
					$window.alert(error.data.message);
					return;
				});
		};
		getGroups();

		$scope.$on('getGroup' , function(){
					getGroups();
		});

		//create un groupe
		$scope.$on('submitGroup',function(e,d){
			if(!$scope.group.name || !$scope.group.desc){
				$window.alert('Un ou des champs sont manquants.');
				return;
			}

		  var data={
				name : $scope.group.name,
				description: $scope.group.desc,
			};


			myVilleAPI.Group.createGroup(data).then(function(user){
				$window.alert('Le group a été crée avec succès !');
				$window.location = '#/profile/group';
				$scope.group.name = null;
				$scope.group.desc = null;
			}, function(error){
				$window.alert(error.data.message);
				return;
			});
		});

		//justifier le type de membre d'un groupe et retourner une couleur particulière
		$scope.role = function(member){
			if($rootScope.membreType[0].indexOf(member)!=-1){
				return {"color":"#EE2C2C"};
			}
			else if($rootScope.membreType[1].indexOf(member)!=-1){
				return {"color":"#FF8C00"};
			}
			else if($rootScope.membreType[2].indexOf(member)!=-1){
				return {"color":"#8B8989"};
			}
		};

		//justifier le type de membre d'un groupe et retourner un nom particulière
		$scope.title = function(member){
			if($rootScope.membreType[0].indexOf(member)!=-1){
				return "admin";
			}
			else if($rootScope.membreType[1].indexOf(member)!=-1){
				return "écrivain";
			}
			else if($rootScope.membreType[2].indexOf(member)!=-1){
				return "lecteur";
			}
		};

		//justifier le type de membre d'un groupe et retourner une couleur particulière
		$scope.roleInGroup = function(group){
			if($scope.membreAdmin.indexOf(group.name)!=-1){
				return {"color":"#EE2C2C"};
			}
			else if($scope.membreEcrivain.indexOf(group.name)!=-1){
				return {"color":"#FF8C00"};
			}
			else if($scope.membreLecteur.indexOf(group.name)!=-1){
				return {"color":"#8B8989"};
			}
		};

		//justifier le type de membre d'un groupe et retourner un nom particulière
		$scope.roleTitle = function(group){
			if($scope.membreAdmin.indexOf(group.name)!=-1){
				return "admin";
			}
			else if($scope.membreEcrivain.indexOf(group.name)!=-1){
				return "écrivain";
			}
			else if($scope.membreLecteur.indexOf(group.name)!=-1){
				return "lecteur";
			}
		};


		//prendre les projets d'un groupe
		var getProjets = function(group){
			myVilleAPI.Group.groupInfo(group).then(function(group){
				$rootScope.groupProjets = group.data.uas;
				$rootScope.groupMembres = group.data.admins.concat(group.data.ecrivains.concat(group.data.lecteurs));
				$rootScope.membreType = new Array(group.data.admins,group.data.ecrivains,group.data.lecteurs);
				},function(error){
					$window.alert(error.data.message);
				return;
			});
		};

		//récupérer les informations d'un groupe pour afficher dans le page de edit_group
    $scope.editGroup = function(group){
				$rootScope.groupCurrent = group;
				localStorageService.set('groupCurrent',group);
				getProjets(group);
		};

		//quitter d'un groupe
		$scope.quitGroup = function(group){
			var isConfirmed = $window.confirm('\u00cates-vous s\u00fbr de vouloir quiter ce groupe ?');
			if (isConfirmed) {
				myVilleAPI.Group.quitGroup(group._id).then(function(){
					getGroups();
				});
			}
		};

		// Persistance des données
		$scope.searchKeyG = $sessionStorage.searchKeyG;
		$scope.groupSearch = $sessionStorage.groupSearch;
		$scope.activeT = $sessionStorage.activeT;
		if($location.url().substring(15) !==''){
			$scope.activeT=$location.url().substring(15);
		}

		//module de la recherche
		$scope.searchGroup = function(searchKeyG){
			$scope.searchKeyG = searchKeyG;
			$sessionStorage.searchKeyG=$scope.searchKeyG;
			myVilleAPI.Group.searchGroup({search : searchKeyG}).then(function(group){
				$scope.groupSearch = group.data;
				$sessionStorage.groupSearch =$scope.groupSearch;
			});
		};

		$scope.changeTab = function(id){
			$scope.activeT = id;
			$sessionStorage.activeT = $scope.activeT;
		}
		$scope.activeTab = function(id,c){
			if (typeof $scope.activeT === 'undefined' || $scope.activeT === ''){
				var currentRoute = 'mygroups';
			}else{
				var currentRoute =  $scope.activeT;
			}
			if (c === 'head'){
				return id === currentRoute ? 'active' : '';
			}else{
				return id === currentRoute ? 'tab-pane fade in active' : 'tab-pane fade';
			}

		};

		//participer dans un groupe par recherche
		if($location.url().substring(20) !==''){
			$scope.editTab=$location.url().substring(20);
		}
		$scope.activeTabEdit = function(id,c){
			if (typeof $scope.editTab === 'undefined' || $scope.editTab === ''){
				var currentRoute = 'projets';
			}else{
				var currentRoute =  $scope.editTab;
			}
			if (c === 'head'){
				return id === currentRoute ? 'active' : '';
			}else{
				return id === currentRoute ? 'tab-pane fade in active' : 'tab-pane fade';
			}
		}
		$scope.changeTabEdit = function(id){
			$scope.editTab = id;
		}

		$scope.GetInGroup = function(group){
			myVilleAPI.Group.getInGroup(group._id).then(function(){

				console.log("il faut seulement changer le icone");
			});
		};

		$scope.userGroupe = function(group){
			var users=group.admins.concat(group.ecrivains.concat(group.lecteurs));
			for (var i=0;i<users.length;i++){
				if($rootScope.user._id === users[i]){
					return true;
				}
			}
			return false;
		};

		$scope.ajoutProjet = function(group){
			$rootScope.ajoutDeGroup=true;
			localStorageService.set('ajoutDeGroup',true);
		};

		$scope.demandeDroit = function(Role){
			if(Role.roleNow!=="admin"&&(!(Role.roleNow==="écrivain"&&Role.roleAsk==="ecrivain"))){
				myVilleAPI.Group.demandeDroit(Role).then(function(response){
					if(response.data.message==="success"){
						alert("Vous avez envoyé le demande avec succès");
					}
					else {
						alert("Désolée, il y a une erreur");
					}
				});
			}
			else{
				alert("Vous êtes déja l'"+Role.roleNow+", vous avez assez de droit.")
			}
		};
		$scope.demandeRole = function(message){
			if(message.demande==='DemandeAdmin'){
				return "admin";
			}
			else if(message.demande==='DemandeEcrivain'){
				return "ecrivain";
			}
			else{
				return "inconnu";
			}
		};

		//renvoyer la réponse pour le demande0
		$scope.decision = function(decisionMessage){
			myVilleAPI.Group.donnerDroit(decisionMessage).then(function(message){
				if(message.data.message==="success"||message.data.message==="rejecter"){
					decisionMessage.message.vu=true;
				}
			});
		}


		$rootScope.$on('ajouterLeProjet',function(e,projet){
			getProjets($rootScope.groupCurrent);
			window.location.href='/#/profile/edit_group';
		});

		$scope.centerOnMap = function(coordinates){
			$scope.$emit('centerOnMap', coordinates); // we do an event to tell to map controller to do the center on these coordinates
		};
});
