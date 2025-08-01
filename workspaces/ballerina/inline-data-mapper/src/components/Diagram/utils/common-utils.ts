/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { PortModel } from "@projectstorm/react-diagrams-core";

import { InputOutputPortModel, ValueType } from "../Port";
import { getDMTypeDim, getTypeName } from "./type-utils";
import { DataMapperLinkModel, MappingType } from "../Link";

import { IOType, Mapping, TypeKind } from "@wso2/ballerina-core";
import { DataMapperNodeModel } from "../Node/commons/DataMapperNode";
import { ErrorNodeKind } from "../../../components/DataMapper/Error/RenderingError";
import {
    ARRAY_OUTPUT_NODE_TYPE,
    EmptyInputsNode,
    INPUT_NODE_TYPE,
    InputNode,
    OBJECT_OUTPUT_NODE_TYPE,
    PRIMITIVE_OUTPUT_NODE_TYPE,
    PrimitiveOutputNode
} from "../Node";
import { IDataMapperContext } from "../../../utils/DataMapperContext/DataMapperContext";
import { View } from "../../../components/DataMapper/Views/DataMapperView";
import { useDMExpandedFieldsStore } from "../../../store/store";

export function findMappingByOutput(mappings: Mapping[], outputId: string): Mapping {
    return mappings.find(mapping => (mapping.output === outputId || mapping.output.replaceAll("\"", "") === outputId));
}

export function isPendingMappingRequired(mappingType: MappingType): boolean {
    return mappingType === MappingType.Incompatible;
}

export function getMappingType(sourcePort: PortModel, targetPort: PortModel): MappingType {

    if (sourcePort instanceof InputOutputPortModel
        && targetPort instanceof InputOutputPortModel
        && targetPort.attributes.field && sourcePort.attributes.field) {

        const sourceField = sourcePort.attributes.field;
        const targetField = targetPort.attributes.field;

        if (targetPort.getParent() instanceof PrimitiveOutputNode) return MappingType.ArrayToSingletonWithCollect;
            
        const sourceDim = getDMTypeDim(sourceField);
        const targetDim = getDMTypeDim(targetField);

        if (sourceDim > 0) {
            const dimDelta = sourceDim - targetDim;
            if (dimDelta == 0) return MappingType.ArrayToArray;
            if (dimDelta > 0) return MappingType.ArrayToSingleton;
        }

        if ((sourceField.kind !== targetField.kind)
            || (sourceField.typeName !== targetField.typeName)
            || sourceField.typeName === "record") {
            return MappingType.Incompatible;
        }

    }

    return MappingType.Default;
}

export function getValueType(lm: DataMapperLinkModel): ValueType {
    const { attributes: { field, value } } = lm.getTargetPort() as InputOutputPortModel;

    if (value !== undefined) {
        return isDefaultValue(field, value.expression) ? ValueType.Default : ValueType.NonEmpty;
    }

    return ValueType.Empty;
}

export function genArrayElementAccessSuffix(sourcePort: PortModel, targetPort: PortModel) {
    if (sourcePort instanceof InputOutputPortModel && targetPort instanceof InputOutputPortModel) {
        let suffix = '';
        const sourceDim = getDMTypeDim(sourcePort.attributes.field);
        const targetDim = getDMTypeDim(targetPort.attributes.field);
        const dimDelta = sourceDim - targetDim;
        for (let i = 0; i < dimDelta; i++) {
            suffix += '[0]';
        }
        return suffix;
    }
    return '';
};

export function isDefaultValue(field: IOType, value: string): boolean {
	const defaultValue = getDefaultValue(field?.kind);
    const targetValue =  value?.trim().replace(/(\r\n|\n|\r|\s)/g, "")
	return targetValue === "null" ||  defaultValue === targetValue;
}

export function getDefaultValue(typeKind: TypeKind): string {
	let draftParameter = "";
	switch (typeKind) {
		case TypeKind.String:
			draftParameter = `""`;
			break;
		case TypeKind.Int:
			draftParameter = `0`;
			break;
        case TypeKind.Float:
            draftParameter = `0.0`;
            break;
        case TypeKind.Decimal:
            draftParameter = `0.0d`;
            break;
		case TypeKind.Boolean:
			draftParameter = `true`;
			break;
		case TypeKind.Array:
			draftParameter = `[]`;
			break;
		default:
			draftParameter = `{}`;
			break;
	}
	return draftParameter;
}

export function fieldFQNFromPortName(portName: string): string {
    return portName.split('.').slice(1).join('.');
}

export function getSanitizedId(id: string): string {
    if (id.endsWith('>')) {
         return id.split('.').slice(0, -1).join('.');
    }
    return id;
}

export function getErrorKind(node: DataMapperNodeModel): ErrorNodeKind {
	const nodeType = node.getType();
	switch (nodeType) {
		case OBJECT_OUTPUT_NODE_TYPE:
		case ARRAY_OUTPUT_NODE_TYPE:
        case PRIMITIVE_OUTPUT_NODE_TYPE:
			return ErrorNodeKind.Output;
		case INPUT_NODE_TYPE:
			return ErrorNodeKind.Input;
		default:
			return ErrorNodeKind.Other;
	}
}

export function expandArrayFn(context: IDataMapperContext, sourceField: string, targetField: string){

    const { addView } = context;

    const newView: View = {
        label: targetField,
        sourceField,
        targetField
    };

    addView(newView);
}

export function genVariableName(originalName: string, existingNames: string[]): string {
	let modifiedName: string = originalName;
	let index = 0;
	while (existingNames.includes(modifiedName)) {
		index++;
		modifiedName = originalName + index;
	}
	return modifiedName;
}

export function getSubMappingViewLabel(subMappingName: string, subMappingType: IOType): string {
    let label = subMappingName;
    if (subMappingType.kind === TypeKind.Array) {
        const typeName = getTypeName(subMappingType);
        const bracketsCount = (typeName.match(/\[\]/g) || []).length; // Count the number of pairs of brackets
        label = label + `${"[]".repeat(bracketsCount)}`;
    }

    return label;
}

export function excludeEmptyInputNodes(nodes: DataMapperNodeModel[]): DataMapperNodeModel[] {
    const filtered = nodes.filter(node =>
        !(node instanceof InputNode) ||
        node instanceof InputNode && node.getSearchFilteredType() !== undefined
    );
    const hasInputNode = filtered.some(node => node instanceof InputNode || node instanceof EmptyInputsNode);
    if (!hasInputNode) {
        const inputNode = new InputNode(undefined, undefined, true);
        filtered.unshift(inputNode);
    }
    return filtered;
}

export function handleExpand(id: string, expanded: boolean) {
	const expandedFields = useDMExpandedFieldsStore.getState().fields;
	if (expanded) {
		useDMExpandedFieldsStore.getState().setFields(expandedFields.filter((element) => element !== id));
	} else {
		useDMExpandedFieldsStore.getState().setFields([...expandedFields, id]);
	}
}
