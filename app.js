const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const { body, validationResult, check } = require('express-validator');
const methodOverride = require('method-override');
const app = express();
const port = 3000;
// Local
require('./utils/db');
const Quote = require('./models/quote');

// Setup flash
app.use(cookieParser('secret'));
app.use(session({
  cookie: { maxAge: 6000 },
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}));
app.use(flash());
// Setup method override
app.use(methodOverride('_method'));

// Setup EJS
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Home Page
app.get('/', (req, res) => {
  res.render('index', {
    layout: 'layouts/main-layout',
    name: 'Mohamad Fikri Abu Bakar',
    title: 'Halaman Home',
  });
});

// About Page
app.get('/about', (req, res, next) => {
  res.render('about', {
    layout: 'layouts/main-layout',
    title: 'Halaman About'
  });
});

// Quote Quote
app.get('/quote', async (req, res) => {
  const quotes = await Quote.find();
  res.render('quote', {
    layout: 'layouts/main-layout',
    title: 'Halaman Quote',
    quotes,
    msg: req.flash('msg'),
  });
})

// Add page
app.get('/quote/add', (req, res) => {
  res.render('add-quote', {
    layout: 'layouts/main-layout',
    title: 'Form Tambah Data Quote',
  });
});


// Process Add Quote
app.post('/quote', [
  body('name').custom(async (value) => {
    const duplikat = await Quote.findOne({ name: value });
    if (duplikat) {
      throw new Error('Name is taken.');
    }
    return true;
  }),
  body('quote').custom(async (value) => {
    if (!value) {
      throw new Error('Quote is required.');
    }
    return true;
  }),
  check('email', 'Email not valid!').isEmail(),
  check('nohp', 'No HP not valid!').isMobilePhone('id-ID'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('add-quote', {
      layout: 'layouts/main-layout',
      title: 'Form Tambah Data quote',
      errors: errors.array(),
    })
  } else {
    Quote.insertMany(req.body, (error, result) => {
      req.flash('msg', 'Data quote berhasil ditambahkan!');
      res.redirect('/quote');
    });
  }
});

// Process delete quote
// app.get('/quote/delete/:name', async (req, res) => {
//   const user = await Quote.findOne({ name: req.params.name });

//   if (!user) {
//     res.status(404);
//     res.send('<h1>404</h1>');
//   } else {
//     Quote.deleteOne({ _id: user._id }).then((result) => {
//       req.flash('msg', 'Data quote berhasil dihapus!');
//       res.redirect('/quote');
//     });
//   }
// });
app.delete('/quote', (req, res) => {
  Quote.deleteOne({ _id: req.body.id }).then((result) => {
    req.flash('msg', 'Data quote berhasil dihapus!');
    res.redirect('/quote');
  });
});

// Edit Page
app.get('/quote/edit/:name', async (req, res) => {
  const quote = await Quote.findOne({ name: req.params.name })

  res.render('edit-quote', {
    layout: 'layouts/main-layout',
    title: 'Form Ubah Data Contcat',
    quote,
  });
});


// Process Edit Quote
app.put('/quote', [
  body('name').custom(async (value, { req }) => {
    const duplikat = await Quote.findOne({ name: value });
    if (value !== req.body.oldNama && duplikat) {
      throw new Error('Name is taken.');
    }
    return true;
  }),
  check('email', 'Email not valid!').isEmail(),
  check('nohp', 'No HP not valid!').isMobilePhone('id-ID'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('edit-quote', {
      layout: 'layouts/main-layout',
      title: 'Form Edit Data Quote',
      errors: errors.array(),
      quote: req.body
    })
  } else {
    Quote.updateOne(
      { _id: req.body._id },
      {
        $set: {
          name: req.body.name,
          nohp: req.body.nohp,
          email: req.body.email,
          quote: req.body.quote,
        }
      }
    ).then((result) => {
      // flash message
      req.flash('msg', 'Data quote berhasil diubah!');
      res.redirect('/quote');
    });

  }

});

// Detail page
app.get('/quote/:name', async (req, res) => {
  const quote = await Quote.findOne({ name: req.params.name });
  res.render('detail', {
    layout: 'layouts/main-layout',
    title: 'Halaman Detail Quote',
    quote,
  });
});

app.listen(port, () => {
  console.log(`Mongo Quote App | Listening at http://localhost:${port}`);
});