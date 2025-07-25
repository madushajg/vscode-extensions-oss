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
import {
    AddArrayElementRequest,
    ConvertToQueryRequest,
    AddClausesRequest,
    InlineDataMapperModelRequest,
    InlineDataMapperModelResponse,
    InlineDataMapperSourceRequest,
    InlineDataMapperSourceResponse,
    VisualizableFieldsRequest,
    VisualizableFieldsResponse,
    PropertyRequest,
    PropertyResponse,
    InitialIDMSourceResponse,
    InitialIDMSourceRequest,
    GetInlineDataMapperCodedataRequest,
    GetInlineDataMapperCodedataResponse,
    GetSubMappingCodedataRequest,
    InlineAllDataMapperSourceRequest,
    AddSubMappingRequest,
    DeleteMappingRequest,
    MapWithCustomFnRequest
} from "../../interfaces/extended-lang-client";

export interface InlineDataMapperAPI {
    getInitialIDMSource: (params: InitialIDMSourceRequest) => Promise<InitialIDMSourceResponse>;
    getDataMapperModel: (params: InlineDataMapperModelRequest) => Promise<InlineDataMapperModelResponse>;
    getDataMapperSource: (params: InlineDataMapperSourceRequest) => Promise<InlineDataMapperSourceResponse>;
    getVisualizableFields: (params: VisualizableFieldsRequest) => Promise<VisualizableFieldsResponse>;
    addNewArrayElement: (params: AddArrayElementRequest) => Promise<InlineDataMapperSourceResponse>;
    convertToQuery: (params: ConvertToQueryRequest) => Promise<InlineDataMapperSourceResponse>;
    addClauses: (params: AddClausesRequest) => Promise<InlineDataMapperSourceResponse>;
    addSubMapping: (params: AddSubMappingRequest) => Promise<InlineDataMapperSourceResponse>;
    deleteMapping: (params: DeleteMappingRequest) => Promise<InlineDataMapperSourceResponse>;
    mapWithCustomFn: (params: MapWithCustomFnRequest) => Promise<InlineDataMapperSourceResponse>;
    getDataMapperCodedata: (params: GetInlineDataMapperCodedataRequest) => Promise<GetInlineDataMapperCodedataResponse>;
    getSubMappingCodedata: (params: GetSubMappingCodedataRequest) => Promise<GetInlineDataMapperCodedataResponse>;
    getAllDataMapperSource: (params:InlineAllDataMapperSourceRequest) => Promise<InlineDataMapperSourceResponse>;
    getProperty: (params: PropertyRequest) => Promise<PropertyResponse>;
}
