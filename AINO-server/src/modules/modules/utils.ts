import { SimpleModuleService } from "./simple-service"
import { DirectoryService } from "../directories/service";
import { CardsConfig } from '../../lib/cards-config'
import { EducationMainCard } from "../../lib/cards-config/education/main";
import { DirectoryDefsService } from "../directory-defs/service"
import { FieldDefsService } from '../field-defs/service'

const dirService = new DirectoryService()
const moduleService = new SimpleModuleService()
const defService = new DirectoryDefsService();
const fieldService = new FieldDefsService();

export const initBaseField = async (config: any[], defId: string) => {
    for (let i = 0; i < config.length; i++) {
        try {
            const current = config[i];
            if (current.type === 'meta_items') {
                const subfields = [];
                current.child?.forEach(item => {
                    subfields.push({
                        id: crypto.randomUUID(),
                        type: item.type,
                        label: item.label,
                    })
                })
                const params = {
                    directoryId: defId,
                    key: crypto.randomUUID(),
                    kind: "primitive",
                    required: false,
                    schema: {
                        description: "",
                        label: current.label,
                        metaItemsConfig: {
                            aggregationMode: "avg",
                            allowAddInForm: true,
                            defaultItemLabels: [],
                            fields: subfields,
                            showHelp: false,
                            helpText: "",
                        },
                        placeholder: "",
                        showInDetail: true,
                        showInForm: true,
                        showInList: true,
                    },
                    type: current.type,
                }
                await fieldService.createFieldDef(params)
            } else {
                const params = {
                    directoryId: defId,
                    key: crypto.randomUUID(),
                    kind: "primitive",
                    required: false,
                    schema: {
                        description: "",
                        label: current.label,
                        placeholder: "",
                        showInDetail: true,
                        showInForm: true,
                        showInList: true,
                    },
                    type: current.type,
                }
                await fieldService.createFieldDef(params)
            }
        } catch (e) {
            console.log(e)
            throw new Error(e);
        }
    }
}

export const initModule = async (applicationId: string, data: any, moduleId: string, userId: string) => {
    const mainCardConfig = CardsConfig[data.installConfig.moduleKey]
    const subCardConfig = CardsConfig[data.installConfig.moduleKey + "Sub"]
    const dirCreateData = {
        config: {
            moduleKey: data.installConfig.moduleKey,
        },
        name: data.installConfig.defaultTableName,
        order: 0,
        supportsCategory: false,
        type: "table",
    }
    // 目录
    const dirResult = await dirService.create(dirCreateData, applicationId, moduleId, userId);
    // 表定义
    const defResult = await defService.getOrCreateDirectoryDefByDirectoryId(dirResult.id, applicationId)
    const currentCardConfig = CardsConfig[data.installConfig.moduleKey]
    await initBaseField(currentCardConfig, defResult.id)

    if (subCardConfig && subCardConfig.length) {
        const subModuleKey = `${data.installConfig.moduleKey}Sub`;
        for (let i = 0; i < subCardConfig.length; i++) {
            const current = subCardConfig[i]
            const dirCreateData = {
                config: {
                    moduleKey: subModuleKey,
                },
                name: `${data.installConfig.name}_${current.displayName}`,
                order: 0,
                supportsCategory: false,
                type: "table",
            }
            // 目录
            const dirResult = await dirService.create(dirCreateData, applicationId, moduleId, userId);
            // 表定义
            const defResult = await defService.getOrCreateDirectoryDefByDirectoryId(dirResult.id, applicationId)
            await initBaseField(current.dataConfig, defResult.id)
        }
    }
}