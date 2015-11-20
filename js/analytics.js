/**
 * Created by Jesion on 2015-01-10.
 */
var analytics = angular.module('analytics', ['app']);

analytics.controller('analyticsController', ['$scope', '$cookieStore', '$http', 'Base64', function ($scope, $cookieStore, $http, Base64) {
    $scope.wallets = $cookieStore.get('wallets');
    $scope.wallet = $cookieStore.get('wallet');
    $scope.env =  $cookieStore.get('env');
    $scope.ssl = $cookieStore.get('ssl');
    $scope.open = function (wallet) {
        $cookieStore.put('wallet', wallet);
        window.location.href = 'analytics.html';
    };
    $scope.runChart1 = function() {
        $.getJSON('http://www.highcharts.com/samples/data/jsonp.php?filename=new-intraday.json&callback=?', function (data) {
            $('#chart1').highcharts('StockChart', {
                title: {
                    text: 'QR Codes by minute'
                },
                xAxis: {
                    gapGridLineWidth: 0
                },
                rangeSelector : {
                    buttons : [{
                        type : 'hour',
                        count : 1,
                        text : '1h'
                    }, {
                        type : 'day',
                        count : 1,
                        text : '1D'
                    }, {
                        type : 'all',
                        count : 1,
                        text : 'All'
                    }],
                    selected : 1,
                    inputEnabled : false
                },
                series : [{
                    name : 'QR Codes',
                    type: 'area',
                    data : data,
                    gapSize: 5,
                    tooltip: {
                        valueDecimals: 2
                    },
                    fillColor : {
                        linearGradient : {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops : [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    threshold: null
                }],
                plotOptions: {
                    series: {
                        animation: false
                    }
                }
            });
        });
    };
    $scope.runChart2 = function () {
        $('#chart2').highcharts({
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false
            },
            title: {
                text: 'QR code rendering shares by account'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            colors: ['#709BBE', '#5E5E5E'],
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true,
                    animation: false
                }
            },
            series: [{
                type: 'pie',
                name: 'QR code share',
                data: [
                    ['Default Account',   45.0],
                    {
                        name: 'Gold 4 Coins',
                        y: 55.0,
                        sliced: true,
                        selected: true
                    }
                ]
            }]
        });
    };
    $scope.runChart3 = function () {
        $('#chart3').highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: 'QR codes count by account'
            },
            colors: ['#709BBE', '#5E5E5E'],
            xAxis: {
                categories: [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec'
                ]
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'QR codes'
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            plotOptions: {
                column: {
                    pointPadding: 0.0,
                    borderWidth: 0,
                    animation: false
                }
            },
            series: [{
                name: 'Default Account',
                data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]

            }, {
                name: 'Gold 4 Coins',
                data: [83.6, 78.8, 98.5, 93.4, 106.0, 84.5, 105.0, 104.3, 91.2, 83.5, 106.6, 92.3]

            }]
        });
    };
    angular.element(document).ready(function () {
        $scope.runChart1();
        $scope.runChart2();
        $scope.runChart3();
    });
}]);