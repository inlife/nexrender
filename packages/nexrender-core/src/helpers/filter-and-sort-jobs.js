module.exports = (results, types = []) => {
    return results.filter((job) => {
        if (!types.length) {
            return true
        }

        const matchedType = types.find(config => {
            if (config.type !== job.type) {
                return false;
            }
            const filterPolicy = config.filterPolicy;

            if (!filterPolicy) {
                return true
            }

            return Object.entries(filterPolicy).every(([filterKey, filterValue]) => {
                const jobAttributes = job?.ct?.attributes
                if (!jobAttributes) {
                    return false
                }

                const jobAttributeValue = jobAttributes[filterKey]

                // check primitive value types (string/numbers/values)
                if (jobAttributeValue === filterValue) {
                    return true
                }

                if (Array.isArray(filterValue) && Array.isArray(jobAttributeValue)) {
                    return filterValue.some(value => jobAttributeValue.includes(value))
                }

                if (Array.isArray(filterValue)) {
                    return filterValue.some(value => value === jobAttributeValue)

                }
                if (Array.isArray(jobAttributeValue)) {
                    return jobAttributeValue.includes(filterValue)
                }
            })
        });

        return Boolean(matchedType);
    }).sort((a, b) => {
        return new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime() ? 1 : -1
    })
}
