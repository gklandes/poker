(function () {
    'use strict';

    angular
        .module('poker',['ngResource','ui.router','ui.bootstrap'])
        .config(configHttp)
        .service('UserSession',UserSession)
        .service('GamesResource',GamesResource)
        .controller('AppCtrl', AppCtrl)
        .controller('LoadingCtrl', LoadingCtrl)
        .controller('LoginCtrl', LoginCtrl)
        .controller('ResetCtrl', ResetCtrl)
        .controller('LogoutCtrl', LogoutCtrl)
        .controller('HomeCtrl', HomeCtrl)
        .controller('GameCtrl', GameCtrl)
        .controller('BidCtrl', BidCtrl)
        .directive('pkFocus', pkFocus)
        ;

    configHttp.$inject = ['$httpProvider'];
    function configHttp ($httpProvider){
        $httpProvider.interceptors.push(['$q','$injector', function ($q, $injector) {
            return {
                responseError: function (rejection) {
                    // Intercept server errors and redirect to appropriate app pgs
                    switch (rejection.status) {
                        case 401:
                            $injector.get('$state').transitionTo('login');
                            break;
                        // case 403:
                        //     break;
                        // case 404:
                        //     window.location ='/page404/';
                        //     break;
                        // case 500:
                        //     window.location ='/page500/';
                        //     break;
                        default:
                            break;
                    }
                    return $q.reject(rejection);
                }
            };
        }]);
    }

    UserSession.$inject = ['$rootScope', '$http'];
    function UserSession ($rootScope, $http) {

        var self = this;
        // var session = {
        this.user = null;
        this.loggedIn = false;
        this.loaded = false;
        this.reload = loadSession;

        loadSession();

        return;

        function loadSession () {
            self.loaded = false;
            return $http.get('/session')
                .success(function (data) {
                    console.log('session success', data);
                    self.user = data.user;
                    self.loggedIn = data.loggedIn;
                    self.loaded = true;
                    $rootScope.$broadcast('sessioninit');
                })
                .error( function (error) {
                    console.log('session error', error);
                    self.loaded = true;
                    $rootScope.$broadcast('sessioninit');
                });
        }
    }

    GamesResource.$inject = ['$resource'];
    function GamesResource ($resource) {
        return $resource('/api/games/:id',{ id: '@id' });
    }

    AppCtrl.$inject = ['$scope', '$location', '$timeout', 'UserSession'];
    function AppCtrl ($scope, $location, $timeout, UserSession) {
        var app = this;
        app.version = '1.0';
        app.notification = null;
        app.session = UserSession;

        $scope.$on('notify',setNotification);

        initSession();

        return;

        function initSession () {
            app.destination = $location.url().replace(/^(\/(loading|login))+/,'');
            console.log(app.destination);
            $location.url('/loading' + app.destination);
        }

        function setNotification (e, msg) {
            console.log(msg);
            app.notification = msg;
            $timeout(function () { app.notification = null; }, 3000);
        }
    }

    LoadingCtrl.$inject = ['$scope', '$http', '$location', '$stateParams', 'UserSession'];
    function LoadingCtrl ($scope, $http, $location, $stateParams, UserSession) {
        var destination = $location.url().replace(/^(\/(loading|login))+/,'');
        console.log('UserSession',UserSession);
        
        if (UserSession.loaded) forwardToDestination();
        else $scope.$on('sessioninit', forwardToDestination);

        function forwardToDestination () {
            var publicRoots = ['reset'];
            var destRoot = destination.slice(1).split(/[/?]/)[0];
            if (publicRoots.indexOf(destRoot) >= 0 || UserSession.loggedIn) $location.url(destination);
            else $location.url('/login' + destination);
        }
    }

    LoginCtrl.$inject = ['$scope', '$http', '$location', '$state', '$stateParams'];
    function LoginCtrl ($scope, $http, $location, $state, $stateParams) {
        var vm = this;
        var destination = '/' + $stateParams.path.replace(/^(login\/)+/,'');
        vm.creds = {};
        vm.busy = false;
        vm.mode = null;

        vm.submitForm = submitForm;

        return;

        function submitForm () {
            vm.busy = true;
            if (vm.mode === 'recover') {
                $http.post('/recover',vm.creds)
                    .success(function (success){
                        vm.mode = null;
                        vm.busy = false;
                        $scope.$emit('notify','Your password recovery link has been sent.');
                    })
                    .error(alertError)
                ;
            } else {
                $http.post(vm.mode === 'login' ? '/login' : '/register',vm.creds)
                    .success(function (success) {
                        if (success.authenticated) $location.url(destination);
                        else {
                            vm.mode = null;
                            vm.busy = false;
                            $scope.$emit('notify', success.error);
                        }
                    })
                    .error(alertError)
                ;
            }
        }
        function alertError (error) {
            vm.busy = false;
            $scope.$emit('notify', 'There was a problem processing your info. Try again!');
            console.log(error);
        }
    }

    ResetCtrl.$inject = ['$scope', '$http', '$state', '$location'];
    function ResetCtrl ($scope, $http, $state, $location) {
        console.log($state);
        var vm = this;
        vm.creds = {};

        vm.doReset = doReset;

        initialize();

        return;

        function initialize () {
            vm.creds.key = $location.search().key;
        }

        function doReset () {
            $http.post('/reset',vm.creds)
                .success(function (success) {
                    if (success.reset) {
                        $scope.$emit('notify', 'Your password is reset.');
                        $state.go('login');
                    }
                })
                .error(function alertError (error) {
                    vm.busy = false;
                    $scope.$emit('notify', 'There was a problem processing your info. Try again!');
                    console.log(error);
                })
            ;
        }
        
    }

    LogoutCtrl.$inject = ['$scope', '$http', '$state'];
    function LogoutCtrl ($scope, $http, $state) {
        doLogout();

        function doLogout () {
            $http.get('/logout')
                .success(function () {
                    $state.go('login');
                })
                .error(function () { // error
                    $scope.$emit('notify', 'There was a problem logging out!');
                })
            ;
        }
    }

    HomeCtrl.$inject = ['$scope','$resource', '$timeout', '$state','GamesResource'];
    function HomeCtrl ($scope, $resource, $timeout, $state, GamesResource) {
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
            GamesResource.query({ code: code },
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
            GamesResource.save(vm.newgame,
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
                    GamesResource.delete({id: game._id},
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
            $scope.$emit('notify',error);
        }
    }

    GameCtrl.$inject = ['$scope', '$stateParams', 'GamesResource'];
    function GameCtrl ($scope, $stateParams, GamesResource) {
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
            GamesResource.get({ _id: vm.id },
                function (success) { 
                    vm.game = success;
                },
                alertError
            );
        }
        function alertError (error) {
            $scope.$emit('notify',error.data);
        }
    }

    BidCtrl.$inject = ['$stateParams'];
    function BidCtrl ($stateParams) {
        var vm = this;
        vm.game_id = $stateParams.game_id;
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