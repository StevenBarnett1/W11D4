const express = require("express")
const router = express.Router()
const db = require('../db/models');
const csrf = require('csurf');
const asyncHandler = (handler) => (req, res, next) => handler(req, res, next).catch(next);
const csrfProtection = csrf({ cookie: true });
const { check, validationResult } = require('express-validator');

const bookValidators = [
  check('title')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Title')
    .isLength({ max: 255 })
    .withMessage('Title must not be more than 255 characters long'),
  check('author')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Author')
    .isLength({ max: 100 })
    .withMessage('Author must not be more than 100 characters long'),
  check('releaseDate')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Release Date')
    .isISO8601()
    .withMessage('Please provide a valid date for Release Date'),
  check('pageCount')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Page Count')
    .isInt({ min: 0 })
    .withMessage('Please provide a valid integer for Page Count'),
  check('publisher')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Publisher')
    .isLength({ max: 100 })
    .withMessage('Publisher must not be more than 100 characters long'),
];

router.get('/', async(req, res, next) => {
    try {
      const books = await db.Book.findAll({ order: [['title', 'ASC']] });
      res.render('book-list', { title: 'Books', books });
    } catch (err) {
      next(err);
    }
});

router.get("/book/add",csrfProtection,asyncHandler(async(req,res,next)=>{
  const book = db.Book.build()
  res.render("book-add",{
    title: 'Add Book',
    book,
    csrfToken: req.csrfToken(),
  })
}))
router.get("/book/edit/:id",csrfProtection,asyncHandler(async(req,res,next)=>{
  const bookId = parseInt(req.params.id, 10);
  const book = await db.Book.findByPk(bookId);
  res.render('book-edit', {
    title: 'Edit Book',
    book,
    csrfToken: req.csrfToken(),
  });
}))
router.get("/book/delete/:id",csrfProtection,asyncHandler(async(req,res,next)=>{
  const bookId = parseInt(req.params.id, 10);
  const book = await db.Book.findByPk(bookId);
  res.render('book-delete', {
    title: 'Delete Book',
    book,
    csrfToken: req.csrfToken(),
  });
}))
router.post("/book/add", csrfProtection, bookValidators, asyncHandler(async(req,res,next)=>{
  const {
    title,
    author,
    releaseDate,
    pageCount,
    publisher,
  } = req.body;
  console.log(req.body)

  const book = db.Book.build({
    title,
    author,
    releaseDate,
    pageCount,
    publisher,
  });

  const validatorErrors = validationResult(req);

  if (validatorErrors.isEmpty()) {
    await book.save();
    res.redirect('/');
  } else {
    const errors = validatorErrors.array().map((error) => error.msg);
    res.render('book-add', {
      title: 'Add Book',
      book,
      errors,
      csrfToken: req.csrfToken(),
    });
  }
}));


router.post("/book/edit/:id",csrfProtection, bookValidators, asyncHandler(async(req,res,next)=>{
  const bookId = parseInt(req.params.id, 10);
  const bookToUpdate = await db.Book.findByPk(bookId);

  const {
    title,
    author,
    releaseDate,
    pageCount,
    publisher,
  } = req.body;

  const book = {
    title,
    author,
    releaseDate,
    pageCount,
    publisher,
  };

  const validatorErrors = validationResult(req);

  if (validatorErrors.isEmpty()) {
    await bookToUpdate.update(book);
    res.redirect('/');
  } else {
    const errors = validatorErrors.array().map((error) => error.msg);
    res.render('book-edit', {
      title: 'Edit Book',
      book: { ...book, id: bookId },
      errors,
      csrfToken: req.csrfToken(),
    });
  }
}))
router.post("/book/delete/:id",csrfProtection,asyncHandler(async(req,res,next)=>{
  const bookId = parseInt(req.params.id, 10);
  const book = await db.Book.findByPk(bookId);
  await book.destroy();
  res.redirect('/');
}))




module.exports = router
