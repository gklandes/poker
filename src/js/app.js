(function () {
    'use strict';

    angular
        .module('poker',['ngResource','ui.router'])
        .config(stateConfig)
        .controller('AppCtrl', AppCtrl)
        .controller('LoginCtrl', LoginCtrl)
        .controller('HomeCtrl', HomeCtrl)
        .controller('GameCtrl', GameCtrl)
        .controller('BidCtrl', BidCtrl)
        .directive('pkFocus', pkFocus)
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

    HomeCtrl.$inject = ['$scope','$resource', '$state'];
    function HomeCtrl ($scope, $resource, $state) {
        var vm = this;
        var gamesResource = $resource('/api/games/:id',{ id: '@id'});
        vm.action = null;
        vm.games = [];

        vm.go = go;
        // vm.createGame = _.debounce(createGame,500);
        // vm.deleteGame = _.debounce(deleteGame,500);

        setupListeners();
        setupSSE();
        getGames();

        return;

        function setupListeners () {
            var stopWatchAction = $scope.$watch('vm.action',function (n) {
                if (n) { $scope.$broadcast('focus',n === 'new' ? 'name' : 'join') }
            });
            $scope.$on('$destroy', stopWatchAction);
        }
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
        function go (id) {
            if (!id) id = vm.action;
            console.log(id);
            $state.go('game',{ id: id });
        }
        // function deleteGame (id) {
        //     gamesResource.delete({id: id},
        //         function (success) {
        //             getGames();
        //         },
        //         alertError
        //     );
        // }
        function alertError (error) {
            alert(error.data);
        }
    }

    GameCtrl.$inject = ['$stateParams'];
    function GameCtrl ($stateParams) {
        var vm = this;
        var idPtn = /[a-z0-9]{24}/i;
        vm.id = $stateParams.id;

        setupGame();

        return;

        function setupGame () {
            if (idPtn.test(vm.id)) {
                console.log('detail view');
            }
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
    }

    BidCtrl.$inject = ['$stateParams'];
    function BidCtrl ($stateParams) {
        var vm = this;
        var game_id = $stateParams.game_id;
        vm.options = ['0','1','2','3','5','8','13','21','34','55','coffee','question'];
            vm.hand = { issue: 'Test-123 A Tough Issue'};

        setupBid();

        return;

        function setupBid () {
            vm.hand = { issue: 'Test-123 A Tough Issue'};
            vm.options = _.map(vm.options,function (opt) {
                return { string: isNaN(parseInt(opt)), value: opt };
            });
        }
    }

    pkFocus.$inject = ['$timeout'];
    function pkFocus ($timeout) {
        return {
            restrict: 'AC',
            link: function (scope, elem, attrs) {
                var target = elem;

                if (attrs.pkFocus == 'init') {
                    $timeout(function () { 
                        target[0].focus();
                        // reassign value; fixes IE issue where cursor lands at beginning of value
                        target[0].value = target[0].value;
                    },100);
                }
                scope.$on('focus', function (e, id) {
                    if (id == attrs.id) {
                        $timeout(function () { target[0].focus(); },100);
                    }
                });
            }
        };
    }

})();