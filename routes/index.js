const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Load predefined data
const tasks = require('../data/tasks.json');
const teams = require('../data/teams.json');
const locations = require('../data/locations.json');

router.get('/', (req, res) => {
    res.render('index', { tasks, teams, locations });
});

router.post('/generate-pdf', async (req, res) => {
    const { month, tasks, team, location } = req.body;
    console.log('Received form data:', month, tasks, team, location);
    
    // Make sure that month is an array and parse date correctly
    const monthDates = Array.isArray(month) ? month : [month];
    const validDates = monthDates.map(dt => new Date(dt)).filter(dt => !isNaN(dt));

    // Handle if no valid dates present
    if (validDates.length === 0) {
        return res.status(400).send("Invalid dates provided.");
    }

    const monthStartDate = validDates[0];

    // Correct year and month selection format
    const year = monthStartDate.getFullYear();
    const monthNumber = monthStartDate.getMonth();

    // Generate all dates within the month
    const dates = [];
    for (let day = 1; day <= new Date(year, monthNumber + 1, 0).getDate(); day++) {
        dates.push(new Date(year, monthNumber, day));
    }
    console.log('Generated dates:', dates);

    // Render HTML template
    res.render('calendar', {
        dates: dates,
        daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        tasks: tasks,
        team: team,
        location: location,
        month: validDates.map(date => date.toISOString().substring(0, 10))  // Ensure valid dates in ISO format
    }, async (err, html) => {
        if (err) {
            console.error(err);
            return res.sendStatus(500);
        }
        // Convert HTML to PDF
        try {
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox'],
                timeout: 60000
            });
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });
            const pdf = await page.pdf({ format: 'A4' });
            await browser.close();

            const filePath = path.join(__dirname, '../public/calendars/calendar.pdf');
            fs.writeFileSync(filePath, pdf);
            res.download(filePath);
        } catch (err) {
            console.error('Error generating PDF:', err);
            res.sendStatus(500);
        }
    });
});

module.exports = router;