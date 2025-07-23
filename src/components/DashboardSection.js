import React from 'react';
import TaskList from '../features/tasks/components/TaskList';
import BossDisplay from '../features/bosses/components/BossDisplay';
import TaskInput from '../features/tasks/components/TaskInput';

const DashboardSection = () => {
  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        {/* Main Content Column */}
        <div className="col-md-12 d-flex flex-column">
          <BossDisplay className="w-100" />
          <TaskInput className="w-100" />
          <TaskList className="w-100" />
        </div>
      </div>
    </div>
  );
};

export default DashboardSection;