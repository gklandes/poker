(function () {
    'use strict';

    angular
        .module('poker')
        .config(stateConfig)
        ;

    stateConfig.$inject = ['$stateProvider', '$urlRouterProvider'];
    function stateConfig ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise("/");

            $stateProvider.state('login', {
                url: '/login/{path:.*}',
                templateUrl: '/partials/login.html',
                controller: 'LoginCtrl',
                controllerAs: 'vm'
            });
            $stateProvider.state('reset', {
                url: '/reset',
                templateUrl: '/partials/reset.html',
                controller: 'ResetCtrl',
                controllerAs: 'vm'
            });
            $stateProvider.state('logout', {
                url: '/logout',
                template: '<div class="text-center text-muted"><i class="fa fa-spinner fa-spin"></i></div>',
                controller: 'LogoutCtrl',
            });
            $stateProvider.state('loading', {
                url: '/loading/{path:.*}',
                template: '<div class="text-center text-muted"><i class="fa fa-spinner fa-spin"></i></div>',
                controller: 'LoadingCtrl'
            });
            $stateProvider.state('home', {
                url: '/',
                templateUrl: '/partials/home.html',
                controller: 'HomeCtrl',
                controllerAs: 'vm'
            });
            $stateProvider.state('join', {
                url: '/join',
                templateUrl: '/partials/join.html',
                controller: 'JoinCtrl',
                controllerAs: 'vm'
            });
            $stateProvider.state('game', {
                url: '/game/:id',
                templateUrl: '/partials/game.html',
                controller: 'GameCtrl',
                controllerAs: 'vm'
            });
            $stateProvider.state('bid', {
                url: '/game/:game_id/bid',
                templateUrl: '/partials/bid.html',
                controller: 'BidCtrl',
                controllerAs: 'vm'
            });
    }
})();
