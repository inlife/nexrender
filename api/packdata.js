'use strict';

module.exports = (data, id) => {
    let object = {
        data: data,
        headers: { "Content-Type": "application/json" }
    };

    return object;
};