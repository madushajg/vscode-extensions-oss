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

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { Visualizer } from "./Visualizer";
import { VisualizerContextProvider, RpcContextProvider } from "./Context";
import { clearDiagramZoomAndPosition } from "./utils/bi";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
            staleTime: 1000,
            gcTime: 1000,
        },
    },
});

export function renderWebview(mode: string, target: HTMLElement) {
    // clear diagram memory
    clearDiagramZoomAndPosition();

    const root = createRoot(target);
    root.render(
        <VisualizerContextProvider>
            <RpcContextProvider>
                <QueryClientProvider client={queryClient}>
                    <Visualizer mode={mode} />
                </QueryClientProvider>
            </RpcContextProvider>
        </VisualizerContextProvider>
    );
}
