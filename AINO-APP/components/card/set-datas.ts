import axios from 'axios'
import { CardRegistry } from "./registry"

export const dataInputs = {
    "job-posting": {
        title: "String",
        company: "String",
        location: "String",
        salary: "String",
        experience: "String",
        education: "String",
        tags: "String[]",
    },
    "related-jobs-list": {
        title: "String",
        avgSalary: "String",
        location: "String",
        education: "String",
        experience: "String",
        jobType: "String",
    },
    "job-experience-ratio": {
        title: "String",
        description: "String",
        list: "Array",
    }
}

export const setDatas = async () => {

    const data = localStorage.getItem("APPLICATION_CONFIG")
    const manifest = data ? JSON.parse(data) : {}
    const dataMappings = manifest.config?.clientManifest?.dataMappings || {};

    const promises = [];
    Object.keys(dataMappings).forEach(async key => {
        const [cardType, dsPart] = key.split("::")
        const [type, dirId, recordId] = dsPart.split("_");
        promises.push(new Promise(async (resolve, reject) => {
            const dataMapping = dataMappings[key]
            let realData;
            let resultData;
            if (type === "table") {
                const { data } = await axios.get(`http://localhost:3001/api/records/${dirId}?noAuth=true`);
                realData = data.data;
                resultData = [];
                realData.forEach(item => {
                    const currentRealData = {};
                    Object.keys(dataMapping).forEach(key => {
                        currentRealData[key] = item[dataMapping[key]]
                    })
                    resultData.push(currentRealData)
                })
            } else if (type === 'record') {
                const { data } = await axios.get(`http://localhost:3001/api/records/${dirId}/${recordId}?noAuth=true`)
                realData = data.data
                resultData = {};
                Object.keys(dataMapping).forEach(key => {
                    resultData[key] = realData[dataMapping[key]]
                })
            }
            console.log(cardType, dataMapping, realData)
            CardRegistry.setData(cardType, resultData)
            resolve(true)
        }))
    })

    await Promise.all(promises);

    // CardRegistry.setData("job-posting", {
    //     title: "高级前端工程师",
    //     company: "科技创新公司",
    //     location: "北京·朝阳区",
    //     salary: "20K-35K",
    //     experience: "3-5年",
    //     education: "本科",
    //     tags: ["React", "TypeScript", "Node.js"],
    // });

    // CardRegistry.setData("learning-plan-summary", {});
    // CardRegistry.setData("course-module", {});
    // CardRegistry.setData("learning-outcome", {});
    // CardRegistry.setData("instructor-courses-list", {});
    // CardRegistry.setData("notification-center", {});
    // CardRegistry.setData("search-widget", {});
    // CardRegistry.setData("article-editor", {});
    // CardRegistry.setData("content-library", {});
    // CardRegistry.setData("media-editor", {});
    // CardRegistry.setData("image-gallery", {});
    // CardRegistry.setData("video-player", {});
    // CardRegistry.setData("analytics-dashboard", {});
    // CardRegistry.setData("report-generator", {});
    // CardRegistry.setData("user-profile", {});
    // CardRegistry.setData("chat-widget", {});
    // CardRegistry.setData("product-showcase", {});
    // CardRegistry.setData("shopping-cart", {});
    // CardRegistry.setData("job-experience-ratio", {});
    // CardRegistry.setData("job-prospect-trend", {});
    // CardRegistry.setData("monthly-job-growth", {});
    // CardRegistry.setData("related-jobs-list", {});
    // CardRegistry.setData("inventory-management", {});
    // CardRegistry.setData("pos-terminal", {});
    // CardRegistry.setData("trip-planner", {});
    // CardRegistry.setData("hotel-booking", {});
    // CardRegistry.setData("experience-card", {});
    // CardRegistry.setData("simple-pie", {});
    // CardRegistry.setData("simple-pie-2", {});
    // CardRegistry.setData("mobile-navigation", {});
    // CardRegistry.setData("pc-toolbar", {});
    // CardRegistry.setData("universal-info", {});
}