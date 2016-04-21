(function () {
    'use strict';

    angular
        .module('poker')
        .config(function ($stateProvider, $urlRouterProvider) {

            $urlRouterProvider.otherwise("home");

            $stateProvider.state('home', {
                url: '/',
                templateUrl: '/partials/home.html',
                controller: 'appCtrl',
                controllerAs: 'vm'
            });
        });
})();
