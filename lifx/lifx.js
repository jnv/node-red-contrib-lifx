module.exports = function(RED) {
    "use strict";
    var lifx = require('lifx');
    var merge = require('merge');

    // The main node definition - most things happen in here
    function LifxNode(n) {
        var lx = lifx.init();
        var node = this;
        this.topic = n.topic;
        // if(!lx) {
        //     lx = lifx.init();
        // }

        // Create a RED node
        RED.nodes.createNode(this, n);

        lifx.setDebug(!!n.debug);
        // Set default values from node configuration
        this.state = {
            on: !!n.on,
            hue: n.hue,
            saturation: n.saturation,
            luminance: n.luminance,
            whiteColor: n.whiteColor,
            fadeTime: n.fadeTime,
        };

        function setPower(state) {
            if(state) {
                node.log("Lights on");
                lx.lightsOn();
            }
            else {
                node.log("Lights off");
                lx.lightsOff();
            }
        }

        function setColor(params) {
            node.log("Setting color: " + JSON.stringify(params));

            lx.lightsColour(
                params.hue,
                params.saturation,
                params.luminance,
                params.whiteColor,
                params.fadeTime
            );
        }


        // send initial values
        setPower(this.state.on);
        setColor(this.state);

        // respond to inputs....
        this.on('input', function (msg) {
            var payload = msg.payload;

            node.log("Received payload: " + JSON.stringify(payload));

            this.state = merge(this.state, payload);

            setPower(this.state.on);
            setColor(this.state);

            var out = {
                topic: this.topic,
                payload: this.state
            };
            this.send(out);
        });

        this.on('close', function() {
            lx.close();
            lx = null;
        });
    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType('lifx', LifxNode);

};
