import React, { useState } from 'react';
import './styles.css';
import CryptoJS from 'crypto-js';
import { saveAs } from 'file-saver';

const LostFortune = () => {
    const GOLD_PIECES = 900;
    const [adventurers, setAdventurers] = useState('');
    const [killed, setKilled] = useState('');
    const [leader, setLeader] = useState('');
    const [story, setStory] = useState('');
    const [records, setRecords] = useState([]);
    const [currentMaxGold, setCurrentMaxGold] = useState(0);
    const [currentLeader, setCurrentLeader] = useState('');
    const [originalRows, setOriginalRows] = useState([]);
    const [password, setPassword] = useState('mysecretpassword'); // Use a stronger and configurable password in real applications

    const handleSubmit = (event) => {
        event.preventDefault();
        const numAdventurers = parseInt(adventurers);
        const numKilled = parseInt(killed);
        const numSurvivors = numAdventurers - numKilled;
        const extraGold = GOLD_PIECES % numSurvivors;

        const newStory = `
            A brave group of ${numAdventurers} set out on a quest -- in search of the lost treasure of the Ancient Dwarves.
            The group was led by that legendary rogue, ${leader}.
            Along the way, a band of marauding ogres ambushed the party.
            All fought bravely under the command of ${leader}, and the ogres were defeated, but at a cost.
            Of the adventurers, ${numKilled} were vanquished, leaving just ${numSurvivors} in the group.
            The party was about to give up all hope.
            But while laying the deceased to rest, they stumbled upon the buried fortune.
            So the adventurers split ${GOLD_PIECES} gold pieces.
            ${leader} held on to the extra ${extraGold} pieces to keep things fair of course.
        `;

        setStory(newStory);

        const newRecord = { leader, adventurers: numAdventurers, killed: numKilled, extraGold };
        setRecords((prevRecords) => {
            const updatedRecords = [...prevRecords, newRecord];
            setOriginalRows(updatedRecords);
            return updatedRecords;
        });

        if (extraGold > currentMaxGold) {
            setCurrentMaxGold(extraGold);
            setCurrentLeader(leader);
        }
    };

    const sortTable = (columnIndex) => {
        const sortedRecords = [...records].sort((a, b) => {
            const cellA = Object.values(a)[columnIndex];
            const cellB = Object.values(b)[columnIndex];
            if (!isNaN(cellA) && !isNaN(cellB)) {
                return cellA - cellB;
            }
            return cellA.localeCompare(cellB);
        });
        setRecords(sortedRecords);
    };

    const resetTable = () => {
        setRecords(originalRows);
    };

    const saveToFile = () => {
        const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(records), password).toString();
        const blob = new Blob([encryptedData], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, 'records.txt');
    };

    const loadFromFile = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const encryptedData = e.target.result;
            try {
                const bytes = CryptoJS.AES.decrypt(encryptedData, password);
                const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                setRecords((prevRecords) => {
                    const updatedRecords = [...prevRecords, ...decryptedData];
                    setOriginalRows(updatedRecords);
                    return updatedRecords;
                });
            } catch (error) {
                alert('Error decrypting file. Please make sure you have the correct password.');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div id="records">
            <table id="records-table">
                <thead>
                    <tr>
                        <th>
                            Player Name
                            <button onClick={() => sortTable(0)}>Sort</button>
                        </th>
                        <th>
                            Adventurers
                            <button onClick={() => sortTable(1)}>Sort</button>
                        </th>
                        <th>
                            Adventurers Killed
                            <button onClick={() => sortTable(2)}>Sort</button>
                        </th>
                        <th>
                            Extra Gold
                            <button onClick={() => sortTable(3)}>Sort</button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((record, index) => (
                        <tr key={index}>
                            <td>{record.leader}</td>
                            <td>{record.adventurers}</td>
                            <td>{record.killed}</td>
                            <td>{record.extraGold}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p>Current Leader: <span id="leader-name">{currentLeader}</span></p>
            <button onClick={resetTable}>Reset to Original Order</button>
            <button onClick={saveToFile}>Save Results</button>
            <input type="file" id="load-file" onChange={loadFromFile} accept=".txt" />
            <div id="all-info">
                <h1>Welcome to Lost Fortune</h1>
                <p>Please enter the following for your personalized adventure:</p>
                <form id="adventure-form" onSubmit={handleSubmit}>
                    <label htmlFor="adventurers">Enter a number of adventurers:</label>
                    <input
                        type="number"
                        id="adventurers"
                        value={adventurers}
                        onChange={(e) => setAdventurers(e.target.value)}
                        required
                    /><br /><br />
                    <label htmlFor="killed">Enter a number, smaller than the first:</label>
                    <input
                        type="number"
                        id="killed"
                        value={killed}
                        onChange={(e) => setKilled(e.target.value)}
                        required
                    /><br /><br />
                    <label htmlFor="leader">Enter your last name:</label>
                    <input
                        type="text"
                        id="leader"
                        value={leader}
                        onChange={(e) => setLeader(e.target.value)}
                        required
                    /><br /><br />
                    <button type="submit">Start Adventure</button>
                </form>
                {story && (
                    <div id="story">
                        <h2>Your Adventure</h2>
                        <p id="story-content">{story}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LostFortune;
