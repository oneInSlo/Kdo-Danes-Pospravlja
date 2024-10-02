# KdoDanesPospravlja.si

**KdoDanesPospravlja.si** is a web application designed to help roommates living in student dormitories or shared apartments organize and distribute household chores efficiently. The application ensures fair task allocation and tracks task completion through an intuitive interface, allowing users to manage responsibilities across shared living spaces.

## Features

- **User Registration & Login**: Users must register and log in to access the app's functionality.
- **Household Management**: Users can create and manage living units, including adding roommates with either full or limited permissions.
- **Living Unit Map View**: Living units are displayed on a map, with a clickable pin that shows the name, location, and an image of the unit.
- **Task Management**: Users can add, edit, and delete tasks. Tasks can be one-time or recurring (daily, weekly, monthly, yearly).
- **Automated Task Rotation**: For recurring tasks, responsibilities can be rotated automatically among the assigned roommates.
- **Task Reminders**: Users responsible for tasks receive email reminders on the scheduled date.
- **Task Status Indicators**: The top border color of each task changes based on the task’s end date to indicate its status.
- **Overview and Sorting**: View and sort tasks for each living unit by different parameters such as date, task type, and room.


## Installation

To set up and run this project locally, follow the steps below:

1. Clone the repository:
   ```bash
   git clone https://github.com/oneInSlo/Kdo-Danes-Pospravlja.git
    ```

2. Navigate to the project directory.

3. Install backend dependencies:

    ```bash
    cd backend
    npm install
    ```

4. Set up the database:
    - Create the database by running the provided SQL script in the `Database` folder.
    - Adjust any database configuration settings if necessary (`knexfile.js`).

5. Run the backend server:

    ```bash
    node server.js
    ```

6. Access the application through `localhost` and start adding users, tasks, and managing your household!


## Technologies Used

- **Frontend**: HTML, CSS, Bootstrap, JavaScript
- **Backend**: Node.js
- **Database**: SQL
- **Map Integration**: [OpenStreetMap](https://www.openstreetmap.org/) (for displaying living units on a map)