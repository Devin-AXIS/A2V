import { BaseType } from '../../cards-datetypes'

export const EducationMainCard = {
    id: { type: text, label: "id" },
    name: { type: text, label: "课程名称" },
    duration: { type: text, label: "课程时间" },
    students: { type: number, label: "学习人数" },
    certificate: { type: text, label: "证书" },
    tags: { type: tags, label: "标签" },
}