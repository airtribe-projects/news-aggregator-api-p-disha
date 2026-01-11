const users = require('../models/user');

exports.getPreferences = (req, res) => {
    const user = users.find(u => u.email === req.user.email);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ preferences: user.preferences });
};

exports.updatePreferences = (req, res) => {
    const { preferences } = req.body;
    const user = users.find(u => u.email === req.user.email);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    user.preferences = preferences;
    res.status(200).json({ message: 'Preferences updated', preferences: user.preferences });
};
