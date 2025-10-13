import { getRandomHexColor } from "@/lib/utils"
import { http } from "@/lib/request"

const colors = ['bg-teal-300', 'bg-teal-400', 'bg-teal-500', 'bg-teal-600']
const getColors = () => {
    return colors[Math.floor(Math.random() * colors.length)];
}

export const getInsidePageDatas = async (key, did, rid, records) => {
    const { data } = await http.get(`/api/records/${did}/${rid}`)
    const parsedData = JSON.parse(data[key]);

    const result = {
        "job-detail-intro": {
            "标题": parsedData.title,
            "描述": parsedData.description,
            "平均月薪": parsedData.salary.average,
            "数据源": "来自全网10份数据",
            "薪资分布": [],
        },
        "job-salary-overview": {
            "标题": parsedData.title,
            "平均月薪": parsedData.salary.average,
            "排名": 1,
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
        "related-jobs-list": [],
        // "ability-requirements-radar": {},
    }

    parsedData.workOpportunities.distribution.forEach(item => {
        result['job-detail-intro']['薪资分布'].push({
            '年份': `${item.years}年`,
            "占比": item.percentage
        })
    })

    // job-salary-overview
    let currentJobSalaryOverview;
    let currentJobSalaryOverviewIndex;
    (records.reverse()).forEach((item, index) => {
        if (item.id === rid) {
            currentJobSalaryOverview = item;
            currentJobSalaryOverviewIndex = index;
        }
    })
    result['job-salary-overview']['排名'] = currentJobSalaryOverviewIndex + 1;
    const currentJobSalaryOverviewKeys = {};
    for (let key in currentJobSalaryOverview) {
        if (currentJobSalaryOverview[key] === parsedData.title) currentJobSalaryOverviewKeys.title = key;
        if (currentJobSalaryOverview[key] === parsedData.salary.average) currentJobSalaryOverviewKeys.salary = key;
    }
    let first, last, middle, firstIndex, lastIndex, middleIndex;
    if (currentJobSalaryOverviewIndex === 0) {
        first = currentJobSalaryOverview;
        firstIndex = 1;
        last = records[records.length - 1];
        lastIndex = records.length;
        middle = records[Math.floor(records.length / 2)]
        middleIndex = Math.floor(records.length / 2);
    } else if (currentJobSalaryOverviewIndex === records.length - 1) {
        first = records[0];
        firstIndex = 1;
        last = currentJobSalaryOverview;
        lastIndex = currentJobSalaryOverviewIndex;
        middle = records[Math.floor(records.length / 2)]
        middleIndex = Math.floor(records.length / 2);
    } else {
        first = records[0];
        firstIndex = 1;
        last = records[records.length - 1];
        lastIndex = records.length;
        middle = currentJobSalaryOverview;
        middleIndex = currentJobSalaryOverviewIndex;
    }

    result['job-salary-overview']['数据排名趋势图'].push({
        "职位名": last[currentJobSalaryOverviewKeys.title],
        "排名": lastIndex,
    })
    result['job-salary-overview']['数据排名趋势图'].push({
        "职位名": middle[currentJobSalaryOverviewKeys.title],
        "排名": middleIndex,
    })
    result['job-salary-overview']['数据排名趋势图'].push({
        "职位名": first[currentJobSalaryOverviewKeys.title],
        "排名": firstIndex,
    })

    const salaryDistribution = calculateSalaryDistribution(parsedData.cityRanking, parsedData.experienceDistribution);
    salaryDistribution.forEach(item => {
        item.color = getColors();
        item['薪资范围'] = item['range']
        item['占比'] = item['percentage']
    })
    result['job-salary-overview']['职位类型标签'].push(...salaryDistribution);


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

    // related-jobs-list
    // result['related-jobs-list']
    console.log(parsedData.similarJobs, 23232323)
    parsedData.similarJobs.forEach((item) => {
        result['related-jobs-list'].push({
            "标题": item.title,
            "平均薪资": item.averageSalary,
            "工作地点": item.location,
            "教育": item.education,
            "经验": item.experience,
            "职位类型": item.title,
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
                    newData.salaryDistribution.push({
                        name: item['年份'],
                        value: Number(item['占比']),
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

/**
 * 根据薪资数据动态计算不同薪资档位的占比
 * @param data 包含avgSalary字段的对象数组
 * @returns 薪资档位占比数组
 */
export const calculateSalaryDistribution = (data: Array<{ avgSalary: number }>) => {
    if (!data || data.length === 0) {
        return [];
    }

    // 提取所有薪资数据并排序
    const salaries = data.map(item => item.avgSalary).sort((a, b) => a - b);
    const minSalary = salaries[0];
    const maxSalary = salaries[salaries.length - 1];

    // 如果所有薪资相同，返回单一档位
    if (minSalary === maxSalary) {
        return [{
            range: `${minSalary}k`,
            percentage: 100
        }];
    }

    // 动态计算三个档位的分界点
    const range1 = minSalary;
    const range2 = minSalary + (maxSalary - minSalary) / 3;
    const range3 = minSalary + (maxSalary - minSalary) * 2 / 3;
    const range4 = maxSalary;

    // 定义动态薪资档位
    const ranges = [
        {
            min: range1,
            max: range2,
            label: `${Math.round(range1 / 1000)}k-${Math.round(range2 / 1000)}k`
        },
        {
            min: range2,
            max: range3,
            label: `${Math.round(range2 / 1000)}k-${Math.round(range3 / 1000)}k`
        },
        {
            min: range3,
            max: range4,
            label: `${Math.round(range3 / 1000)}k-${Math.round(range4 / 1000)}k`
        },
    ];

    // 统计每个档位的数据数量
    const rangeCounts = ranges.map(range => {
        const count = data.filter(item => {
            const salary = item.avgSalary;
            return salary >= range.min && salary < range.max;
        }).length;
        return {
            range: range.label,
            count: count
        };
    });

    // 计算总数量
    const totalCount = data.length;

    // 计算每个档位的占比
    const result = rangeCounts.map(item => ({
        range: item.range,
        percentage: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0
    }));

    return result;
};