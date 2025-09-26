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

export const initBaseField = async (data: any, defId) => {
    const currentCardConfig = CardsConfig[data.moduleKey]
    for (let i = 0; i < currentCardConfig.length; i++) {
        try {
            const current = currentCardConfig[i];
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
            const fieldDef = await fieldService.createFieldDef(params)
        } catch (e) {
            console.log(e)
            throw new Error(e);
        }
    }
}

export const initModule = async (applicationId: string, data: any, moduleId: string, userId: string) => {
    const dirCreateData = {
        config: {
            moduleKey: data.installConfig.moduleKey,
        },
        name: data.installConfig.defaultTableName,
        order: 0,
        supportsCategory: false,
        type: "table",
    }
    const dirResult = await dirService.create(dirCreateData, applicationId, moduleId, userId);
    const defResult = await defService.getOrCreateDirectoryDefByDirectoryId(dirResult.id, applicationId)
    await initBaseField(data, defResult.id)
}