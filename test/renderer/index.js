'use strict';


describe('Testing renderer', () => {
    describe('Testing tasks', () => {
        require('./tasks/setup');
        require('./tasks/download');
        require('./tasks/rename');
        require('./tasks/filter');
        // require('./tasks/patch');
        // require('./tasks/render');
        // require('./tasks/verify');
        // require('./tasks/actions');
        // require('./tasks/cleanup');
    });
});
