(function () {
    'use strict';

    angular
        .module('poker',['ngResource','ui.router','ui.bootstrap'])
        .service('gamesResource',gamesResource)
        .controller('AppCtrl', AppCtrl)
        .controller('LoginCtrl', LoginCtrl)
        .controller('HomeCtrl', HomeCtrl)
        .controller('GameCtrl', GameCtrl)
        .controller('BidCtrl', BidCtrl)
        .directive('pkFocus', pkFocus)
        ;

    gamesResource.$inject = ['$resource'];
    function gamesResource ($resource) {
        return $resource('/api/games/:id',{ id: '@id' });
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

    HomeCtrl.$inject = ['$scope','$resource', '$timeout', '$state','gamesResource'];
    function HomeCtrl ($scope, $resource, $timeout, $state, gamesResource) {
        var vm = this;
        var undo = {};
        vm.action = null;
        vm.games = [];

        vm.go = _.debounce(go,500);
        vm.deleteGame = _.debounce(deleteGame,500);
        vm.undoDeleteGame = _.debounce(undoDeleteGame,500);

        getGames();
        setupSSE();

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
        function getGames (code) {
            gamesResource.query({ code: code },
                function (success) {
                    vm.games = success;
                },
                alertError
            );
        }
        function go (id) {
            if (id === 'join') $state.go('join');
            if (id) $state.go('game',{ id: id });
            else {
                if (vm.action === 'new') createGame();
                else if (vm.action === 'join') {
                    var game = _.findWhere(vm.games,{ code: vm.code});
                    $state.go('game', { id: game._id });
                }
            }
        }
        function createGame () {
            vm.saving = true;
            gamesResource.save(vm.newgame,
                function (success) {
                    $state.go('game',{ id: success._id });
                },
                alertError
            );
        }
        function deleteGame (game) {
            console.log('delete:',game.name);
            $scope.$apply(function () {
                game.deleted = true;
                undo[game._id] = $timeout(function () {
                    console.log('deleting:',game.name);
                    gamesResource.delete({id: game._id},
                        getGames,
                        alertError
                    );
                },5000);
            });
        }
        function undoDeleteGame (game) {
            console.log('undo:',game.name);
            if (undo[game._id]) {
                $scope.$apply(function () {
                    $timeout.cancel(undo[game._id]);
                    game.deleted = false;
                });
            }
        }
        function alertError (error) {
            alert(error.data);
        }
    }

    GameCtrl.$inject = ['$stateParams', 'gamesResource'];
    function GameCtrl ($stateParams, gamesResource) {
        var vm = this;
        var idPtn = /[a-z0-9]{24}/i;
        vm.id = $stateParams.id;
        vm.game = {};

        setupGame();

        return;

        function setupGame () {
            if (idPtn.test(vm.id)) {
                getGame();
            }
        }
        function getGame () {
            gamesResource.get({ _id: vm.id },
                function (success) { 
                    vm.game = success;
                },
                alertError
            );
        }
        function alertError (error) {
            alert(error.data);
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

                if (attrs.pkFocus === 'init') {
                    $timeout(function () { 
                        target[0].focus();
                        // reassign value; fixes IE issue where cursor lands at beginning of value
                        target[0].value = target[0].value;
                    },100);
                }
                scope.$on('focus', function (e, id) {
                    if (id === attrs.id) {
                        $timeout(function () { target[0].focus(); },100);
                    }
                });
            }
        };
    }

})();