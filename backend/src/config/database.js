const mongoose = require('mongoose');

const connectDB=  async () => {
    await mongoose.connect(
      "mongodb+srv://namastenode:o9LI9i29hVFsNf96@cluster0.r1glefv.mongodb.net/devTinder"
    );
}


module.exports = {connectDB};


