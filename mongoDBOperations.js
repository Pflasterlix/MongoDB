const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Verbindung zur MongoDB-Datenbank herstellen
mongoose.connect('mongodb://localhost:27017/myapp', { useNewUrlParser: true, useUnifiedTopology: true });

// Überprüfen, ob die Verbindung erfolgreich hergestellt wurde
mongoose.connection.on('connected', () => {
    console.log('MongoDB verbunden');
});

// Überprüfen, ob Fehler bei der Verbindung auftreten
mongoose.connection.on('error', (err) => {
    console.error('MongoDB-Verbindungsfehler:', err);
});

// Schema für Benutzerprofile
const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number },
    address: { type: String }
});

// Schema für Produkte
const productSchema = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, min: 0 }
});

// Schema für Postings
const postSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User' }
});

// Schema für Kommentare
const commentSchema = new Schema({
    content: { type: String, required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post' }
});

// Schema für Bestellungen
const orderSchema = new Schema({
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    total: { type: Number, required: true }
});

// Soft-Delete-Feature für Benutzer
userSchema.virtual('deleted').get(function() {
    return this.deletedAt !== null;
});

userSchema.pre('findOneAndUpdate', function(next) {
    this.set({ deletedAt: Date.now() });
    next();
});

// Modelle für die Schemas erstellen
const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Post = mongoose.model('Post', postSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Order = mongoose.model('Order', orderSchema);

// Einfügeoperation für neue Benutzer implementieren
async function insertUser() {
    // Neuen Benutzer erstellen
    const newUser = new User({
        username: 'exampleUser',
        email: 'user@example.com',
        age: 25,
        address: '123 Beispielstraße, Stadt, Land'
    });

    try {
        // Benutzer speichern
        const savedUser = await newUser.save();
        console.log('Neuer Benutzer hinzugefügt:', savedUser);
    } catch (error) {
        console.error('Fehler beim Hinzufügen des Benutzers:', error);
    }
}

// Benutzer nach Namen suchen
async function findUserByUsername(username) {
    try {
        const user = await User.findOne({ username });
        console.log('Gefundener Benutzer:', user);
    } catch (error) {
        console.error('Fehler beim Suchen des Benutzers:', error);
    }
}

// Update-Operation für Benutzerdaten
async function updateUserByUsername(username, updates) {
    try {
        const result = await User.updateOne({ username }, updates);
        console.log('Benutzer aktualisiert:', result);
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Benutzers:', error);
    }
}

// Benutzer anhand ihrer ID löschen
async function deleteUserById(userId) {
    try {
        const result = await User.findByIdAndDelete(userId);
        console.log('Benutzer gelöscht:', result);
    } catch (error) {
        console.error('Fehler beim Löschen des Benutzers:', error);
    }
}

// Hauptfunktion zum Ausführen der Operationen
async function main() {
    await insertUser();
    await findUserByUsername('exampleUser');
    await updateUserByUsername('exampleUser', { age: 26 });
    // Annahme: userId muss definiert werden
    // await deleteUserById(userId);
    // Weitere Operationen hier einfügen...
}

// Hauptfunktion aufrufen
main()
    .then(() => {
        console.log('Alle Operationen abgeschlossen');
        mongoose.disconnect(); // Verbindung zur Datenbank trennen, wenn alle Operationen abgeschlossen sind
    })
    .catch((error) => {
        console.error('Ein Fehler ist aufgetreten:', error);
        mongoose.disconnect(); // Bei Fehlern auch die Verbindung trennen
    });