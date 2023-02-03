module.exports = (results, types = []) => {
    const filterPolicyMap = types.reduce((res, config) => {
        res.set(config.type, config.filterPolicy)
        return res
    }, new Map())

    return results.filter((job) => {
        if (!types.length) {
            return true
        }

        if (filterPolicyMap.has(job.type)) {
            const filterPolicy = filterPolicyMap.get(job.type)

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

        }

        return false
    }).sort((a, b) => {
        return new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime() ? 1 : -1
    })
}
