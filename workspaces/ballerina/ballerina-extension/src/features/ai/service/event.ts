// Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com/) All Rights Reserved.

// WSO2 LLC. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License.
// You may obtain a copy of the License at

// http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied. See the License for the
// specific language governing permissions and limitations
// under the License.

import { ChatNotify, ChatContent, Command } from "@wso2/ballerina-core";
import { sendContentAppendNotification, sendContentReplaceNotification, sendDiagnosticMessageNotification, sendErrorNotification, sendMessagesNotification, sendMessageStartNotification, sendMessageStopNotification, sendTestGenIntermidateStateNotification } from "./utils";

export type CopilotEventHandler = (event: ChatNotify) => void;

// Event listener that handles events and sends notifications
export function createWebviewEventHandler(command: Command): CopilotEventHandler {
    return (event: ChatNotify) => {
        switch (event.type) {
            case 'start':
                sendMessageStartNotification();
                break;
            case 'content_block':
                sendContentAppendNotification(event.content);
                break;
            case 'content_replace':
                sendContentReplaceNotification(event.content);
                break;
            case 'error':
                sendErrorNotification(event.content);
                break;
            case 'stop':
                sendMessageStopNotification(command);
                break;
            case 'intermediary_state':
                sendTestGenIntermidateStateNotification(event.state);
                break;
            case 'messages':
                sendMessagesNotification(event.messages);
                break;
            case 'diagnostics':
                sendDiagnosticMessageNotification(event.diagnostics);
                break;
            default:
                console.warn(`Unhandled event type: ${event}`);
                break;
        }
    };
}
