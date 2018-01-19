'use strict';

// rendeing nodes (keepAlive) [in memory array, autodelete on timer]
let rendernodes = {};
let running     = false;

let ticker = () => {
    // every 1 minute launch clearer for rendernodes
    setInterval(() => {
        for (let rnodeid in rendernodes) {
            
            let rnode = rendernodes[rnodeid];
            
            // calculate diffreence
            let difference = new Date - rnode.updatedAt;
            
            // if it bigger then 6 minutes
            if (difference > 360000) {
                delete rendernodes[rnodeid];
            }
        }
    }, 60000);
};

module.exports = {
    update: function(req) {
        var data = req.body;
        if (!running) {
            running = true;
            ticker();
        }

        // if does not exists - add to array of existings nodes
        if (!rendernodes.hasOwnProperty( data.uid )) {
            rendernodes[data.uid] = data;
        }

        // udpate last udapted time
        rendernodes[data.uid].updatedAt = new Date;
    }
};