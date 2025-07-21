let list = [{ name: 1 }, { name: 2 }, { name: 3 }]
let listOne = [{ name: 4 }, { name: 5 }, { name: 6 }]
let newList = [...list, ...listOne]
console.log(newList)