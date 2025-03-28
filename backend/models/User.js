import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    username: {
        type: String,
        unique: true,
        sparse: true,
        default: function() {
            return this.email ? this.email.split('@')[0] : null;
        }
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId; // Password richiesta solo se non c'è googleId
        }
    },
    profilePicture: {
        type: String,
        default: ''
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true
    }
}, {
    timestamps: true
});

// Aggiunto pre-save hook per debug
userSchema.pre('save', function(next) {
    console.log('Pre save hook utente:', this);
    next();
});

const User = mongoose.model('User', userSchema);

export default User; 