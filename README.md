<div align="center">
  <img src=".github/logo.png" alt="DELPH Logo">
</div>

<div align="center">
  <h1>Project Overview</h1>
</div>

DELPH - is a self-awareness platform. The main idea is to provide a realtime military event tracking activity across multiple theaters of operation. The platform integrates data from various sources to create a comprehensive situational awareness environment for military personnel and decision makers.

<div align="center">
  <div style="display: inline-block; padding: 10px 20px; background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; margin: 20px 0;">
    <p style="margin: 0; font-size: 16px;">🌐 The website is currently available at <a href="https://delph.live" target="_blank">delph.live</a></p>
  </div>
</div>

<h1 align="center">⚙️ Built with ⚙️</h1>

<div align="center">
  <table border="0" cellspacing="0" cellpadding="0" style="border: none; border-collapse: separate; border-spacing: 10px 10px;">
    <tr>
      <td align="center" width="20%" style="padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Apache_Kafka_logo.svg/120px-Apache_Kafka_logo.svg.png" alt="Kafka" width="50" height="50" />
        <br />
        <b>Kafka</b>
      </td>
      <td align="center" width="20%" style="padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg" alt="PostgreSQL" width="50" height="50" />
        <br />
        <b>PostgreSQL</b>
      </td>
      <td align="center" width="20%" style="padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c5/Nginx_logo.svg" alt="Nginx" width="90" />
        <br />
        <b>Nginx</b>
      </td>
      <td align="center" width="20%" style="padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
        <img src="https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png" alt="Docker" width="60" />
        <br />
        <b>Docker</b>
      </td>
    </tr>
    <tr>
      <td align="center" width="20%" style="padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
        <img src="https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png" alt="FastAPI" width="90" />
        <br />
        <b>FastAPI</b>
      </td>
      <td align="center" width="20%" style="padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
        <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/MongoDB_Logo.svg" alt="MongoDB" width="100" />
        <br />
        <b>MongoDB</b>
      </td>
      <td align="center" width="20%" style="padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Redis_logo.svg/440px-Redis_logo.svg.png" alt="Redis" width="90" />
        <br />
        <b>Redis</b>
      </td>
      <td align="center" width="20%" style="padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React" width="55" />
        <br />
        <b>React</b>
      </td>
    </tr>
  </table>
</div>

# Project Structure

DELPH operates as a distributed system with several interconnected components that work together to provide real-time military event tracking. Below is an overview of the system architecture and data flow:

## Architecture Overview

The system follows a microservices architecture with the following main components:

### Data Flow Pipeline
<div align="center">
  <img src=".github/structure.jpg" alt="Data Flow Pipeline">
</div>

1. **Data Extraction Layer**:
   - Multiple data sources are integrated through specialized adapters
   - Adapters transform source-specific data into a standardized format
   - Data is then published to Kafka for distribution

2. **Core Services**:
   - **Bridge Service**: Handles real-time event streaming via WebSockets
   - **Historical Data Service**: Stores and retrieves past events
   - **Core Service**: Manages authentication, user sessions, and access control

3. **Storage Layer**:
   - **PostgreSQL (CoreDB)**: Stores user data and system configuration
   - **Redis (SessionDB)**: Manages active sessions and temporary data
   - **Kafka (Pub/Sub)**: Facilitates real-time message streaming
   - **MongoDB (EventDB)**: Archives historical event data for querying

4. **Delivery Layer**:
   - **API Gateway (Nginx)**: Routes requests to appropriate services
   - **Frontend**: React-based user interface displaying event data

## Event Processing Flow

1. Events are generated from various sources (e.g., mock producers, external systems)
2. Events flow through adapters that normalize the data
3. Standardized events are published to Kafka topics
4. The Bridge service consumes events and:
   - Forwards real-time updates to connected clients via WebSockets
   - Stores events to MongoDB for historical record
5. Clients receive updates through WebSocket connections
6. Historical data can be queried via REST APIs from the Historical Data Service

## Military Entity Representation

The system uses standardized military symbology based on APP-6B specifications to represent various entities:
- Ground units (infantry, armored, artillery, etc.)
- Air assets (fixed wing, rotary wing, drones)
- Naval vessels
- Special operations forces
- Equipment and installations

### NATO APP-6B Military Symbology
| Dimension | Friendly | Hostile | Neutral | Unknown |
|-----------|---------|---------|---------|---------|
| Air and space | ![Friendly Air](https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/FRD_AIR.svg/250px-FRD_AIR.svg.png) | ![Hostile Air](https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/HOS_AIR.svg/250px-HOS_AIR.svg.png) | ![Neutral Air](https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/NEU_AIR.svg/250px-NEU_AIR.svg.png) | ![Unknown Air](https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/UNK_AIR.svg/250px-UNK_AIR.svg.png) |
| Ground | ![Friendly Ground](https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/FRD_GND.svg/250px-FRD_GND.svg.png) | ![Hostile Ground](https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/HOS_GND%2BEQP%2BSRF.svg/250px-HOS_GND%2BEQP%2BSRF.svg.png) | ![Neutral Ground](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/NEU_GND%2BEQP%2BSRF.svg/250px-NEU_GND%2BEQP%2BSRF.svg.png) | ![Unknown Ground](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/UNK_GND%2BEQP%2BSRF.svg/250px-UNK_GND%2BEQP%2BSRF.svg.png) |
| Sea surface | ![Friendly Sea](https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/FRD_EQP%2BSRF.svg/250px-FRD_EQP%2BSRF.svg.png) | ![Hostile Sea](https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/HOS_GND%2BEQP%2BSRF.svg/250px-HOS_GND%2BEQP%2BSRF.svg.png) | ![Neutral Sea](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/NEU_GND%2BEQP%2BSRF.svg/250px-NEU_GND%2BEQP%2BSRF.svg.png) | ![Unknown Sea](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/UNK_GND%2BEQP%2BSRF.svg/250px-UNK_GND%2BEQP%2BSRF.svg.png) |
| Subsurface | ![Friendly Subsurface](https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/FRD_SUB.svg/250px-FRD_SUB.svg.png) | ![Hostile Subsurface](https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/HOS_SUB.svg/250px-HOS_SUB.svg.png) | ![Neutral Subsurface](https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/NEU_SUB.svg/250px-NEU_SUB.svg.png) | ![Unknown Subsurface](https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/UNK_SUB.svg/250px-UNK_SUB.svg.png) |

## Application Screenshots

### Historical Data View with Time Filtering
<div align="center">
  <img src=".github/filter.png" alt="Historical Data View" width="100%" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
  <p>The historical view allows filtering events by time period and entity types, showing past military activities across the map</p>
</div>

### User Profile Interface
<div align="center">
  <img src=".github/profile.png" alt="User Profile Interface" width="100%" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
  <p>Secure user authentication system with profile management capabilities and role-based access control</p>
</div>

### Real-time Operational Map
<div align="center">
  <img src=".github/example.png" alt="Real-time Operational Map" width="100%" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
  <p>Live visualization of military entities using NATO APP-6B symbology
  </p>
</div>

### Dashboard Overview
<div align="center">
  <img src=".github/dashboard.png" alt="Dashboard Overview" width="100%" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
  <p>Command dashboard providing at-a-glance status of current operations, event statistics, and recent activity feeds</p>
</div>

## Our Team

<div align="center">
  <table border="0" cellspacing="0" cellpadding="0" style="border: none; border-collapse: separate; border-spacing: 15px 15px; margin-bottom: 20px;">
    <tr>
      <td align="center" width="25%" style="padding: 15px; background-color: #f8f9fa; border-radius: 10px;">
        <a href="https://github.com/draklowell" target="_blank">
          <img src="https://github.com/draklowell.png" alt="@draklowell" width="100" height="100" style="border-radius: 50%;" />
          <br />
          <b>@draklowell</b>
        </a>
        <p>Bridge Service Lead</p>
        <p style="font-size: 0.9em;">Real-time data streaming implementation and WebSocket communication</p>
      </td>
      <td align="center" width="25%" style="padding: 15px; background-color: #f8f9fa; border-radius: 10px;">
        <a href="https://github.com/ke1rro" target="_blank">
          <img src="https://github.com/ke1rro.png" alt="@ke1rro" width="100" height="100" style="border-radius: 50%;" />
          <br />
          <b>@ke1rro</b>
        </a>
        <p>API & Frontend Lead</p>
        <p style="font-size: 0.9em;">REST API development and React-based user interface implementation</p>
      </td>
    </tr>
    <tr>
      <td align="center" width="25%" style="padding: 15px; background-color: #f8f9fa; border-radius: 10px;">
        <a href="https://github.com/Luzefik" target="_blank">
          <img src="https://github.com/Luzefik.png" alt="@Luzefik" width="100" height="100" style="border-radius: 50%;" />
          <br />
          <b>@Luzefik</b>
        </a>
        <p>Historical Data Service</p>
        <p style="font-size: 0.9em;">Event archiving and historical query system development</p>
      </td>
      <td align="center" width="25%" style="padding: 15px; background-color: #f8f9fa; border-radius: 10px;">
        <a href="https://github.com/yagodanr" target="_blank">
          <img src="https://github.com/yagodanr.png" alt="@yagodanr" width="100" height="100" style="border-radius: 50%;" />
          <br />
          <b>@yagodanr</b>
        </a>
        <p>Historical Data Service</p>
        <p style="font-size: 0.9em;">Database optimization and filtering system implementation</p>
      </td>
    </tr>
  </table>
</div>

## References & Inspiration

<div style="padding: 20px; background-color:rgb(0, 0, 0); border-radius: 10px; margin-bottom: 30px;">
  <p><strong>Delta Platform</strong> is a situational awareness and battlefield management system developed by the Ukrainian military services. Our project draws inspiration from this system's approach to real-time military event tracking and visualization using standardized NATO symbology.</p>

  <p>The original Delta platform enables Ukrainian forces to maintain comprehensive battlefield awareness through multi-source data integration and collaborative information sharing. It has proven highly effective in modern military operations by providing commanders with accurate, real-time intelligence.</p>

  <div align="center">
    <a href="https://delta.mil.gov.ua/" target="_blank" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background-color: #5073d5; color: white; text-decoration: none; border-radius: 30px; font-weight: bold;">Official Delta Website</a>
  </div>

  <p style="font-size: 0.9em; margin-top: 20px;">References:</p>
  <ol style="font-size: 0.9em;">
    <li>Ministry of Defense of Ukraine, "Delta Situational Awareness System", <a href="https://delta.mil.gov.ua/" target="_blank">https://delta.mil.gov.ua/</a>, accessed 2023.</li>
    <li>NATO, "APP-6 Military Symbols for Land Based Systems", NATO Standardization Agency, 2019.</li>
  </ol>
</div>
