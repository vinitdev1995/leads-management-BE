const fs = require("fs-extra");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "db.json");

const readDB = async () => {
    const data = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(data);
};

const writeDB = async (data) => {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
};

exports.getAllLeads = async (req, res) => {
    try {

        const db = await readDB();
        res.json(db.leads);
    } catch (error) {
        res.status(500).json({ message: "Error fetching leads", error: error.message });
    }
};

exports.createLead = async (req, res) => {
    try {
        const db = await readDB();

        const newLead = {
            id: uuidv4(),
            name: req.body.name,
            company: req.body.company,
            email: req.body.email,
            status: req.body.status || "Active",
        };

        db.leads.push(newLead);
        await writeDB(db);

        res.status(201).json({ message: "Lead added", lead: newLead });
    } catch (error) {
        res.status(400).json({ message: "Error creating lead", error: error.message });
    }
};

exports.updateLead = async (req, res) => {
    try {
        const db = await readDB();
        const id = req.params.id;

        const index = db.leads.findIndex((l) => l.id === id);

        if (index === -1) {
            return res.status(404).json({ message: "Lead not found" });
        }

        db.leads[index] = {
            ...db.leads[index],
            ...req.body,
        };

        await writeDB(db);

        res.json({ message: "Lead updated", lead: db.leads[index] });
    } catch (error) {
        res.status(400).json({ message: "Error updating lead", error: error.message });
    }
};

exports.deleteLead = async (req, res) => {
    try {
        const db = await readDB();
        const id = req.params.id;

        const initialLength = db.leads.length;
        db.leads = db.leads.filter(lead => lead.id !== id);

        if (db.leads.length === initialLength) {
            return res.status(404).json({ message: "Lead not found" });
        }

        await writeDB(db);

        res.json({ message: "Lead deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting lead", error: error.message });
    }
};
