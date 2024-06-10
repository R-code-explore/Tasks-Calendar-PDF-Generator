const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Charger les données prédéfinies
const tasks = require('../data/tasks.json');
const teams = require('../data/teams.json');
const locations = require('../data/locations.json');

router.get('/', (req, res) => {
    res.render('index', { tasks, teams, locations });
});

router.post('/generate-pdf', async (req, res) => {
    const { month, tasks, team, location } = req.body;
    console.log('Received form data:', req.body);

    // Assurer que month est un tableau et analyser correctement les dates
    const monthDates = Array.isArray(month) ? month : [month];
    console.log('Month dates before parsing:', monthDates);

    const validDates = monthDates.map(dt => {
        const date = new Date(dt);
        if (isNaN(date)) {
            console.error('Invalid date:', dt);
        }
        return date;
    }).filter(dt => !isNaN(dt));

    console.log('Valid dates:', validDates);

    // Gérer si aucune date valide n'est présente
    if (validDates.length === 0) {
        return res.status(400).send("Invalid dates provided.");
    }

    const monthStartDate = validDates[0];
    const year = monthStartDate.getFullYear();
    const monthNumber = monthStartDate.getMonth();

    // Générer toutes les dates du mois
    const dates = [];
    for (let day = 1; day <= new Date(year, monthNumber + 1, 0).getDate(); day++) {
        dates.push(new Date(year, monthNumber, day));
    }

    console.log('Generated dates:', dates);

    res.render('calendar', {
        dates: dates,
        daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        tasks: tasks,
        team: team,
        location: location,
        month: validDates.map(date => date.toISOString().substring(0, 10))
    }, async (err, html) => {
        if (err) {
            console.error(err);
            return res.sendStatus(500);
        }

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