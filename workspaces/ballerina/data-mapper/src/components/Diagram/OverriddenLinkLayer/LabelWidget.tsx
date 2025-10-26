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
import * as React from 'react';

import styled from '@emotion/styled';
import { DiagramEngine, LabelModel } from '@projectstorm/react-diagrams';
import { ListenerHandle } from '@projectstorm/react-canvas-core';

import { LinkOveryPortal } from './LinkOverlayPortal';

export interface LabelWidgetProps {
	engine: DiagramEngine;
	label: LabelModel;
	index: number;
}

export const Label = styled.div`
	display: inline-block;
	position: absolute;
`;

export const Foreign = styled.foreignObject`
	pointer-events: none;
	overflow: visible;
	&:focus {
		outline: none;
	}
`;


export class OveriddenLabelWidget extends React.Component<LabelWidgetProps> {
	ref: React.RefObject<HTMLDivElement>;
	private animationFrameId: number | null = null;
	private sourceNodeListener?: ListenerHandle;
	private targetNodeListener?: ListenerHandle;

	constructor(props: LabelWidgetProps) {
		super(props);
		this.ref = React.createRef();
	}

	componentDidUpdate() {
		this.schedulePositionUpdate();
	}

	componentDidMount() {
		this.schedulePositionUpdate();
		this.registerNodeListeners();
	}

	componentWillUnmount() {
		if (this.animationFrameId !== null) {
			window.cancelAnimationFrame(this.animationFrameId);
		}
		// Clean up listeners
		if (this.sourceNodeListener) {
			this.sourceNodeListener.deregister();
		}
		if (this.targetNodeListener) {
			this.targetNodeListener.deregister();
		}
	}

	registerNodeListeners = () => {
		const link = this.props.label.getParent();
		if (!link) return;

		const sourcePort = link.getSourcePort();
		const targetPort = link.getTargetPort();
		
		if (sourcePort) {
			const sourceNode = sourcePort.getParent();
			if (sourceNode) {
				this.sourceNodeListener = sourceNode.registerListener({
					positionChanged: () => {
						this.schedulePositionUpdate();
					}
				});
			}
		}
		
		if (targetPort) {
			const targetNode = targetPort.getParent();
			if (targetNode) {
				this.targetNodeListener = targetNode.registerListener({
					positionChanged: () => {
						this.schedulePositionUpdate();
					}
				});
			}
		}
	};

	schedulePositionUpdate = () => {
		if (this.animationFrameId !== null) {
			window.cancelAnimationFrame(this.animationFrameId);
		}
		this.animationFrameId = window.requestAnimationFrame(this.calculateLabelPosition);
	};

	findPathAndRelativePositionToRenderLabel = (index: number): { path: SVGPathElement; position: number } => {
		// an array to hold all path lengths, making sure we hit the DOM only once to fetch this information
		const link = this.props.label.getParent();
		const lengths = link.getRenderedPath().map((path) => path.getTotalLength());

		// calculate the point where we want to display the label
		let labelPosition =
			lengths.reduce((previousValue, currentValue) => previousValue + currentValue, 0) *
			(index / (link.getLabels().length + 1));

		// find the path where the label will be rendered and calculate the relative position
		let pathIndex = 0;
		while (pathIndex < link.getRenderedPath().length) {
			if (labelPosition - lengths[pathIndex] < 0) {
				return {
					path: link.getRenderedPath()[pathIndex],
					position: labelPosition
				};
			}

			// keep searching
			labelPosition -= lengths[pathIndex];
			pathIndex++;
		}
	};

	calculateLabelPosition = () => {
		// Safety check: ensure ref is available
		if (!this.ref.current) {
			return;
		}

		const found = this.findPathAndRelativePositionToRenderLabel(this.props.index + 1);
		if (!found) {
			return;
		}

		const { path, position } = found;

		const labelDimensions = {
			width: this.ref.current.offsetWidth,
			height: this.ref.current.offsetHeight
		};

		const pathCentre = path.getPointAtLength(position);
		const canvas = this.props.engine.getCanvas();
		const model = this.props.engine.getModel();

		// Get canvas boundaries
		const canvasWidth = canvas?.offsetWidth || 0;
		const canvasHeight = canvas?.offsetHeight || 0;

		// Get the model's offset to account for canvas transformations
		const offsetX = model.getOffsetX();
		const offsetY = model.getOffsetY();
		const zoomLevel = model.getZoomLevel() / 100;

		// Calculate initial centered position with canvas offset applied
		let x = pathCentre.x - labelDimensions.width / 2 + this.props.label.getOptions().offsetX + offsetX;
		let y = pathCentre.y - labelDimensions.height / 2 + this.props.label.getOptions().offsetY + offsetY;

		// Check if label is outside visible canvas area
		const isOutOfBounds = 
			x + labelDimensions.width < 0 || // completely off left
			x > canvasWidth || // completely off right
			y + labelDimensions.height < 0 || // completely off top
			y > canvasHeight; // completely off bottom

		// Hide label if out of bounds
		if (isOutOfBounds) {
			this.ref.current.style.visibility = 'hidden';
			this.ref.current.style.transform = `translate(${x}px, ${y}px)`;
			return;
		}

		// Show label if it was hidden
		this.ref.current.style.visibility = 'visible';

		// Apply boundary constraints to keep label fully visible within canvas
		// Ensure label doesn't go off the left edge
		if (x < 0) {
			x = 0;
		}
		// Ensure label doesn't go off the right edge
		if (x + labelDimensions.width > canvasWidth) {
			x = canvasWidth - labelDimensions.width;
		}
		// Ensure label doesn't go off the top edge
		if (y < 0) {
			y = 0;
		}
		// Ensure label doesn't go off the bottom edge
		if (y + labelDimensions.height > canvasHeight) {
			y = canvasHeight - labelDimensions.height;
		}
		
		const labelCoordinates = { x, y };

		this.ref.current.style.transform = `translate(${labelCoordinates.x}px, ${labelCoordinates.y}px)`;
	};

	render() {
		const canvas = this.props.engine.getCanvas();

		return (
			<LinkOveryPortal>
				<Foreign key={this.props.label.getID()} width={canvas?.offsetWidth} height={canvas?.offsetHeight}>
				<Label ref={this.ref}>
					{this.props.engine.getFactoryForLabel(this.props.label).generateReactWidget({ model: this.props.label })}
				</Label>
				</Foreign>
			</LinkOveryPortal>
		);
	}
}
