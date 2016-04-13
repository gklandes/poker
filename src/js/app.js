(function () {
    angular
        .module('poker',['ui.router'])
        .controller('appCtrl', appCtrl)
        ;

    appCtrl.$inject = [];
    function appCtrl () {
        var vm = this;
        vm.version = '1.0';
        vm.createGame = createGame;
        vm.games = [];

        function createGame () {
            console.log('new game');
            var c = vm.games.length + 1;
            vm.games.push('game ' + c);
        }
    }
})();