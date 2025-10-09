import { getRandomHexColor } from "@/lib/utils"
import { http } from "@/lib/request"

export const getInsidePageDatas = async (cardName, currentDir, searchStr) => {
    const { data } = await http.get(`/api/records/${currentDir.id}?searchStr=${searchStr}`)
    return data;
}

export const insidePageArrayCardDatas = {
    "related-jobs-list": true,
}

export const insidePageCardDataHandles = {
    "job-detail-intro": (data) => {
        const newData = {};
        if (data) {
            newData.title = data['标题'];
            newData.description = data['描述'];
            newData.avgMonthlySalary = data['平均月薪'];
            newData.dataSource = data['数据源'];
            if (data['薪资分布'] && data['薪资分布'].length) {
                newData.salaryDistribution = [];
                data['薪资分布'].forEach(item => {
                    const allDatas = {};
                    item.texts.forEach(text => {
                        allDatas[text.label] = text.value;
                    })
                    newData.salaryDistribution.push({
                        name: allDatas['年份'],
                        value: Number(allDatas['占比']),
                        color: getRandomHexColor(),
                    })
                })
            }
            return newData;
        }
        return null;
    },
    "job-salary-overview": (data) => {
        const newData = {};
        if (data) {
            if (data['数据排名趋势图'] && data['数据排名趋势图'].length) {
                newData.rankingData = [];
                data['数据排名趋势图'].forEach(item => {
                    const newItem = {};
                    const allDatas = item.texts.concat(item.numbers.concat(item.images));
                    allDatas.forEach(text => {
                        newItem[text.label] = text.value;
                    })
                    newData.rankingData.push({
                        name: newItem['职位名'],
                        rank: Number(newItem['排名']),
                        color: getRandomHexColor(),
                    })
                });
            }
            if (data['职位类型标签'] && data['职位类型标签'].length) {
                newData.salaryDistribution = [];
                data['职位类型标签'].forEach(item => {
                    const newItem = {};
                    const allDatas = item.texts.concat(item.numbers.concat(item.images));
                    allDatas.forEach(text => {
                        newItem[text.label] = text.value;
                    })
                    newData.salaryDistribution.push({
                        range: newItem['薪资范围'],
                        percentage: Number(newItem['占比']),
                        color: getRandomHexColor(),
                    })
                })
            }
            return newData;
        }
        return null;
    },
    "education-salary-requirements": (data) => {
        const newData = {};
        if (data) {
            newData.title = data['标题'];
            newData.description = data['描述'];
            if (data['数据'] && data['数据'].length) {
                newData.data = [];
                data['数据'].forEach(item => {
                    const allDatas = item.texts.concat(item.numbers.concat(item.images));
                    const newItem = {};
                    allDatas.forEach(text => {
                        newItem[text.label] = text.value;
                    })
                    newData.data.push({
                        label: newItem['标签'],
                        value: newItem['值'],
                        percentage: newItem['占比'],
                        color: getRandomHexColor(),
                    });
                })
            }
            return newData;
        }
        return null;
    },
    "job-experience-ratio": (data) => {
        const newData = {};
        if (data) {
            newData.title = data['标题'];
            newData.description = data['描述'];
            if (data['数据'] && data['数据'].length) {
                newData.data = [];
                data['数据'].forEach(item => {
                    const allDatas = item.texts.concat(item.numbers.concat(item.images));
                    const newItem = {};
                    allDatas.forEach(text => {
                        newItem[text.label] = text.value;
                    })
                    newData.data.push({
                        jobs: newItem['职位数'],
                        name: newItem['工作年限'],
                        value: newItem['占比'],
                        color: getRandomHexColor(),
                    });
                })
            }
            return newData;
        }
        return null;
    },
    "job-city-ranking": (data) => {
        const newData = {};
        if (data) {
            newData.title = data['标题'];
            newData.description = data['描述'];
            if (data['数据'] && data['数据'].length) {
                newData.data = [];
                data['数据'].forEach(item => {
                    const allDatas = item.texts.concat(item.numbers.concat(item.images));
                    const newItem = {};
                    allDatas.forEach(text => {
                        newItem[text.label] = text.value;
                    })
                    newData.data.push({
                        label: newItem['标签'],
                        value: newItem['值'],
                        percentage: newItem['占比'],
                        color: getRandomHexColor(),
                    });
                })
            }
            return newData;
        }
        return null;
    },
    "related-jobs-list": (data) => {
        const newData = [];
        if (data && data.length) {
            data.forEach(item => {
                newData.push({
                    title: item['标题'],
                    avgSalary: item['平均薪资'],
                    location: item['工作地点'],
                    education: item['教育'],
                    experience: item['经验'],
                    jobType: item['职位类型'],
                })
            })
            return newData;
        }
        return null
    },
    "ability-requirements-radar": (data) => {
        const newData = {};
        if (data) {
            newData.title = data['标题'];
            if (data['数据'] && data['数据'].length) {
                newData.chartData = [];
                data['数据'].forEach(item => {
                    const allDatas = item.texts.concat(item.numbers.concat(item.images));
                    const newItem = {};
                    allDatas.forEach(text => {
                        newItem[text.label] = text.value;
                    })
                    newData.chartData.push({
                        subject: newItem['主题'],
                        value: newItem['值'],
                        fullMark: newItem['满分'],
                    });
                })
            }
            return newData;
        }
        return null;
    }
}