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
                console.log(JSON.parse(event.data));
            };
        }
        function getGames () {
            gamesResource.query({},
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
        function deleteGame (id) {
            gamesResource.delete({id: id},
                function (success) {
                    getGames();
                },
                function (error) {
                    alert(error.data);
                }
            );
        }
    }
})();