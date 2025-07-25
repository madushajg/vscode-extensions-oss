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
// tslint:disable: jsx-no-multiline-js
import React, { useMemo } from 'react';

import { Breadcrumbs, Codicon } from '@wso2/ui-toolkit';
import { css } from '@emotion/css';
import { View } from "../Views/DataMapperView";
import { extractLastPartFromLabel } from './utils';

const useStyles = () => {
    const baseStyle = {
        color: "inherit",
        fontFamily: "var(--vscode-editor-font-family)",
        fontSize: "13px"
    };

    return {
        active: css({
            ...baseStyle,
            cursor: "default"
        }),
        link: css({
            ...baseStyle,
            cursor: "pointer",
            "&:hover": {
                color: "var(--vscode-textLink-activeForeground)"
            }
        })
    };
};

export interface HeaderBreadcrumbProps {
    views: View[];
    switchView: (index: number) => void;
}

export default function HeaderBreadcrumb(props: HeaderBreadcrumbProps) {
    const { views, switchView } = props;
    const classes = useStyles();

    const [activeLink, links] = useMemo(() => {
        if (views) {
            const focusedView = views[views.length - 1];
            const isFocusedOnSubMappingRoot = focusedView?.subMappingInfo?.focusedOnSubMappingRoot;
            const otherViews = views.slice(0, -1);
            let isRootView = views.length === 1;
            let label = extractLastPartFromLabel(focusedView.label);

            const selectedLink = (
                <div className={classes.active}>
                    {isRootView ? label : `${label}:${isFocusedOnSubMappingRoot ? "SubMapping" : "Query"}`}
                </div>
            );

            const restLinks = otherViews.length > 0 && (
                otherViews.map((view, index) => {
                    label = view.label;
                    isRootView = index === 0;
                    return (
                        <a
                            data-index={index}
                            key={index}
                            onClick={handleClick}
                            className={classes.link}
                            data-testid={`dm-header-breadcrumb-${index}`}
                        >
                            {isRootView ? label : `${label}:${view.subMappingInfo ? "SubMapping" : "Query"}`}
                        </a>
                    );
                })
            );

            return [selectedLink, restLinks];
        }
        return [undefined, undefined];
    }, [views]);

    function handleClick(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
        event.preventDefault();
        const index: number = +event.currentTarget.getAttribute('data-index');
        switchView(index);
    }

    return (
        <Breadcrumbs
            maxItems={3}
            separator={<Codicon name="chevron-right" />}
        >
            {links}
            {activeLink}
        </Breadcrumbs>
    );
}
