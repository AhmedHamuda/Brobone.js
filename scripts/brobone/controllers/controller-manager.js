Brobone.ControllerManager = Brobone.Object.extend({
    initialize: function () {
        this.controllers = {};
    },
    add: function (regController) {
        var controller = this.controllers[regController.name.toLowerCase()] = {
            controller: regController.controller,
            customRoutes: _.result(regController, 'customRoutes', false),
            instance: false
        };
        if (controller.customRoutes) {
            this.trigger("customRouting", controller.customRoutes);
        }
    },
    remove: function (name) {
        var controller = this._getController(name);
        if (!controller) {
            throw Error("no controller with this name: " + name);
            return;
        }
        this._destroyControllerInstance(controller.instance);
        return this.controllers[name];
    },
    _getController: function (name) {
        if (name) name = name.toLowerCase();
        return _.result(this.controllers, name);
    },
    _getCurrentController: function () {
        for (var controller in this.controllers) {
            if (this.controllers[controller].instance !== false) {
                return this.controllers[controller];
            }
        }
        return false;
    },
    _getCustomRoutingController: function (route, args) {
        for (var controller in this.controllers) {
            for (var fragment in this.controllers[controller].customRoutes) {
                if (route.test(fragment)) {
                    var controller = this.controllers[controller];
                    return { controller: controller, action: controller.customRoutes[fragment] };
                }
            }
        }
        return false;
    },
    _destroyControllerInstance: function (controllerInstance) {
        if (controllerInstance) {
            controllerInstance.destroy.call(this);
            return this;
        }
        return false;
    },
    _createControllerInstance: function (controller) {
        controller.instance = new controller.controller({manager: this});
        return controller.instance;
    },
    processRouting: function (route, args, routingIndexes, customRoute) {
        var controller, actionName, controllerName;
        if (customRoute) {
            var result = this._getCustomRoutingController(route, customRoute, args);
            if (result) {
                controller = result.controller;
                actionName = result.action;
            }
        }
        else {
            controllerName = args[routingIndexes.controller].toLowerCase(), actionName = args[routingIndexes.action].toLowerCase();
            args = _.without(args, controllerName, actionName);
            var controller = this._getController(controllerName);
        }
        if (!controller) throw Error("controller not found controller:" + controllerName);
        if (controller.instance) {
            controller.instance.trigger("execute", actionName, args);
        }
        else {
            var currentController = this._getCurrentController();
            currentController && this._destroyControllerInstance(currentController.instance);
            var instance = this._createControllerInstance(controller);
            this._setCurrentController(instance);
            instance.trigger("execute", actionName, args);
        }
    },
    _setCurrentController: function (controller) {
        this.currentController = controller;
    }
});