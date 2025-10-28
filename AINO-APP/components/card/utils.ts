export const isType = (obj) => {
    return Object.prototype.toString.call(obj).split(' ')[1].split(']')[0]
}

export const findItemCardDataByTitle = (items: any[], title: string) => {
    if (title) {
        const currentItem = items.find(item => item.title === title)
        if (currentItem) {
            return currentItem;
        } else {
            return items[0];
        }
    }
    return items[0];
}