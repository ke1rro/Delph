import React from "react";
import { FiX } from "react-icons/fi";
import ms from "milsymbol";
import "../styles/LegendPopup.css";

const LegendPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Generate symbols for each dimension and affiliation
  const generateSymbol = (dimension, affiliation) => {
    let sidc;

    // Map dimensions to their basic SIDC codes
    switch (dimension) {
      case "air":
        sidc = "S@A#------";
        break;
      case "ground":
        sidc = "S@G#------";
        break;
      case "sea":
        sidc = "S@S#------";
        break;
      case "subsurface":
        sidc = "S@U#------";
        break;
      default:
        sidc = "S@G#------";
    }

    // Map affiliations to their codes
    const affiliationCodes = {
      "friendly": "F",
      "hostile": "H",
      "neutral": "N",
      "unknown": "U"
    };

    // Replace the @ placeholder with affiliation code
    sidc = sidc.replace("@", affiliationCodes[affiliation]);

    try {
      const symbol = new ms.Symbol(sidc, { size: 40, fill: true });
      return symbol.asSVG();
    } catch (error) {
      console.error("Error generating symbol:", error);
      return "<svg width='40' height='40'><text x='5' y='20'>Error</text></svg>";
    }
  };

  return (
    <div className="legend-popup-overlay">
      <div className="legend-popup">
        <div className="legend-header">
          <h2>Military Symbol Reference</h2>
          <button className="legend-close-button" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="legend-content">
          <table className="legend-table">
            <thead>
              <tr>
                <th>Dimension</th>
                <th>Friendly</th>
                <th>Hostile</th>
                <th>Neutral</th>
                <th>Unknown</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Air and space</td>
                <td>
                  <div className="symbol-container"
                    dangerouslySetInnerHTML={{ __html: generateSymbol("air", "friendly") }} />
                </td>
                <td>
                  <div className="symbol-container"
                    dangerouslySetInnerHTML={{ __html: generateSymbol("air", "hostile") }} />
                </td>
                <td>
                  <div className="symbol-container"
                    dangerouslySetInnerHTML={{ __html: generateSymbol("air", "neutral") }} />
                </td>
                <td>
                  <div className="symbol-container"
                    dangerouslySetInnerHTML={{ __html: generateSymbol("air", "unknown") }} />
                </td>
              </tr>
              <tr>
                <td>Ground</td>
                <td>
                  <div className="symbol-container"
                    dangerouslySetInnerHTML={{ __html: generateSymbol("ground", "friendly") }} />
                </td>
                <td>
                  <div className="symbol-container"
                    dangerouslySetInnerHTML={{ __html: generateSymbol("ground", "hostile") }} />
                </td>
                <td>
                  <div className="symbol-container"
                    dangerouslySetInnerHTML={{ __html: generateSymbol("ground", "neutral") }} />
                </td>
                <td>
                  <div className="symbol-container"
                    dangerouslySetInnerHTML={{ __html: generateSymbol("ground", "unknown") }} />
                </td>
              </tr>
              <tr>
                <td>Sea surface</td>
                <td>
                  <div className="symbol-container"
                    dangerouslySetInnerHTML={{ __html: generateSymbol("sea", "friendly") }} />
                </td>
                <td>
                  <div className="symbol-container"
                    dangerouslySetInnerHTML={{ __html: generateSymbol("sea", "hostile") }} />
                </td>
                <td>
                  <div className="symbol-container"
                    dangerouslySetInnerHTML={{ __html: generateSymbol("sea", "neutral") }} />
                </td>
                <td>
                  <div className="symbol-container"
                    dangerouslySetInnerHTML={{ __html: generateSymbol("sea", "unknown") }} />
                </td>
              </tr>
              <tr>
                <td>Subsurface</td>
                <td>
                  <div className="symbol-container"
                    dangerouslySetInnerHTML={{ __html: generateSymbol("subsurface", "friendly") }} />
                </td>
                <td>
                  <div className="symbol-container"
                    dangerouslySetInnerHTML={{ __html: generateSymbol("subsurface", "hostile") }} />
                </td>
                <td>
                  <div className="symbol-container"
                    dangerouslySetInnerHTML={{ __html: generateSymbol("subsurface", "neutral") }} />
                </td>
                <td>
                  <div className="symbol-container"
                    dangerouslySetInnerHTML={{ __html: generateSymbol("subsurface", "unknown") }} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="legend-footer">
          <p>Symbols follow military standard symbology</p>
        </div>
      </div>
    </div>
  );
};

export default LegendPopup;
