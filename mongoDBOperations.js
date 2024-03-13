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

// 1. Ein Schema für Benutzerprofile erstellen
const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number },
    address: { type: String }
});

// 6. Ein Schema mit Validierungsregeln für Produktinformationen entwerfen
const productSchema = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, min: 0 }
});

// 11. Beziehungen zwischen zwei Schemata herstellen (z.B. Benutzer und ihre Postings)
const postSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User' }
});

// 15. Ein Schema für Kommentare mit Referenzen zu Postings erstellen
const commentSchema = new Schema({
    content: { type: String, required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post' }
});

// 19. Ein Schema für Bestellungen mit einem Array von Produkt-IDs entwerfen
const orderSchema = new Schema({
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    total: { type: Number, required: true }
});

// 21. Ein Soft-Delete-Feature implementieren, das Einträge nicht wirklich löscht
userSchema.virtual('deleted').get(function() {
    return this.deletedAt !== null;
});

userSchema.pre('findOneAndUpdate', function(next) {
    this.set({ deletedAt: Date.now() });
    next();
});

// Modell für Benutzerprofil
const User = mongoose.model('User', userSchema);

// Modell für Produkte
const Product = mongoose.model('Product', productSchema);

// Modell für Postings
const Post = mongoose.model('Post', postSchema);

// Modell für Kommentare
const Comment = mongoose.model('Comment', commentSchema);

// Modell für Bestellungen
const Order = mongoose.model('Order', orderSchema);

// 2. Eine Einfügeoperation für neue Benutzer implementieren
async function insertUser() {
    const newUser = new User({
        username: 'exampleUser',
        email: 'user@example.com',
        age: 25,
        address: '123 Beispielstraße, Stadt, Land'
    });

    try {
        const savedUser = await newUser.save();
        console.log('Neuer Benutzer hinzugefügt:', savedUser);
    } catch (error) {
        console.error('Fehler beim Hinzufügen des Benutzers:', error);
    }
}

// 3. Benutzer nach Namen suchen
async function findUserByUsername(username) {
    try {
        const user = await User.findOne({ username });
        console.log('Gefundener Benutzer:', user);
    } catch (error) {
        console.error('Fehler beim Suchen des Benutzers:', error);
    }
}

// 4. Eine Update-Operation schreiben, um Benutzerdaten zu aktualisieren
async function updateUserByUsername(username, updates) {
    try {
        const result = await User.updateOne({ username }, updates);
        console.log('Benutzer aktualisiert:', result);
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Benutzers:', error);
    }
}

// 5. Benutzer anhand ihrer ID löschen
async function deleteUserById(userId) {
    try {
        const result = await User.findByIdAndDelete(userId);
        console.log('Benutzer gelöscht:', result);
    } catch (error) {
        console.error('Fehler beim Löschen des Benutzers:', error);
    }
}

// Weitere Funktionen und Operationen hier hinzufügen...

// Beispielaufrufe für die obigen Funktionen (kannst du anpassen oder erweitern)
async function main() {
    await insertUser();
    await findUserByUsername('exampleUser');
    await updateUserByUsername('exampleUser', { age: 26 });
    // Annahme: userId muss definiert werden
    // await deleteUserById(userId);
    // Weitere Operationen hier einfügen...
}

// Hauptfunktion aufrufen, um den Code auszuführen
main()
    .then(() => {
        console.log('Alle Operationen abgeschlossen');
        mongoose.disconnect(); // Verbindung zur Datenbank trennen, wenn alle Operationen abgeschlossen sind
    })
    .catch((error) => {
        console.error('Ein Fehler ist aufgetreten:', error);
        mongoose.disconnect(); // Bei Fehlern auch die Verbindung trennen
    });