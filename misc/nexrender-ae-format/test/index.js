// const fs = require('fs')

// function getAllExpressions(data) {
//     return data.match(/bdata=\"([a-f0-9]+)\"\s*\/\>/gi);
// }

// const exprs = getAllExpressions(fs.readFileSync('./test/1layer.aepx').toString('utf8'))


// console.log("hello wolrlsdd \n")

// // then iterate over them
// for (let expr of exprs) {

//     // extract hex from xml tag and decode it
//     let hex = expr.split('"')[1];
//     let dec = new Buffer(hex, 'hex').toString('utf8');

//     console.log(dec)

//     // // do patch and encode back to hex
//     // // using regex file path pattern
//     // let enc = new Buffer( replacePath( dec, replaceToPath ) ).toString('hex');

//     // // replace patched hex
//     // data = data.replace( hex, enc );
// }

// // console.log(exprs)
