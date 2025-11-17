const express = require('express');
const cors = require('cors');
const path = require('path');
const leadsRoutes = require('./routes/leads');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
    origin: function (origin, callback) {
        callback(null, origin || "*");    
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/leads', leadsRoutes);
app.use('/api/auth', authRoutes);

// if (process.env.NODE_ENV === 'production') {
//     app.use(express.static(path.join(__dirname, '../client/build')));

//     app.get(/.*/, (req, res) => {
//         res.sendFile(path.join(__dirname, '../client/build/index.html'));
//     });
// }

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});