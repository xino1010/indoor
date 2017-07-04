app.directive('kpi', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/app/directives/kpi/kpi.directive.html',
        scope: {
            data: '='
        },
        link: function(scope, element, attrs, controllers) {},
    };
});