// Migration script: convert absolute uploads URLs in listings to relative '/uploads/filename'
// Usage: node scripts/migrate_image_paths.js

const mongoose = require('mongoose');
const Listing = require('../models/Listing');
require('dotenv').config();

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/realestate';

async function run() {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to Mongo');

  const listings = await Listing.find({});
  let changed = 0;
  for (const l of listings) {
    let updated = false;
    if (Array.isArray(l.images) && l.images.length) {
      const newImgs = l.images.map(img => {
        if (typeof img === 'string' && img.match(/https?:\/\/[^/]+\/uploads\//i)) {
          updated = true;
          return img.replace(/https?:\/\/[^/]+(\/uploads\/.*)$/i, '$1');
        }
        return img;
      });
      if (updated) {
        l.images = newImgs;
      }
    }
    if (!updated && l.agentPhoto && typeof l.agentPhoto === 'string' && l.agentPhoto.match(/https?:\/\/[^/]+\/uploads\//i)) {
      l.agentPhoto = l.agentPhoto.replace(/https?:\/\/[^/]+(\/uploads\/.*)$/i, '$1');
      updated = true;
    }
    if (updated) {
      await l.save();
      changed++;
      console.log('Migrated', l._id.toString());
    }
  }

  console.log('Migration complete. Documents updated:', changed);
  mongoose.disconnect();
}

run().catch(err => {
  console.error('Migration error', err);
  mongoose.disconnect();
});
