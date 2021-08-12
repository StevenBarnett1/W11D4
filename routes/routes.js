const express = require("express")
const router = express.Router()
const db = require('../db/models');
const csrf = require('csurf');
const asyncHandler = (handler) => (req, res, next) => handler(req, res, next).catch(next);
const csrfProtection = csrf({ cookie: true });

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
  res.render("book-edit")
}))
router.get("/book/delete/:id",csrfProtection,asyncHandler(async(req,res,next)=>{
  res.render("book-delete")
}))
router.post("/book/add",csrfProtection,asyncHandler(async(req,res,next)=>{
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

  try {
    await book.save();
    res.redirect('/');
  } catch (err) {
    res.render('book-add', {
      title: 'Add Book',
      book,
      error: err,
      csrfToken: req.csrfToken(),
    });
  }
}))
router.post("/book/edit/:id",csrfProtection,asyncHandler(async(req,res,next)=>{
  res.render("book-add")
}))
router.post("/book/delete/:id",csrfProtection,asyncHandler(async(req,res,next)=>{
  res.render("book-add")
}))
module.exports = router
