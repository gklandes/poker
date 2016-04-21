(function () {
    'use strict';
    angular
        .module('poker',['ngResource','ui.router'])
        .config(stateConfig)
        .controller('AppCtrl', AppCtrl)
        .controller('LoginCtrl', LoginCtrl)
        .controller('HomeCtrl', HomeCtrl)
        ;

    stateConfig.$inject = ['$stateProvider', '$urlRouterProvider'];
    function stateConfig ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise("/");

            $stateProvider.state('login', {
                url: '/',
                templateUrl: '/partials/login.html',
                controller: 'LoginCtrl',
                controllerAs: 'vm'
            });
            $stateProvider.state('home', {
                url: '/home',
                templateUrl: '/partials/home.html',
                controller: 'HomeCtrl',
                controllerAs: 'vm'
            });
    }

    AppCtrl.$inject = [];
    function AppCtrl () {
        var app = this;
        app.version = '1.0';
    }

    LoginCtrl.$inject = ['$state'];
    function LoginCtrl ($state) {
        var vm = this;
        vm.login = {};
        vm.doLogin = doLogin;

        function doLogin () {
            if (vm.login.password !== 'password') $state.go('home');
            else alert('Seriously, ANY OTHER password is acceptable ... try again');
        }
    }

    HomeCtrl.$inject = ['$resource'];
    function HomeCtrl ($resource) {
        var vm = this;
        var gamesResource = $resource('/api/games/:id',{ id: '@id'});
        vm.createGame = _.debounce(createGame,500);
        vm.deleteGame = _.debounce(deleteGame,500);

        setupSSE();
        getGames();

        return;

        function setupSSE () {
            var data, es = new EventSource("/sse");
            es.onmessage = function (event) {
                data = JSON.parse(event.data);
                switch (data.type) {
                    case 'game' : getGames(); break;
                }
            };
        }
        function getGames () {
            gamesResource.query({},
                function (success) { 
                    vm.games = success;
                },
                alertError
            );
        }
        function createGame () {
            vm.saving = true;
            gamesResource.save(vm.newgame,
                function (success) {
                    vm.saving = false;
                    getGames();
                    vm.newgame.name = undefined;
                },
                alertError
            );
        }
        function deleteGame (id) {
            gamesResource.delete({id: id},
                function (success) {
                    getGames();
                },
                alertError
            );
        }
        function alertError (error) {
            alert(error.data);
        }
    }
})();