'use strict';

module.exports = (data, id) => {
    let object = {
        data: data || {},
        headers: { "Content-Type": "application/json" }
    };

    if (id) {
        object.path = { "id": id };
    }

    return object;
};