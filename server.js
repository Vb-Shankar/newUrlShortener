const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./client/shortUlr'); // Assuming ShortUrl model is in 'models' dir

const app = express();

// Connect to MongoDB using environment variable for better security
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/urlShortener';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('Error connecting to MongoDB:', err));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false })); // Handle form data

// Error handling middleware (optional but recommended) 
app.use((err, req, res, next) => {
  console.error(err.stack); // Log errors
  res.status(500).send('Something went wrong!'); // Generic error response
});

// Routes
app.get('/', async (req, res) => {
  try {
    const shortUrls = await ShortUrl.find();
    res.render('index', { shortUrls });
  } catch (err) {
    console.error(err); // Log errors
    res.status(500).send('Error fetching short URLs'); // User-friendly error response
  }
});

app.post('/shortUrls', async (req, res) => {
  try {
    const newShortUrl = new ShortUrl({ full: req.body.fullUrl });
    await newShortUrl.save();
    res.redirect('/');
  } catch (err) {
    console.error(err); // Log errors
    res.status(400).send('Invalid or duplicate URL'); // Handle bad requests
  }
});

app.get('/:shortUrl', async (req, res) => {
  try {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
    if (!shortUrl) {
      return res.status(404).send('Not found'); // Handle non-existent URLs
    }
    shortUrl.clicks++;
    await shortUrl.save();
    res.redirect(shortUrl.full);
  } catch (err) {
    console.error(err); // Log errors
    res.status(500).send('Error redirecting'); // Handle internal errors
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
