import { getRandomHexColor } from "@/lib/utils"
import { http } from "@/lib/request"

export const getInsidePageDatas = async (key, did, rid) => {
    const { data } = await http.get(`/api/records/${did}/${rid}`)
    const parsedData = JSON.parse(data[key]);
    console.log(parsedData, 23232323)

    const result = {
        "job-detail-intro": {
            "标题": parsedData.title,
            "描述": parsedData.description,
            "平均月薪": parsedData.salary.average,
            "数据源": "来自全网10份数据",
        },
        "job-salary-overview": {
            "标题": parsedData.title,
            "平均月薪": parsedData.salary.average,
            "排名": Math.floor(Math.random() * 200) + 1,
            "数据排名趋势图": [],
            "职位类型标签": [],
        },
        "education-salary-requirements": {
            "标题": `${parsedData.title}职业学历收入情况`,
            "描述": `${parsedData.title}职业学历收入情况`,
            "数据": [],
        },
        "job-experience-ratio": {
            "标题": `${parsedData.title}不同工作年限的薪资占比`,
            "描述": `工作年限不同，${parsedData.title}的薪资是否相同呢？以下是职位平均薪资与占比数据`,
            "数据": [],
        },
        "job-city-ranking": {
            "标题": `${parsedData.title}工作城市排名`,
            "描述": `${parsedData.title}工作城市排名`,
            "数据": [],
        },
        "related-jobs-list": {},
        // "ability-requirements-radar": {},
    }

    let eduSalCount = 0;
    parsedData.educationDistribution.forEach(item => eduSalCount += item.salary);
    parsedData.educationDistribution.forEach(item => {
        result['education-salary-requirements']['数据'].push({
            "标签": item.education,
            "值": item.salary,
            "占比": Math.floor((item.salary / eduSalCount) * 100),
        })
    })

    let expSalCount = 0;
    parsedData.experienceDistribution.forEach(item => expSalCount += item.salary);
    parsedData.experienceDistribution.forEach(item => {
        result['job-experience-ratio']['数据'].push({
            "工作年限": `${item.years}年`,
            "薪资": item.salary,
            "占比": Math.floor((item.salary / expSalCount) * 100),
        })
    })



    let cityCount = 0;
    parsedData.cityRanking.forEach(item => cityCount += item.avgSalary);
    parsedData.cityRanking.forEach(item => {
        result['job-city-ranking']['数据'].push({
            "标签": item.city,
            "值": item.avgSalary,
            "占比": Math.floor((item.avgSalary / cityCount) * 100),
        })
    })

    return result
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
                    newData.rankingData.push({
                        name: item['职位名'],
                        rank: Number(item['排名']),
                        color: getRandomHexColor(),
                    })
                });
            }
            if (data['职位类型标签'] && data['职位类型标签'].length) {
                newData.salaryDistribution = [];
                data['职位类型标签'].forEach(item => {
                    newData.salaryDistribution.push({
                        range: item['薪资范围'],
                        percentage: Number(item['占比']),
                        color: getRandomHexColor(),
                    })
                })
            }
            newData.title = data['标题'];
            newData.avgSalary = data['平均月薪'];
            newData.ranking = data['排名'];
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
                    newData.data.push({
                        label: item['标签'],
                        value: item['值'],
                        percentage: item['占比'],
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
                    newData.data.push({
                        jobs: item['薪资'],
                        name: item['工作年限'],
                        value: item['占比'],
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
                    newData.data.push({
                        label: item['标签'],
                        value: item['值'],
                        percentage: item['占比'],
                        color: getRandomHexColor(),
                    });
                })
            }
            return newData;
        }
        return null;
    },
    // LOG: todo
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
    // LOG: todo
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