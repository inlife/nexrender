const arrayIntersec = (array1,array2)=>array1.filter(n => array2.indexOf(n) !== -1)

module.exports = {
    arrayIntersec
}