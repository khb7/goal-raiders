import React from 'react';
import { Form } from 'react-bootstrap';
import { useBoss } from '../BossContext';

const BossSelector = () => {
  const { bosses, currentBossId, setCurrentBossId } = useBoss();

  return (
    <Form.Group className="mb-0"> {/* Use mb-0 to reduce margin */}
      <Form.Label htmlFor="currentBossSelect" className="me-2 mb-0">Select Current Boss:</Form.Label>
      <Form.Select
        id="currentBossSelect"
        value={currentBossId || ''} // Handle null currentBossId
        onChange={(e) => setCurrentBossId(e.target.value ? parseInt(e.target.value, 10) : null)}
        style={{ width: '200px', display: 'inline-block' }} // Adjust styling as needed
      >
        <option value="">-- Select a Boss --</option>
        {bosses.map(boss => (
          <option key={boss.id} value={boss.id}>
            {boss.title} ({boss.currentHp} / {boss.maxHp} HP)
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
};

export default BossSelector;
