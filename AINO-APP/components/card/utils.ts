export const isType = (obj) => {
    return Object.prototype.toString.call(obj).split(' ')[1].split(']')[0]
}