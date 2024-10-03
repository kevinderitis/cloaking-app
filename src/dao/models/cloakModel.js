import mongoose from 'mongoose';

const cloakSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    whitePage: {
        type: String,
        required: true
    },
    blackPage: {
        type: String,
        required: true
    },
    allowedCountries: {
        type: [String]
    },
    filteredBots: {
        type: [String]
    },
    userId: {
        type: String,
        required: true
    }
});

const Cloak = mongoose.model('Cloak', cloakSchema);

export default Cloak;