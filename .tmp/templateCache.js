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
