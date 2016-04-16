(function () {
    'use strict';
    angular
        .module('poker',['ngResource','ui.router'])
        .constant('CONSTANTS', {
            firebaseUri: 'https://blazing-inferno-4663.firebaseio.com/'
        })
        .controller('appCtrl', appCtrl)
        ;

    appCtrl.$inject = ['$resource', 'CONSTANTS'];
    function appCtrl ($resource, CONSTANTS) {
        var vm = this;
        var gamesResource = $resource(CONSTANTS.firebaseUri + 'games.json');
        vm.version = '1.0';
        vm.createGame = _.debounce(createGame,500);
        // vm.games = gamesResource.get();

        setupSSE();
        getGames();

        return;

        function setupSSE () {
            var es = new EventSource("//localhost:4568/sse");
            es.onmessage = function (event) {
              console.log(event.data);
            };
        }
        function getGames () {
            gamesResource.get({},
                function (success) { 
                    console.log(success);
                    vm.games = success;
                },
                console.warn
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
                console.warn
            );
        }
    }
})();