import React, { useState, useEffect } from 'react';
import '../style/Bisnis.css'
import '../style/Listing.css';

const Bisnis = ({ onHoursChange }) => {
  const [hours, setHours] = useState([
    { day: 'Monday', start: '09:00 AM', end: '05:00 PM' },
    { day: 'Tuesday', start: '09:00 AM', end: '05:00 PM' },
    { day: 'Wednesday', start: '09:00 AM', end: '05:00 PM' },
    { day: 'Thursday', start: '09:00 AM', end: '05:00 PM' },
  ]);

  const [newDay, setNewDay] = useState('');
  const [newStart, setNewStart] = useState('09:00 AM');
  const [newEnd, setNewEnd] = useState('05:00 PM');
  const [is24Hours, setIs24Hours] = useState(false);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeOptions = [
    '12:00 AM', '01:00 AM', '02:00 AM', '03:00 AM', '04:00 AM', '05:00 AM',
    '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM',
  ];

  const isDayAlreadyAdded = (day) => {
    return hours.some(hour => hour.day === day);
  };

  const getNextAvailableDay = () => {
    return daysOfWeek.find(day => !isDayAlreadyAdded(day)) || '';
  };

  const addHours = () => {
    if (isDayAlreadyAdded(newDay)) {
      alert("This day is already added!");
      return;
    }
    
    const newHours = is24Hours
      ? [...hours, { day: newDay, start: '12:00 AM', end: '11:59 PM' }]
      : [...hours, { day: newDay, start: newStart, end: newEnd }];
    
    setHours(newHours);
    onHoursChange(newHours);  // Update parent component state
  };

  const removeHours = (index) => {
    const newHours = hours.filter((_, i) => i !== index);
    setHours(newHours);
    onHoursChange(newHours);  // Update parent component state
  };

  const handleIs24HoursChange = (e) => {
    setIs24Hours(e.target.checked);
    if (e.target.checked) {
      setNewStart('12:00 AM');
      setNewEnd('11:59 PM');
    }
  };    

  useEffect(() => {
    setNewDay(getNextAvailableDay());
  }, [hours]);

  useEffect(() => {
    onHoursChange(hours);  // Initialize parent component state
  }, []);

  return (
    <div>
      <h1 className='Primary'>Business Hours</h1>
      <div className="hours-list">
        <hr className="custom-hr" />
        {hours.map((hour, index) => (
          <div key={index} className="day-row">
            <span className="day">{hour.day}</span>
            <span className="time">{hour.start} - {hour.end}</span>
            <button className="remove-btn" onClick={() => removeHours(index)}>×</button>
          </div>
        ))}
      </div>
      <div className="add-hours">
        <select 
          className="day-select" 
          value={newDay} 
          onChange={(e) => setNewDay(e.target.value)}
        >
          {daysOfWeek.filter(day => !isDayAlreadyAdded(day)).map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
        <select 
          className="time-select" 
          value={newStart} 
          onChange={(e) => setNewStart(e.target.value)}
          disabled={is24Hours}
        >
          {timeOptions.map(time => (
            <option key={time} value={time}>{time}</option>
          ))}
        </select>
        <select 
          className="time-select" 
          value={newEnd} 
          onChange={(e) => setNewEnd(e.target.value)}
          disabled={is24Hours}
        >
          {timeOptions.map(time => (
            <option key={time} value={time}>{time}</option>
          ))}
        </select>
        <div className="checkbox-container">
          <input 
            type="checkbox" 
            id="24hours" 
            checked={is24Hours}
            onChange={handleIs24HoursChange}
          />
          <label htmlFor="24hours">24 Hours</label>
        </div>
        <button className="add-btn" onClick={addHours}>+</button>
      </div>
    </div>
  );
};

export default Bisnis;