import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ms from "milsymbol";
import SidcDataService from "../utils/SidcDataService";

const DraggableSVGPreview = ({ sidc, visible = true, onClose }) => {
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [svgContent, setSvgContent] = useState(null);
    const [error, setError] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!sidc) {
            setSvgContent(null);
            setError(null);
            return;
        }

        try {
            console.log("Generating symbol for SIDC:", sidc);
            const symbol = new ms.Symbol(sidc, {
                size: 50,
                fill: true,
                frame: true
            });

            const svgOutput = symbol.asSVG();
            console.log("SVG generated successfully");
            setSvgContent(svgOutput);
            setError(null);
        } catch (error) {
            console.error("Error generating symbol:", error, "SIDC:", sidc);
            setError(`Could not generate symbol: ${error.message}`);
            setSvgContent(null);
        }
    }, [sidc]);

    // Handle mouse down to start dragging
    const handleMouseDown = (e) => {
        if (e.target.closest(".close-button")) return;
        setIsDragging(true);
        const containerRect = containerRef.current.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - containerRect.left,
            y: e.clientY - containerRect.top
        });
    };

    // Handle mouse move during dragging
    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        setPosition({
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y
        });
    };

    // Handle mouse up to stop dragging
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Add and remove event listeners for dragging
    useEffect(() => {
        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        } else {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging]);

    if (!visible) return null;

    return (
        <PreviewContainer
            ref={containerRef}
            onMouseDown={handleMouseDown}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
        >
            <PreviewHeader>
                <span>Symbol Preview</span>
                <CloseButton className="close-button" onClick={onClose}>×</CloseButton>
            </PreviewHeader>
            <PreviewContent>
                {error ? (
                    <ErrorMessage>{error}</ErrorMessage>
                ) : svgContent ? (
                    <div dangerouslySetInnerHTML={{ __html: svgContent }} />
                ) : (
                    <p>Select a valid entity to preview</p>
                )}
            </PreviewContent>
        </PreviewContainer>
    );
};

const PreviewContainer = styled.div`
  position: fixed;
  width: 180px;
  background: rgba(80, 115, 213, 0.7);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 9999;
  user-select: none;
`;

const PreviewHeader = styled.div`
  background: rgba(80, 115, 213, 0.7);
  padding: 8px 12px;
  font-weight: bold;
  font-family: "Inter", sans-serif;
  border-radius: 8px 8px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: white;
  &:hover {
    color: #e0e0e0;
  }
`;

const PreviewContent = styled.div`
  padding: 15px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80px;
  color: white;
`;

const ErrorMessage = styled.div`
  color: #ff9999;
  font-size: 12px;
  text-align: center;
  max-width: 100%;
`;

export default DraggableSVGPreview;
