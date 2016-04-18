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
        var gamesResource = $resource('/api/games/:id',{ id: '@id'});
        vm.version = '1.0';
        vm.createGame = _.debounce(createGame,500);
        vm.deleteGame = _.debounce(deleteGame,500);
        // vm.games = gamesResource.get();

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