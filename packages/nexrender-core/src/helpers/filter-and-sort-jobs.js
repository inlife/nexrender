module.exports = (results, types = []) => {
    return results.filter(result => !types.length || types.includes(result.type)).sort((a, b) => {
        return new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime() ? 1 : -1
    })
}
