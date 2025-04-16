import React from "react";
import "../styles/Manual.css"; // Add specific styles for the Manual page

const Manual = () => {
  return (
    <div className="manual-container">
      <section className="manual-section">
        <h1>Manual</h1>
        <p>
          After registration, you will receive a unique ID that you can copy only once. Take it
          through because you can only access the system with this ID.
        </p>
        <img src="login_page_1.png" alt="Login Page Screenshot" />
      </section>

      <section className="manual-section">
        <h2>Registration</h2>
        <p>
          Fill in your personal information to create an account. Provide your first name, last name, and create a password.
        </p>
        <img src="registrarion_page_2.png" alt="Registration Page Screenshot" />
      </section>

      <section className="manual-section">
        <h2>Unique ID</h2>
        <p>
          Upon successful registration, you will receive a unique ID. Make sure to save this ID as you will need it to log in to your account.
        </p>
        <img src="regestration_info_ex_3.png" alt="Registration Info Screenshot" />
      </section>

      <section className="manual-section">
        <h2>Login</h2>
        <p>
          Use your unique ID and password to log in to the system. Ensure you keep your credentials
          secure.
        </p>
        <img src="login_usr_5.png" alt="Login Screenshot" />
      </section>

      <section className="manual-section">
        <h2>Monitor Bar</h2>
        <p>
          The monitor bar provides real-time updates and notifications about the system's status and
          events.
        </p>
        <img src="monitor_main_page_6.png" alt="Monitor Bar Screenshot" />
      </section>

      <section className="manual-section">
        <h2>Map View</h2>
        <p>
          The Map View button will send you to the map. Click the plus to create a new object.
        </p>
        <img src="map_view_7.png" alt="Map View Screenshot" />
      </section>

      <section className="manual-section">
        <h2>Map Sidebar</h2>
        <p>
          Here, you can see the total number of events on the map that are available to you. Among
          them are active (Active Events), destroyed (Destroyed), and neutralized (Disabled).
        </p>
        <img src="map_side_bar_8.png" alt="Map Sidebar Screenshot" />
      </section>

      <section className="manual-section">
        <h2>Detailed Sidebar</h2>
        <p>
          When you select an object, the sidebar will display detailed information about it.
        </p>
        <img src="detailed_sidebar_8.png" alt="Detailed Sidebar Screenshot" />
      </section>

      <section className="manual-section">
        <h2>Pick Location</h2>
        <p>
          You can choose "Pick Location from Map" or enter coordinates manually. We use "Pick
          Location from Map." The button will then change, and the cursor will change to a cross.
          Then you can left-click to place an object. The coordinates will be automatically
          specified.
        </p>
        <img src="picking_loc_on_the_map_9.png" alt="Pick Location Screenshot" />
        <img src="cross_on_the_map_10.png" alt="Cursor Change Screenshot" />
      </section>

      <section className="manual-section">
        <h2>Create an Object</h2>
        <p>
          Once we introduce data on the object according to the NATO classification on the left, we
          will see what our object on the map will look like. We create an object. The object
          appeared on the map.
        </p>
        <img src="obj_preview_11.png" alt="Object Preview Screenshot" />
        <img src="create_pbg_12.png" alt="Create Object Screenshot" />
      </section>

      <section className="manual-section">
        <h2>Edit Object</h2>
        <p>
          By clicking on the object, we will open the object's settings. Then, we can change the
          object parameters. After adjusting the data on the object, click the "Update Event" to
          save the changes.
        </p>
        <img src="click_on_the_obj_12.png" alt="Click on Object Screenshot" />
        <img src="editing_obj_13.png" alt="Editing Object Screenshot" />
      </section>

      <section className="manual-section">
        <h2>Updated Map</h2>
        <p>
          After creating or editing an object, the map will update to reflect the changes.
        </p>
        <img src="main_page_after_new_obj_14.png" alt="Updated Map Screenshot" />
      </section>

      <section className="manual-section">
        <h2>Profile Tab</h2>
        <p>
          By clicking on the "Profile" tab, we will open the user's profile tab, where all the
          necessary information about the user will be displayed.
        </p>
        <img src="profile_15.png" alt="Profile Tab Screenshot" />
      </section>
    </div>
  );
};

export default Manual;