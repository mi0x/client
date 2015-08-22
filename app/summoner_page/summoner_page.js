'use strict';

angular.module('leagueApp.summoner_page', ['ngRoute', 'ui.bootstrap', 'isteven-multi-select'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/summoner', {
            templateUrl: 'summoner_page/summoner_page.html',
            controller: 'SummonerPageCtrl',
            controllerAs: 'summoner'
        });
    }])
    .controller('SummonerPageCtrl', summonerController);

summonerController.$inject = ['$scope', 'SummonerInfoService', 'StateService', 'ChampionInfoService'];

function summonerController($scope, summonerInfoService, stateService, championInfoService) {
    var summoner = this;

    summoner.regions = {
        'euw': 'EUW',
        'na': 'NA',
        'kr': 'KR',
        'br': 'BR',
        'eune': 'EUNE',
        'las': 'LAS',
        'lan': 'LAN',
        'oce': 'OCE',
        'rus': 'RUS',
        'tr': 'TR'
    };

    summoner.queueTypes = [
        {
            key: '',                name: 'All ranked queues',  ticked: true
        }, {
            key: 'RANKED_SOLO_5x5', name: 'Ranked 5v5 (solo)',  ticked: false
        }, {
            key: 'RANKED_TEAM_5x5', name: 'Ranked 5v5 (team)',  ticked: false
        }, {
            key: 'RANKED_TEAM_3x3', name: 'Ranked 3v3 (team)',  ticked: false
        }
    ];

    summoner.champions = [];

    summoner.championSelectLabels = {
        selectAll       : "Tick all",
        selectNone      : "Remove filter",
        reset           : "Undo all",
        search          : "Search...",
        nothingSelected : "All champions"
    };

    summoner.retrievePageData = function () {
        delete summoner.summonerError;
        var activeRegion = summoner.region;
        var summonerName = summoner.usernameInput;

        getSummonerInfo(activeRegion, summonerName);
    };

    function getSummonerInfo(region, summonerName) {
        console.debug('Gonna perform the request for summoner info with the follow params:', summonerName, region);
        var promise = summonerInfoService.summoner(region, summonerName);
        promise.then(function (data) {
            stateService.setActiveSummoner(data.response);

            var queueType = summoner.selectedQueueType[0].key;
            stateService.setActiveQueueType(queueType);

            var champions = summoner.selectedChampions;
            var championList = [];
            angular.forEach(champions, function(champion) {
                championList.push(champion.id);
            });
            stateService.setActiveChampions(championList);

            stateService.setActiveRegion(region);

            $scope.$emit('SummonerSelected');
        }).catch(function (errorResponse) {
            summoner.summonerError = summonerName + ' not found on region ' + region;
            console.error('Error loading summoner info', errorResponse);
        });
    }

    function fillChampionSelect() {
        var champions = championInfoService.champions();
        var championList = [];
        angular.forEach(champions, function (champion) {
            championList.push({
                id: champion.id,
                name: champion.name,
                ticked: false
            });
        });
        championList = championList.sort(function(a, b) {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });
        summoner.champions = summoner.champions.concat(championList);
    }

    summoner.init = function () {
        fillChampionSelect();
    };

    // Default values
    summoner.usernameInput = '';
    summoner.region = 'euw';
    summoner.selectedQueueType = summoner.queueTypes[0];
    summoner.selectedChampions = [];
}